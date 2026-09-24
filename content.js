/**
 * Senpa.io Enhanced Mod - Main Content Script Entry Point
 * 
 * Features:
 * 1. Clean hiding of default Senpa.io pre-game containers
 * 2. Modern compact UI resembling the user's provided screenshot
 * 3. Orbital skin carousel with active skin preview & native profile sync
 * 4. Chat player mute system & interactive emoji picker
 * 5. Leaderboard click-to-spectate and automatic #1 player spectate button (with 👑 crown)
 * 6. Dynamic menu color & accent customizer
 * 7. Enemy skins toggle switch
 * 8. Font selector applied across menu, leaderboard, minimap, and chat
 * 9. Direct access to native Senpa settings modal so NO original features are lost
 */

import { SELECTORS } from './src/selectors.js';
import { getSettings, saveSettings, resetSettings } from './src/storage.js';
import { startNativeMenuWatcher, injectHiderStyle } from './src/hider.js';
import {
  syncNicknameToNative,
  syncClanTagToNative,
  clickNativePlay,
  clickNativeSpectate,
  selectNativeServer,
  setupGameLifecycleWatcher
} from './src/bridge.js';
import { applyTheme } from './src/settings.js';
import {
  createDeltMenu,
  showDeltMenu,
  hideDeltMenu,
  toggleDeltMenu
} from './src/ui.js';
import { setNativeActiveSkin, getNativeActiveSkin } from './src/skins.js';
import { initChatEnhancements } from './src/chat.js';
import { initLeaderboardEnhancements, spectateTopPlayer } from './src/leaderboard.js';

console.log('[SenpaMod] Initializing Senpa Mod...');

// 1. Immediately inject hiding CSS to eliminate FOUC
injectHiderStyle();

async function init() {
  const settings = await getSettings();

  // If a native skin is already set in Senpa, use it
  const nativeSkin = getNativeActiveSkin();
  if (nativeSkin && !settings.activeSkinUrl) {
    settings.activeSkinUrl = nativeSkin;
  }

  // Apply visual theme (menu background color, accent, font, grid, canvas filter)
  applyTheme(settings);

  // Initialize Chat Enhancements (Mute system & Emoji launcher)
  initChatEnhancements();

  // Initialize Leaderboard Enhancements (Click-to-spectate & #1 crown)
  initLeaderboardEnhancements();

  // Build the complete UI
  createDeltMenu({
    settings,
    onNicknameChange: (val) => {
      saveSettings({ nickname: val });
      syncNicknameToNative(val);
    },
    onTagChange: (val) => {
      saveSettings({ clanTag: val });
      syncClanTagToNative(val);
    },
    onSkinChange: (url) => {
      saveSettings({ activeSkinUrl: url });
      setNativeActiveSkin(url);
    },
    onPlay: () => {
      // Sync latest values
      const nickInput = document.getElementById('delt-nick-input');
      const tagInput = document.getElementById('delt-tag-input');
      const skinInput = document.getElementById('delt-skin-url-input');

      if (nickInput) syncNicknameToNative(nickInput.value);
      if (tagInput) syncClanTagToNative(tagInput.value);
      if (skinInput && skinInput.value) setNativeActiveSkin(skinInput.value);

      const success = clickNativePlay();
      if (success) {
        hideDeltMenu();
        lifecycle.notifyGameStarted();
      } else {
        setTimeout(() => {
          if (clickNativePlay()) {
            hideDeltMenu();
            lifecycle.notifyGameStarted();
          }
        }, 200);
      }
    },
    onSpectate: () => {
      if (clickNativeSpectate()) {
        hideDeltMenu();
        lifecycle.notifyGameStarted();
      }
    },
    onSettingChange: (partial) => {
      saveSettings(partial).then(updated => {
        applyTheme(updated);
      });
    },
    onResetSettings: async () => {
      const def = await resetSettings();
      applyTheme(def);
      init();
    },
    onSelectServer: (srv) => {
      selectNativeServer(srv);
    }
  });

  // Setup Game Lifecycle Watcher (Death, Disconnect, Hotkeys)
  const lifecycle = setupGameLifecycleWatcher({
    onDeathOrDisconnect: () => {
      console.log('[SenpaMod] Player died or returned to menu. Showing mod UI...');
      showDeltMenu();
      syncInputs();
    },
    onGameStart: () => {
      console.log('[SenpaMod] Game started. Hiding menu...');
      hideDeltMenu();
    },
    onToggleMenu: () => {
      toggleDeltMenu();
    }
  });

  // Keep native menu hidden in the background
  startNativeMenuWatcher(() => {
    syncInputs();
  });

  function syncInputs() {
    if (settings.nickname) syncNicknameToNative(settings.nickname);
    if (settings.clanTag) syncClanTagToNative(settings.clanTag);
    if (settings.activeSkinUrl) setNativeActiveSkin(settings.activeSkinUrl);
  }

  // Initial sync
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncInputs);
  } else {
    syncInputs();
  }
}

// Start
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
