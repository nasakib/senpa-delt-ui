/**
 * Senpa.io Enhanced Mod - Main Content Script Entry Point
 * 
 * Neutralizes anti-tamper YouTube redirects and coordinates:
 * - Orbital skin carousel with 12 built-in SVG skins
 * - Direct native button docking for 100% trusted clicks
 * - Chat player muting & emoji launcher
 * - Leaderboard #1 crown & click-to-spectate
 * - Custom fonts & menu theme customization
 */

import { SELECTORS } from './src/selectors.js';
import { getSettings, saveSettings, resetSettings } from './src/storage.js';
import { startNativeMenuWatcher, injectHiderStyle } from './src/hider.js';
import {
  syncNicknameToNative,
  syncClanTagToNative,
  selectNativeServer,
  setupGameLifecycleWatcher,
  alignNativeButtons,
  hookNativeButtonEvents,
  hideNativeButtons
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
import { initLeaderboardEnhancements } from './src/leaderboard.js';

console.log('[SenpaMod] Initializing Senpa Mod v2.1 (Anti-Redirect & Skins Fix)...');

// 1. Immediately inject hiding CSS
injectHiderStyle();

async function init() {
  const settings = await getSettings();

  const nativeSkin = getNativeActiveSkin();
  if (nativeSkin && !settings.activeSkinUrl) {
    settings.activeSkinUrl = nativeSkin;
  }

  // Apply theme & fonts
  applyTheme(settings);

  // Initialize chat & leaderboard
  initChatEnhancements();
  initLeaderboardEnhancements();

  // Create UI
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
    onSettingChange: (partial) => {
      saveSettings(partial).then(updated => {
        applyTheme(updated);
        alignNativeButtons();
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

  function syncAll() {
    const nickInput = document.getElementById('delt-nick-input');
    const tagInput = document.getElementById('delt-tag-input');
    const skinInput = document.getElementById('delt-skin-url-input');

    if (nickInput && nickInput.value) syncNicknameToNative(nickInput.value);
    if (tagInput && tagInput.value) syncClanTagToNative(tagInput.value);
    if (skinInput && skinInput.value) setNativeActiveSkin(skinInput.value);
  }

  // Hook native #play and #spectate buttons to ensure inputs are synced before click
  hookNativeButtonEvents(
    () => {
      syncAll();
    },
    () => {
      hideDeltMenu();
      lifecycle.notifyGameStarted();
    }
  );

  // Setup Lifecycle watcher
  const lifecycle = setupGameLifecycleWatcher({
    onDeathOrDisconnect: () => {
      console.log('[SenpaMod] Player died or returned to menu. Showing mod UI...');
      showDeltMenu();
      syncAll();
      setTimeout(alignNativeButtons, 100);
    },
    onGameStart: () => {
      console.log('[SenpaMod] Game started. Hiding menu...');
      hideDeltMenu();
    },
    onToggleMenu: () => {
      toggleDeltMenu();
    }
  });

  // Keep native menu elements hidden while keeping #play and #spectate aligned
  startNativeMenuWatcher(() => {
    syncAll();
    alignNativeButtons();
  });

  // Initial alignment
  setTimeout(alignNativeButtons, 200);
  setTimeout(alignNativeButtons, 600);
  setTimeout(alignNativeButtons, 1500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
