# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome extension (Manifest V3) that implements MRU (Most Recently Used) tab switching, similar to Ctrl+Tab behavior in IDEs like Rider or VS Code.

## Rules

**Git — НЕ делать самостоятельно:**
- НЕ делать `git commit` без явного запроса пользователя
- НЕ делать `git push` без явного запроса пользователя
- НЕ делать `git add -A` или `git add .` без запроса

Коммиты и пуши — только по явной команде пользователя.

## Architecture

**Service Worker** (`background.js`):
- MRU stack (`tabStack[]`) — array of `{tabId, windowId}`, persisted to `chrome.storage.local`
- `tabStack[0]` = current active tab, `tabStack[1]` = previous tab
- Handles commands via `chrome.commands.onCommand`
- Communicates with popups via `chrome.runtime.onMessage`
- Settings stored in `chrome.storage.local`
- Debounced save (500ms) to avoid excessive writes

**UI Components**:
- `popup.html/js/css` — Settings popup (click on extension icon)
- `mru-popup.html/js/css` — Tab list popup with search/filter, closes on blur

**Key APIs used**: `chrome.tabs`, `chrome.windows`, `chrome.commands`, `chrome.storage`

## Development

### Load extension for testing
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → select project folder

### Keyboard shortcuts
Configured in `manifest.json` under `commands`. Users can customize at `chrome://extensions/shortcuts`

Default shortcuts:
| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Quick switch | `Ctrl+Q` | `Control+Q` |
| MRU popup | `Ctrl+Shift+Q` | `Control+Shift+Q` |

**Note**: macOS uses `Control` (not `Command`) because `Command+Q` quits applications.

### Regenerate icons
```powershell
powershell -ExecutionPolicy Bypass -File create-icons.ps1
```

## Settings Schema

```javascript
{
  quickSwitchEnabled: boolean,      // Ctrl+Q functionality
  mruPopupEnabled: boolean,         // Ctrl+Shift+Q functionality
  autoSwitchOnCloseEnabled: boolean, // Switch to MRU tab on active tab close
  showPopupOnQuickSwitch: boolean,  // Show popup on Ctrl+Q (default: false)
  holdModeEnabled: boolean          // Hold Ctrl + multiple Q (default: false)
}
```

## Message Protocol (popup ↔ background)

| Message Type | Direction | Purpose |
|--------------|-----------|---------|
| `getMRUTabs` | popup → bg | Get MRU tabs + all other open tabs |
| `switchToTab` | popup → bg | Switch to specific tab |
| `getSettings` | popup → bg | Load current settings |
| `updateSettings` | popup → bg | Save settings change |
