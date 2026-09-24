/**
 * Senpa.io Delt UI Mod - Main Content Script Entry Point
 * 
 * Orchestrates:
 * 1. Native Senpa.io menu hiding (MutationObserver + stealth CSS)
 * 2. Delt.io-inspired glassmorphism overlay creation & injection
 * 3. Bidirectional bridge for nickname sync, play/spectate simulation, and death detection
 * 4. Settings persistence with chrome.storage.local
 */

import { SELECTORS, queryElement } from './src/selectors.js';
import { getSettings, saveSettings, resetSettings } from './src/storage.js';
import { startNativeMenuWatcher, injectHiderStyle } from './src/hider.js';
import {
  syncNicknameToNative,
  syncClanTagToNative,
  clickNativePlay,
  clickNativeSpectate,
  getLiveServersFromNative,
  selectNativeServer,
  setupGameLifecycleWatcher
} from './src/bridge.js';
import { applyTheme } from './src/settings.js';
import {
  createDeltMenu,
  showDeltMenu,
  hideDeltMenu,
  toggleDeltMenu,
  updateDeltServerList
} from './src/ui.js';

console.log('[DeltUI] Initializing Senpa.io Delt UI Mod...');

// 1. Immediately inject native UI hiding style to eliminate FOUC (flash of unstyled content)
injectHiderStyle();

async function init() {
  // Load saved preferences
  const settings = await getSettings();

  // Apply visual theme (CSS variables, canvas filter, grid)
  applyTheme(settings);

  // Setup DOM UI Overlay
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
    onPlay: () => {
      // Ensure latest values are synced right before spawning
      const nickInput = document.getElementById('delt-nick-input');
      const tagInput = document.getElementById('delt-tag-input');
      if (nickInput) syncNicknameToNative(nickInput.value);
      if (tagInput) syncClanTagToNative(tagInput.value);

      // Trigger native game spawn
      const success = clickNativePlay();
      if (success) {
        hideDeltMenu();
        lifecycle.notifyGameStarted();
      } else {
        console.warn('[DeltUI] Native play button not ready yet. Retrying in 250ms...');
        setTimeout(() => {
          if (clickNativePlay()) {
            hideDeltMenu();
            lifecycle.notifyGameStarted();
          }
        }, 250);
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
      init(); // Rebuild UI with defaults
    },
    onSelectServer: (serverIdentifier) => {
      selectNativeServer(serverIdentifier);
    }
  });

  // Setup Bridge Game Lifecycle Watcher (Death, Disconnect, Hotkeys)
  const lifecycle = setupGameLifecycleWatcher({
    onDeathOrDisconnect: () => {
      console.log('[DeltUI] Player died or returned to menu. Re-displaying Delt UI...');
      showDeltMenu();
      syncInputs();
      refreshServers();
    },
    onGameStart: () => {
      console.log('[DeltUI] Game started. Hiding Delt UI...');
      hideDeltMenu();
    },
    onToggleMenu: () => {
      toggleDeltMenu();
    }
  });

  // Continuously ensure native menus remain hidden in the background
  startNativeMenuWatcher((nativeMenu) => {
    // When native menu mounts or re-renders, sync our values to it
    syncInputs();
    refreshServers();
  });

  function syncInputs() {
    if (settings.nickname) syncNicknameToNative(settings.nickname);
    if (settings.clanTag) syncClanTagToNative(settings.clanTag);
  }

  function refreshServers() {
    const servers = getLiveServersFromNative();
    if (servers.length > 0) {
      updateDeltServerList(servers, (srv) => {
        selectNativeServer(srv);
      });
    }
  }

  // Initial sync once DOM content is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      syncInputs();
      refreshServers();
    });
  } else {
    syncInputs();
    refreshServers();
  }

  // Periodic poll for servers in the first 5 seconds after page load
  let pollCount = 0;
  const pollInterval = setInterval(() => {
    refreshServers();
    pollCount++;
    if (pollCount > 10) clearInterval(pollInterval);
  }, 500);

  // Hook server tab refresh button
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'delt-refresh-servers-btn') {
      refreshServers();
    }
  });
}

// Start initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
