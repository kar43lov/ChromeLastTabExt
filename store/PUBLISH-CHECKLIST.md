# Chrome Web Store Publishing Checklist

## Files Ready

- [x] `LastTab.zip` — Extension package (11 KB)
- [x] `description.txt` — Store description (copy-paste ready)
- [x] `privacy-policy.md` — Privacy policy

## Required Graphics

Before publishing, create these images:

### 1. Screenshots (required, at least 1)
**Size:** 1280x800 or 640x400 pixels

Suggested screenshots:
1. **Hold mode** — Show popup with tabs while Ctrl is held
2. **Search** — Show filtering tabs by typing
3. **Settings** — Show the settings popup

**How to capture:**
1. Open the extension popup (Ctrl+Shift+Q)
2. Use Windows Snipping Tool or ShareX
3. Resize to 1280x800

### 2. Extension Icon (already have)
- [x] 128x128 — `icons/icon128.png`

### 3. Promotional Images (optional but recommended)
- Small promo tile: 440x280 pixels
- Marquee: 1400x560 pixels

## Publishing Steps

### Step 1: Developer Account
1. Go to https://chrome.google.com/webstore/devconsole
2. Sign in with Google account
3. Pay $5 one-time registration fee
4. Complete developer profile

### Step 2: Create New Item
1. Click "New Item"
2. Upload `LastTab.zip`

### Step 3: Store Listing
Copy from `description.txt`:
- **Title:** Last Tab - MRU Tab Switcher
- **Summary:** (short description, 132 chars max)
- **Description:** (detailed description)
- **Category:** Productivity
- **Language:** English

### Step 4: Graphics
1. Upload screenshots (1280x800)
2. Icon is auto-extracted from package

### Step 5: Privacy
1. **Single purpose:** Tab switching and navigation
2. **Permission justification:**
   - `tabs` — Required to switch tabs and display tab info
   - `storage` — Required to save user settings
3. **Privacy policy URL:**
   - Option 1: https://github.com/kar43lov/ChromeLastTabExt/blob/main/store/privacy-policy.md
   - Option 2: Create a GitHub Pages site

### Step 6: Distribution
- Visibility: Public
- Regions: All regions

### Step 7: Submit
1. Review all sections
2. Click "Submit for Review"
3. Wait 1-3 business days

## After Approval

Your extension will be available at:
`https://chrome.google.com/webstore/detail/last-tab/[extension-id]`

Update README.md with the Chrome Web Store badge and link.
