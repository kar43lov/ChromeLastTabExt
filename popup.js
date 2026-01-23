// Last Tab Settings Popup

document.addEventListener('DOMContentLoaded', async () => {
  const quickSwitchToggle = document.getElementById('quickSwitchEnabled');
  const mruPopupToggle = document.getElementById('mruPopupEnabled');
  const autoSwitchToggle = document.getElementById('autoSwitchOnCloseEnabled');
  const shortcutsLink = document.getElementById('shortcutsLink');

  // Load current settings
  chrome.runtime.sendMessage({ type: 'getSettings' }, (response) => {
    if (response && response.settings) {
      quickSwitchToggle.checked = response.settings.quickSwitchEnabled;
      mruPopupToggle.checked = response.settings.mruPopupEnabled;
      autoSwitchToggle.checked = response.settings.autoSwitchOnCloseEnabled;
    }
  });

  // Save settings on toggle
  quickSwitchToggle.addEventListener('change', () => {
    chrome.runtime.sendMessage({
      type: 'updateSettings',
      settings: { quickSwitchEnabled: quickSwitchToggle.checked }
    });
  });

  mruPopupToggle.addEventListener('change', () => {
    chrome.runtime.sendMessage({
      type: 'updateSettings',
      settings: { mruPopupEnabled: mruPopupToggle.checked }
    });
  });

  autoSwitchToggle.addEventListener('change', () => {
    chrome.runtime.sendMessage({
      type: 'updateSettings',
      settings: { autoSwitchOnCloseEnabled: autoSwitchToggle.checked }
    });
  });

  // Open shortcuts page
  shortcutsLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });
});
