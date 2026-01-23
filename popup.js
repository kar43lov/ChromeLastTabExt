// Last Tab Settings Popup

document.addEventListener('DOMContentLoaded', async () => {
  const quickSwitchToggle = document.getElementById('quickSwitchEnabled');
  const mruPopupToggle = document.getElementById('mruPopupEnabled');
  const autoSwitchToggle = document.getElementById('autoSwitchOnCloseEnabled');
  const holdModeToggle = document.getElementById('holdModeEnabled');
  const showPopupToggle = document.getElementById('showPopupOnQuickSwitch');
  const showPopupSetting = document.getElementById('showPopupSetting');
  const shortcutsLink = document.getElementById('shortcutsLink');

  // Update showPopup toggle state based on holdMode
  function updateShowPopupState(holdModeEnabled) {
    if (holdModeEnabled) {
      // Enable the setting
      showPopupSetting.classList.remove('disabled');
      showPopupToggle.disabled = false;
    } else {
      // Disable and uncheck the setting
      showPopupSetting.classList.add('disabled');
      showPopupToggle.disabled = true;
      showPopupToggle.checked = false;
      // Save the unchecked state
      chrome.runtime.sendMessage({
        type: 'updateSettings',
        settings: { showPopupOnQuickSwitch: false }
      });
    }
  }

  // Load current settings
  chrome.runtime.sendMessage({ type: 'getSettings' }, (response) => {
    if (response && response.settings) {
      quickSwitchToggle.checked = response.settings.quickSwitchEnabled;
      mruPopupToggle.checked = response.settings.mruPopupEnabled;
      autoSwitchToggle.checked = response.settings.autoSwitchOnCloseEnabled;
      holdModeToggle.checked = response.settings.holdModeEnabled || false;
      showPopupToggle.checked = response.settings.showPopupOnQuickSwitch || false;

      // Apply initial state
      updateShowPopupState(holdModeToggle.checked);
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

  holdModeToggle.addEventListener('change', () => {
    const enabled = holdModeToggle.checked;

    chrome.runtime.sendMessage({
      type: 'updateSettings',
      settings: { holdModeEnabled: enabled }
    });

    // Update showPopup state
    updateShowPopupState(enabled);

    // If enabling hold mode, also enable showPopup by default
    if (enabled) {
      showPopupToggle.checked = true;
      chrome.runtime.sendMessage({
        type: 'updateSettings',
        settings: { showPopupOnQuickSwitch: true }
      });
    }
  });

  showPopupToggle.addEventListener('change', () => {
    chrome.runtime.sendMessage({
      type: 'updateSettings',
      settings: { showPopupOnQuickSwitch: showPopupToggle.checked }
    });
  });

  // Open shortcuts page
  shortcutsLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });
});
