# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome extension (Manifest V3) that implements MRU (Most Recently Used) tab switching, similar to Ctrl+Tab behavior in IDEs like Rider or VS Code.

## Architecture

**Service Worker** (`background.js`):
- Maintains in-memory MRU stack (`tabStack[]`) — array of `{tabId, windowId}`
- `tabStack[0]` = current active tab, `tabStack[1]` = previous tab
- Handles commands via `chrome.commands.onCommand`
- Communicates with popups via `chrome.runtime.onMessage`
- Settings stored in `chrome.storage.local`

**UI Components**:
- `popup.html/js/css` — Settings popup (click on extension icon)
- `mru-popup.html/js/css` — Tab list popup (opened via hotkey as separate window)

**Key APIs used**: `chrome.tabs`, `chrome.windows`, `chrome.commands`, `chrome.storage`

## Development

### Load extension for testing
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → select project folder

### Keyboard shortcuts
Configured in `manifest.json` under `commands`. Users can customize at `chrome://extensions/shortcuts`

Default shortcuts:
- `Ctrl+Q` — Quick switch to previous tab
- `Ctrl+Shift+Q` — Show MRU popup

### Regenerate icons
```powershell
powershell -ExecutionPolicy Bypass -File create-icons.ps1
```

## Settings Schema

```javascript
{
  quickSwitchEnabled: boolean,      // Ctrl+Q functionality
  mruPopupEnabled: boolean,         // Ctrl+Shift+Q functionality
  autoSwitchOnCloseEnabled: boolean // Switch to MRU tab on active tab close
}
```

## Message Protocol (popup ↔ background)

| Message Type | Direction | Purpose |
|--------------|-----------|---------|
| `getMRUTabs` | popup → bg | Get list of recent tabs |
| `switchToTab` | popup → bg | Switch to specific tab |
| `getSettings` | popup → bg | Load current settings |
| `updateSettings` | popup → bg | Save settings change |
