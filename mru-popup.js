// Last Tab MRU Popup

let tabs = [];
let selectedIndex = 0;

document.addEventListener('DOMContentLoaded', async () => {
  const tabList = document.getElementById('tabList');

  // Load MRU tabs from background
  chrome.runtime.sendMessage({ type: 'getMRUTabs', limit: 10 }, (response) => {
    if (response && response.tabs) {
      // Filter out the MRU popup itself
      tabs = response.tabs.filter(tab => !tab.url.includes('mru-popup.html'));
      renderTabs();

      // Pre-select first tab (which is actually the current one, so select second)
      if (tabs.length > 1) {
        selectedIndex = 1;
        updateSelection();
      }
    } else {
      tabList.innerHTML = '<div class="empty">No recent tabs</div>';
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', handleKeydown);
});

function renderTabs() {
  const tabList = document.getElementById('tabList');

  if (tabs.length === 0) {
    tabList.innerHTML = '<div class="empty">No recent tabs</div>';
    return;
  }

  tabList.innerHTML = tabs.map((tab, index) => `
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
  `).join('');

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
    case 'Tab':
      e.preventDefault();
      if (e.shiftKey && e.key === 'Tab') {
        moveSelection(-1);
      } else {
        moveSelection(1);
      }
      break;

    case 'ArrowUp':
      e.preventDefault();
      moveSelection(-1);
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
