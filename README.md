# Last Tab

Chrome extension for MRU (Most Recently Used) tab switching — like Ctrl+Tab in IDEs (Rider, VS Code, WebStorm).

## Features

- **Quick Switch** (Ctrl+Q) — instantly switch to the previous tab
- **Ping-pong navigation** — double press returns you back (great for comparing pages)
- **Hold Mode** — hold Ctrl and press Q multiple times to go deeper in history
- **MRU Popup** (Ctrl+Shift+Q) — shows recent tabs with search/filter
- **Cross-window** — switch between tabs in different Chrome windows
- **Auto-switch on close** — when closing active tab, jump to the previous one (optional)
- **Configurable** — enable/disable each feature independently

## Installation

### From source (Developer mode)

1. Clone or download this repository
2. Open `chrome://extensions/` in Chrome
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the project folder

### Customize shortcuts

Go to `chrome://extensions/shortcuts` to change default hotkeys.

## Usage

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Switch to previous tab | `Ctrl+Q` | `Control+Q` |
| Open MRU popup | `Ctrl+Shift+Q` | `Control+Shift+Q` |
| Open settings | Click extension icon | Click extension icon |

**Note**: On macOS, we use `Control` (not `Command`) because `Command+Q` is reserved for quitting applications. You can customize shortcuts at `chrome://extensions/shortcuts`.

### MRU Popup Features
- **Search/filter**: Start typing to filter tabs by title or URL
- **Keyboard navigation**: Arrow keys or Tab to navigate, Enter to select

### Settings

- **Quick Switch** — enable/disable Ctrl+Q
- **MRU Popup** — enable/disable Ctrl+Shift+Q
- **Auto-switch on close** — automatically switch to previous tab when closing active
- **Hold Mode** — hold Ctrl + press Q multiple times to navigate deeper in MRU
- **Show popup on Ctrl+Q** — show tab list popup during quick switch (requires Hold Mode)

## Why?

Chrome's default Ctrl+Tab cycles through tabs in order. This extension switches to the **last used** tab instead — perfect for quickly comparing two pages or jumping back to your previous context.

## Technical Details

- Manifest V3 (Service Worker)
- No external dependencies
- History stored in memory (resets on browser restart)
- Permissions: `tabs`, `storage`

## License

MIT
