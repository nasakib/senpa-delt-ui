# Senpa.io - Enhanced Modern UI Mod (Manifest V3)

> A sleek, clean browser extension mod for [Senpa.io](https://senpa.io/web/) featuring a complete UI overhaul matching classic competitive agar clients, orbital skin carousel, chat player muting, emoji launcher, leaderboard #1 spectate, custom fonts, and colors. Built with modern Manifest V3 and powered by [`extension.js`](https://extension.js.org/).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Manifest](https://img.shields.io/badge/Manifest-V3-success.svg)
![Built with](https://img.shields.io/badge/built%20with-extension.js-purple.svg)

---

## ✨ Features & What's Included

### 1. 🔇 Player Chat Muting
- **Hover Mute Button**: Hover over any player's message in `#chat-room` to see a mute icon (🔇). Clicking it immediately mutes the player and hides all their existing and future messages.
- **Chat Slash Commands**: Type `/mute [nickname]` or `/unmute [nickname]` directly into the chat input bar.
- **Muted Players Manager**: View all muted players and unmute them with 1-click in the Settings tab.

### 2. 😊 Chat Emojis & Quick Tray
- **Integrated Emoji Drawer**: Click the smiling emoji icon (😊) on the chat bar to open a categorized emoji drawer (`🔥`, `💀`, `👑`, `⚡`, `❤️`, `🎮`, `🏆`, `😎`, `😭`, `🤡`, etc.).
- **Auto Shortcodes**: Automatically transforms `:fire:` into 🔥, `:skull:` into 💀, `:crown:` into 👑, `:gg:` into 🏆, and more as you type.

### 3. 👑 Spectate #1 Player Automatically
- **Gold Crown 👑 & Interactive Leaderboard**: The top player on the in-game leaderboard is decorated with a glowing gold crown. Clicking on the #1 row instantly focuses your camera on them.
- **"Spectate #1" Button**: Dedicated button on the main menu to immediately spawn camera onto the room leader.
- **Quick Hotkey**: Press <kbd>1</kbd> during gameplay to automatically spectate the leader.

### 4. 🎨 Complete Menu Redesign (Resembling Provided Layout)
- **Top Icon Navigation Bar**:
  - 🏠 **Home / Play**: Central game controls, skin carousel, nicknames, and server join.
  - 👤 **Profile**: Active skin and link to Senpa native clan & account system.
  - ⚙️ **Settings**: Enemy skins toggle, custom fonts, grid overlay, and muted players list.
  - 💧 **Theme / Colors**: Menu background tone, neon accent glow, and card opacity.
  - ⌨️ **Controls**: Keyboard layout reference.
  - 🎵 **Audio**: Game sound toggle.
  - ✕ **Close / Hide**: Minimizes the menu.
- **No Annoying Clutter**: Stripped of ads, redundant banners, and distracting popups.

### 5. 🖌️ Menu Color & Theme Customizer
- **Menu Background Tone**: Choose between Charcoal Dark (`#18191c`), Slate Gray (`#23272a`), Midnight (`#0e121a`), AMOLED Black (`#050507`), Deep Navy (`#0f172a`), or enter any custom hex color.
- **Accent Glow Color**: Pick between Pink Neon, Cyan Glow, Purple Ray, Emerald, Amber Gold, Crimson, or any custom color.
- **Opacity & Blur Sliders**: Adjust menu transparency from 50% to 100%.

### 6. 🖼️ Active Skin Preview & Orbital Carousel
- **Central Circular Preview**: Prominently displays the skin you are currently using.
- **Orbital Ring**: 10 rotating mini circular thumbnails surrounding the main preview.
- **Custom Skin URL Input**: Paste any direct image link (`https://i.imgur.com/...`) into the skin URL field for instant live preview.
- **Native Profile Sync**: Automatically synchronizes your chosen skin to Senpa's native `senpaio:profiles` storage so your cell spawns with it in-game.
- **Cycle Controls**: Arrow buttons (`«` and `»`), eye visibility tool, and `+` / `-` zoom buttons.

### 7. 👁️ Turn Off / On Enemy Skins
- **Enemy Skins Switch**: Toggle switch in the Settings tab to hide or show opponent custom skins, boosting FPS and visual clarity for competitive play. Automatically updates Senpa's native `enemyCellSkin` setting.

### 8. 🔤 Custom Font Options
- Customize the typography across the **Menu, Leaderboard, Minimap, and Chat**:
  - `Rajdhani` (Default Senpa)
  - `Inter` (Crisp modern sans)
  - `Ubuntu` (Curved clean sans)
  - `Roboto` (Geometric sans)
  - `Press Start 2P` (Pixel 8-bit retro arcade)
  - `VT323` (Terminal retro)
  - `Montserrat` (Bold modern)
  - `Poppins` (Soft geometric)

### 9. 💬 Cooler Looking Chat Box
- Modern translucent frosted glass design (`backdrop-filter: blur(12px)`).
- Pill timestamps, glowing nickname accents, and subtle borders.
- Hover mute actions on every chat line.
- Modern rounded chat input bar with emoji launcher.

### 10. 🛡️ 100% Native Game Features Preserved
- Includes an **"Open Original Senpa Settings"** button in the Settings tab, allowing you to access all native controls, audio sliders, account settings, and clan features whenever needed.

---

## 📁 Project Architecture

```text
senpa-delt-ui/
├── manifest.json         # Manifest V3 extension configuration
├── content.js            # Main content script entry point & orchestrator
├── theme.css             # Complete design system matching the UI layout
├── popup.html            # Toolbar popup
├── popup.css             # Toolbar popup styling
├── popup.js              # Toolbar popup logic
├── src/
│   ├── selectors.js      # Centralized Senpa.io DOM selectors
│   ├── storage.js        # Settings, presets, fonts, & persistence
│   ├── skins.js          # Native profile skin sync & enemy skin toggle
│   ├── chat.js           # Player muting, emoji drawer, & chat styling
│   ├── leaderboard.js    # #1 player spectate button, gold crown 👑, & click-to-spectate
│   ├── settings.js       # Dynamic theme applicator, fonts, & native settings launcher
│   ├── bridge.js         # React input sync, button click simulation, & death watcher
│   ├── hider.js          # MutationObserver & CSS stealth hiding engine
│   └── ui.js             # Orbital skin carousel, top icon navbar, & tabs
├── icons/                # Extension icons (16px, 48px, 128px)
├── dist/chromium/        # Production build ready to load into Chrome
└── package.json          # extension.js configuration & build scripts
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
```bash
npm run dev
# or
npx extension dev
```

### 4. Build for Production
```bash
npm run build
# or
npx extension build
```
Compiled extension files will be in `dist/chromium`.

---

## 📥 Loading into Chrome (Manual / Unpacked)

1. Run `npm run build` to generate `dist/chromium`.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. In the top-right corner, enable **Developer mode**.
4. Click **Load unpacked** in the top-left corner.
5. Select the `dist/chromium` folder inside this repository.
6. Open [https://senpa.io/web/](https://senpa.io/web/) and enjoy the new interface!

---

## 📄 License

MIT License © 2026 nasakib
