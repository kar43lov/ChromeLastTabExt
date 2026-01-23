// Last Tab MRU Popup

let allTabs = [];  // Original list
let tabs = [];     // Filtered list
let selectedIndex = 0;

document.addEventListener('DOMContentLoaded', async () => {
  const tabList = document.getElementById('tabList');
  const searchInput = document.getElementById('searchInput');

  // Load MRU tabs from background
  chrome.runtime.sendMessage({ type: 'getMRUTabs', limit: 20 }, (response) => {
    if (response && response.tabs) {
      // Filter out the MRU popup itself
      allTabs = response.tabs.filter(tab => !tab.url.includes('mru-popup.html'));
      tabs = [...allTabs];
      renderTabs();

      // Pre-select second tab (first is current)
      if (tabs.length > 1) {
        selectedIndex = 1;
        updateSelection();
      }
    } else {
      tabList.innerHTML = '<div class="empty">No recent tabs</div>';
    }
  });

  // Search/filter handler
  searchInput.addEventListener('input', () => {
    filterTabs(searchInput.value);
  });

  // Keyboard navigation
  document.addEventListener('keydown', handleKeydown);

  // Close on focus loss (clicking outside, switching windows)
  window.addEventListener('blur', () => {
    window.close();
  });
});

function filterTabs(query) {
  const q = query.toLowerCase().trim();

  if (!q) {
    tabs = [...allTabs];
  } else {
    tabs = allTabs.filter(tab => {
      const title = (tab.title || '').toLowerCase();
      const url = (tab.url || '').toLowerCase();
      return title.includes(q) || url.includes(q);
    });
  }

  selectedIndex = 0;
  renderTabs();
  updateSelection();
}

function renderTabs() {
  const tabList = document.getElementById('tabList');
  const searchQuery = document.getElementById('searchInput').value.trim();

  if (tabs.length === 0) {
    tabList.innerHTML = '<div class="empty">No matching tabs</div>';
    return;
  }

  // Find where MRU tabs end and other tabs begin
  const firstNonMruIndex = tabs.findIndex(t => !t.isMRU);
  const hasBothSections = firstNonMruIndex > 0 && firstNonMruIndex < tabs.length;

  let html = '';
  tabs.forEach((tab, index) => {
    // Add separator between MRU and other tabs (only if not searching)
    if (!searchQuery && hasBothSections && index === firstNonMruIndex) {
      html += '<div class="section-divider">All Tabs</div>';
    }

    html += `
      <div class="tab-item ${index === selectedIndex ? 'selected' : ''}" data-index="${index}">
        ${tab.favIconUrl
          ? `<img class="tab-favicon" src="${escapeHtml(tab.favIconUrl)}" alt="" onerror="this.classList.add('placeholder'); this.src='';">`
          : '<div class="tab-favicon placeholder"></div>'
        }
        <div class="tab-info">
          <div class="tab-title">${escapeHtml(tab.title)}</div>
          <div class="tab-url">${escapeHtml(formatUrl(tab.url))}</div>
        </div>
      </div>
    `;
  });

  tabList.innerHTML = html;

  // Add click handlers
  tabList.querySelectorAll('.tab-item').forEach(item => {
    item.addEventListener('click', () => {
      const index = parseInt(item.dataset.index, 10);
      selectTab(index);
    });
  });
}

function updateSelection() {
  const items = document.querySelectorAll('.tab-item');
  items.forEach((item, index) => {
    item.classList.toggle('selected', index === selectedIndex);
  });

  // Scroll into view if needed
  const selected = document.querySelector('.tab-item.selected');
  if (selected) {
    selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

function handleKeydown(e) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      moveSelection(1);
      break;

    case 'ArrowUp':
      e.preventDefault();
      moveSelection(-1);
      break;

    case 'Tab':
      e.preventDefault();
      if (e.shiftKey) {
        moveSelection(-1);
      } else {
        moveSelection(1);
      }
      break;

    case 'Enter':
      e.preventDefault();
      selectTab(selectedIndex);
      break;

    case 'Escape':
      e.preventDefault();
      window.close();
      break;
  }
}

function moveSelection(delta) {
  if (tabs.length === 0) return;

  selectedIndex = (selectedIndex + delta + tabs.length) % tabs.length;
  updateSelection();
}

function selectTab(index) {
  const tab = tabs[index];
  if (!tab) return;

  chrome.runtime.sendMessage({
    type: 'switchToTab',
    tabId: tab.id,
    windowId: tab.windowId
  }, () => {
    window.close();
  });
}

// Utility functions
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    // Show just the hostname for cleaner display
    return parsed.hostname + (parsed.pathname !== '/' ? parsed.pathname : '');
  } catch {
    return url;
  }
}
