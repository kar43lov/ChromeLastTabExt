// Last Tab Extension - Background Service Worker
// MRU (Most Recently Used) tab switching

// ============================================
// State
// ============================================

// MRU stack: tabStack[0] = current active tab, tabStack[1] = previous tab
let tabStack = [];

// Settings with defaults
const DEFAULT_SETTINGS = {
  quickSwitchEnabled: true,
  mruPopupEnabled: true,
  autoSwitchOnCloseEnabled: true,
  showPopupOnQuickSwitch: false,  // Show popup on Ctrl+Q (false = just switch)
  holdModeEnabled: false          // Hold Ctrl + multiple Q to go deeper (false = ping-pong only)
};

let settings = { ...DEFAULT_SETTINGS };

// Track MRU popup window
let mruPopupWindowId = null;

// ============================================
// MRU Stack Operations
// ============================================

// Debounced save to avoid excessive writes
let saveTimeout = null;
function saveStackDebounced() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    chrome.storage.local.set({ tabStack });
  }, 500);
}

function moveToTop(tabId, windowId) {
  // Remove if already exists
  tabStack = tabStack.filter(t => t.tabId !== tabId);
  // Add to front
  tabStack.unshift({ tabId, windowId });
  // Limit stack size
  if (tabStack.length > 100) {
    tabStack.pop();
  }
  // Persist to survive Service Worker sleep
  saveStackDebounced();
}

function removeFromStack(tabId) {
  const wasFirst = tabStack.length > 0 && tabStack[0].tabId === tabId;
  tabStack = tabStack.filter(t => t.tabId !== tabId);
  // Persist to survive Service Worker sleep
  saveStackDebounced();
  return wasFirst;
}

function getPreviousTab() {
  return tabStack.length > 1 ? tabStack[1] : null;
}

function getMRUTabs(limit = 10) {
  return tabStack.slice(0, limit);
}

// ============================================
// Tab Switching
// ============================================

async function switchToTab(tabId, windowId) {
  try {
    // Activate the tab
    await chrome.tabs.update(tabId, { active: true });

    // Focus the window if needed
    if (windowId) {
      await chrome.windows.update(windowId, { focused: true });
    }
  } catch (error) {
    console.error('Failed to switch tab:', error);
    // Tab might have been closed, remove from stack
    removeFromStack(tabId);
  }
}

async function quickSwitch() {
  if (!settings.quickSwitchEnabled) {
    return;
  }

  const previousTab = getPreviousTab();
  if (previousTab) {
    await switchToTab(previousTab.tabId, previousTab.windowId);
  }
}

// ============================================
// Event Listeners
// ============================================

// Track tab activation - always update MRU stack
chrome.tabs.onActivated.addListener((activeInfo) => {
  const { tabId, windowId } = activeInfo;
  moveToTop(tabId, windowId);
});

// Track tab removal
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  const wasActive = removeFromStack(tabId);

  // If auto-switch enabled and the closed tab was active, switch to previous in MRU
  if (settings.autoSwitchOnCloseEnabled && wasActive && tabStack.length > 0) {
    const nextTab = tabStack[0];
    // Small delay to let Chrome finish its default behavior
    setTimeout(async () => {
      await switchToTab(nextTab.tabId, nextTab.windowId);
    }, 50);
  }
});

// Track window removal - clean up tabs from closed windows
chrome.windows.onRemoved.addListener((windowId) => {
  tabStack = tabStack.filter(t => t.windowId !== windowId);
  saveStackDebounced();

  // Reset popup tracking if MRU popup was closed
  if (windowId === mruPopupWindowId) {
    mruPopupWindowId = null;
  }
});

// Handle keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'quick-switch') {
    if (!settings.quickSwitchEnabled) {
      return;
    }

    // If hold mode disabled and no popup shown - just do simple ping-pong switch
    if (!settings.holdModeEnabled && !settings.showPopupOnQuickSwitch) {
      await quickSwitch();
      return;
    }

    // Check if popup is already open (hold mode active)
    if (mruPopupWindowId !== null && settings.holdModeEnabled) {
      // Send message to popup to move selection down
      try {
        const windows = await chrome.windows.get(mruPopupWindowId);
        if (windows) {
          chrome.runtime.sendMessage({ type: 'moveSelectionDown' });
        }
      } catch {
        // Window closed, open new one
        mruPopupWindowId = null;
      }
      if (mruPopupWindowId !== null) return;
    }

    // Close existing popup if any
    if (mruPopupWindowId !== null) {
      try {
        await chrome.windows.remove(mruPopupWindowId);
      } catch {}
      mruPopupWindowId = null;
    }

    // Determine mode based on settings
    const popupMode = settings.holdModeEnabled ? 'hold' : 'quick';

    // If popup should be shown
    if (settings.showPopupOnQuickSwitch || settings.holdModeEnabled) {
      const popup = await chrome.windows.create({
        url: `mru-popup.html?mode=${popupMode}`,
        type: 'popup',
        width: 400,
        height: 450,
        focused: true
      });
      mruPopupWindowId = popup.id;
    } else {
      await quickSwitch();
    }

  } else if (command === 'show-mru-popup') {
    if (!settings.mruPopupEnabled) {
      return;
    }

    // Check if popup is already open
    if (mruPopupWindowId !== null) {
      try {
        await chrome.windows.remove(mruPopupWindowId);
      } catch {
        // Window already closed
      }
      mruPopupWindowId = null;
      return;
    }

    // Open MRU popup as a new window (browse mode)
    const popup = await chrome.windows.create({
      url: 'mru-popup.html?mode=browse',
      type: 'popup',
      width: 400,
      height: 450,
      focused: true
    });
    mruPopupWindowId = popup.id;
  }
});

// Handle messages from popups
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getMRUTabs') {
    (async () => {
      // Get MRU tabs first
      const mruEntries = getMRUTabs(message.limit || 20);
      const mruTabIds = new Set(mruEntries.map(e => e.tabId));

      // Get tab info for MRU list
      const mruTabs = await Promise.all(
        mruEntries.map(async (entry) => {
          try {
            const tab = await chrome.tabs.get(entry.tabId);
            return {
              id: tab.id,
              windowId: tab.windowId,
              title: tab.title || 'Untitled',
              url: tab.url || '',
              favIconUrl: tab.favIconUrl || '',
              isMRU: true
            };
          } catch {
            return null;
          }
        })
      );

      // Get all other open tabs not in MRU
      const allTabs = await chrome.tabs.query({});
      const otherTabs = allTabs
        .filter(tab => !mruTabIds.has(tab.id))
        .map(tab => ({
          id: tab.id,
          windowId: tab.windowId,
          title: tab.title || 'Untitled',
          url: tab.url || '',
          favIconUrl: tab.favIconUrl || '',
          isMRU: false
        }));

      // Combine: MRU first, then others
      const result = [
        ...mruTabs.filter(t => t !== null),
        ...otherTabs
      ];

      sendResponse({ tabs: result });
    })();

    return true; // Keep channel open for async response
  }

  if (message.type === 'switchToTab') {
    switchToTab(message.tabId, message.windowId).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'getSettings') {
    sendResponse({ settings });
    return false;
  }

  if (message.type === 'updateSettings') {
    settings = { ...settings, ...message.settings };
    chrome.storage.local.set({ settings });
    sendResponse({ success: true });
    return false;
  }
});

// ============================================
// Initialization
// ============================================

async function initialize() {
  // Load settings
  const stored = await chrome.storage.local.get(['settings', 'tabStack']);
  if (stored.settings) {
    settings = { ...DEFAULT_SETTINGS, ...stored.settings };
  }

  // Get all current tabs to validate saved stack
  const windows = await chrome.windows.getAll({ populate: true });
  const existingTabIds = new Set();
  const tabWindowMap = new Map();

  for (const window of windows) {
    if (window.tabs) {
      for (const tab of window.tabs) {
        existingTabIds.add(tab.id);
        tabWindowMap.set(tab.id, { tabId: tab.id, windowId: window.id, active: tab.active });
      }
    }
  }

  // Try to restore saved stack
  if (stored.tabStack && stored.tabStack.length > 0) {
    // Filter out tabs that no longer exist
    tabStack = stored.tabStack.filter(t => existingTabIds.has(t.tabId));

    // Add any new tabs not in saved stack
    for (const [tabId, tabInfo] of tabWindowMap) {
      if (!tabStack.some(t => t.tabId === tabId)) {
        if (tabInfo.active) {
          tabStack.unshift({ tabId, windowId: tabInfo.windowId });
        } else {
          tabStack.push({ tabId, windowId: tabInfo.windowId });
        }
      }
    }

    console.log('Last Tab: restored', tabStack.length, 'tabs from storage');
  } else {
    // Fresh start - initialize from current tabs
    for (const window of windows) {
      if (window.tabs) {
        for (const tab of window.tabs) {
          if (tab.active) {
            tabStack.unshift({ tabId: tab.id, windowId: window.id });
          } else {
            tabStack.push({ tabId: tab.id, windowId: window.id });
          }
        }
      }
    }
    console.log('Last Tab: initialized with', tabStack.length, 'tabs');
  }
}

// Run initialization
initialize();
