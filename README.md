# Senpa.io - Delt UI Mod (Manifest V3)

> A modern, sleek browser extension mod for [Senpa.io](https://senpa.io/web/) inspired by the dark glassmorphic aesthetic of [Delt.io](https://delt.io/). Built with modern Manifest V3 and powered by [`extension.js`](https://extension.js.org/).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Manifest](https://img.shields.io/badge/Manifest-V3-success.svg)
![Built with](https://img.shields.io/badge/built%20with-extension.js-purple.svg)

---

## ✨ Features

- 🔮 **Delt.io Dark Glassmorphism**: Frosted translucent acrylic card (`backdrop-filter: blur()`), specular borders, subtle inner shadows, and dynamic neon accent glow.
- 🎯 **Targeting & Clean Hiding**: Automatically hides Senpa.io's default pre-game menus (`#menu`, `#bottomBar`, `#gameadsbanner-container`) via high-specificity CSS rules while keeping native DOM elements intact in the background.
- ⚡ **Bulletproof React Bridge**:
  - Automatically bypasses React's synthetic event traps by invoking prototype value descriptors on `#name` and `#tag`, dispatching native bubbling `input` and `change` events.
  - Simulates natural pointer sequences (`mousedown` -> `mouseup` -> `click`) on the native `#play` and `#spectate` buttons.
- 💀 **Auto-Revive & Death Detection**: Automatically detects when a game ends or when the player dies, restoring the Delt UI overlay and refetching live server status.
- ⌨️ **Hotkeys & Floating Quick-Toggle**:
  - Press <kbd>Enter</kbd> to immediately spawn.
  - Press <kbd>Esc</kbd> anytime during gameplay to open or close the Delt overlay.
  - Floating minimal FAB button (Δ) in the bottom-left corner for quick mouse access during gameplay.
- 🌐 **Live Server Synchronization**: Mirrors live Senpa game rooms (`FFA`, `MegaSplit`, `Crazy`, `Instant`, `Teams`) and switches servers with 1 click.
- ⚙️ **Custom Visual Controls**:
  - **Accent Color Theme**: Quick neon presets (Cyan, Purple, Emerald, Rose, Gold, Sky Blue) + custom HTML5 color picker.
  - **Grid Overlay**: Custom grid coordinate color picker and toggle.
  - **Canvas Filter**: Dark, AMOLED (pure black high-contrast), and Light mode.
  - **Glass Sliders**: Adjustable backdrop blur intensity and card opacity.
- 💾 **Settings Persistence**: Saves nickname, clan tag, theme colors, and layout preferences with `chrome.storage.local` (with transparent `localStorage` fallback).

---

## 📁 Project Architecture

```text
senpa-delt-ui/
├── manifest.json         # Manifest V3 extension configuration
├── content.js            # Main content script entry point & orchestrator
├── theme.css             # Delt.io design system, glassmorphism, & hiding rules
├── popup.html            # Extension action popup in browser toolbar
├── popup.css             # Popup toolbar styles
├── popup.js              # Popup toolbar logic
├── src/
│   ├── selectors.js      # Centralized Senpa.io DOM selectors & query helpers
│   ├── hider.js          # MutationObserver & CSS stealth hiding engine
│   ├── bridge.js         # React input sync, button clicks, and game lifecycle hooks
│   ├── ui.js             # Delt glassmorphic DOM menu generator & tabs
│   ├── settings.js       # Dynamic theme applicator, CSS variables, & canvas filter
│   └── storage.js        # chrome.storage.local & localStorage persistence wrapper
├── icons/                # Extension icons (16px, 48px, 128px)
├── dist/                 # Production build artifacts
└── package.json          # Extension.js configuration and scripts
```

---

## 🚀 Quick Start & Development

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **Google Chrome** or any Chromium-based browser (Brave, Edge, Opera, etc.)

### 2. Install Dependencies
```bash
npm install
```

### 3. Development Mode (with Live Reloading)
Using [`extension.js`](https://extension.js.org/):
```bash
npm run dev
# or
npx extension dev
```
This automatically launches a fresh Chromium profile with the extension pre-loaded and watches your files with instant hot-reloading.

### 4. Build for Production
```bash
npm run build
# or
npx extension build
```
The compiled extension will be output to `dist/chromium`.

---

## 📥 Loading into Chrome (Manual / Unpacked)

1. Run `npm run build` to generate `dist/chromium`.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. In the top-right corner, enable **Developer mode**.
4. Click **Load unpacked** in the top-left corner.
5. Select the `dist/chromium` folder inside this repository.
6. Navigate to [https://senpa.io/web/](https://senpa.io/web/) to experience the new Delt.io interface!

---

## 🛠️ Customizing DOM Selectors

If Senpa.io updates its UI or modifies class names in the future, all selectors are cleanly centralized in [`src/selectors.js`](file:///c:/Users/natsa/Documents/senpa-delt-ui/src/selectors.js):

```javascript
export const SELECTORS = {
  // Container of native main menu
  nativeMenuContainers: [
    '#menu',
    '.main-menu',
    '.menu-area',
    '#bottomBar',
    '#gameadsbanner-container'
  ],

  // Player Name & Tag inputs
  nativeNicknameInput: ['#primary-inputs #name', 'input#name'],
  nativeTagInput: ['#primary-inputs #tag', 'input#tag'],

  // Play button
  nativePlayBtn: ['#play', 'button#play'],

  // Server rows
  nativeServerRow: '.server-row',
  ...
};
```

Simply update the selector strings, run `npm run build`, and reload your extension!

---

## 📄 License

MIT License © 2026 nasakib
