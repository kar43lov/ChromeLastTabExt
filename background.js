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
  autoSwitchOnCloseEnabled: true
};

let settings = { ...DEFAULT_SETTINGS };

// ============================================
// MRU Stack Operations
// ============================================

function moveToTop(tabId, windowId) {
  // Remove if already exists
  tabStack = tabStack.filter(t => t.tabId !== tabId);
  // Add to front
  tabStack.unshift({ tabId, windowId });
  // Limit stack size
  if (tabStack.length > 100) {
    tabStack.pop();
  }
}

function removeFromStack(tabId) {
  const wasFirst = tabStack.length > 0 && tabStack[0].tabId === tabId;
  tabStack = tabStack.filter(t => t.tabId !== tabId);
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
});

// Handle keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'quick-switch') {
    await quickSwitch();
  } else if (command === 'show-mru-popup') {
    if (!settings.mruPopupEnabled) {
      return;
    }
    // Open MRU popup as a new window
    chrome.windows.create({
      url: 'mru-popup.html',
      type: 'popup',
      width: 400,
      height: 450,
      focused: true
    });
  }
});

// Handle messages from popups
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getMRUTabs') {
    // Get tab info for MRU list
    const mruEntries = getMRUTabs(message.limit || 10);

    Promise.all(
      mruEntries.map(async (entry) => {
        try {
          const tab = await chrome.tabs.get(entry.tabId);
          return {
            id: tab.id,
            windowId: tab.windowId,
            title: tab.title || 'Untitled',
            url: tab.url || '',
            favIconUrl: tab.favIconUrl || ''
          };
        } catch {
          // Tab no longer exists
          return null;
        }
      })
    ).then((tabs) => {
      sendResponse({ tabs: tabs.filter(t => t !== null) });
    });

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
  const stored = await chrome.storage.local.get('settings');
  if (stored.settings) {
    settings = { ...DEFAULT_SETTINGS, ...stored.settings };
  }

  // Initialize stack with current tabs across all windows
  const windows = await chrome.windows.getAll({ populate: true });

  for (const window of windows) {
    if (window.tabs) {
      for (const tab of window.tabs) {
        if (tab.active) {
          // Active tabs go to front
          tabStack.unshift({ tabId: tab.id, windowId: window.id });
        } else {
          // Inactive tabs go to back
          tabStack.push({ tabId: tab.id, windowId: window.id });
        }
      }
    }
  }

  console.log('Last Tab extension initialized with', tabStack.length, 'tabs');
}

// Run initialization
initialize();
