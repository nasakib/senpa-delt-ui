/**
 * Bridge Module between Custom Menu and Senpa.io Game Engine
 * 
 * Provides:
 * 1. Safe triggerPlay & triggerSpectate invoking React components with { isTrusted: true }
 *    via the Main World bridge (src/injected.js), guaranteeing 0 anti-tamper redirects.
 * 2. Accurate hardware button alignment over the visual UI.
 * 3. Bulletproof React input setters & profiles sync for nickname, tag, and skins.
 * 4. Engine connection & handshake tracking.
 */

import { SELECTORS, queryElement, queryElements } from './selectors.js';

let isGameActive = false;
let engineStatus = 'connecting';

/**
 * Bulletproof setter for React-controlled <input> elements.
 */
export function setNativeInputValue(inputEl, value) {
  if (!inputEl) return;

  try {
    const proto = window.HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, 'value');
    if (desc && desc.set) {
      desc.set.call(inputEl, value);
    } else {
      inputEl.value = value;
    }
  } catch (err) {
    inputEl.value = value;
  }

  inputEl.dispatchEvent(new Event('input', { bubbles: true }));
  inputEl.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Direct sync to Senpa's localStorage profiles
 */
export function syncProfileStorage({ nickname, tag, skinUrl }) {
  try {
    const raw = localStorage.getItem('senpaio:profiles');
    let profiles = raw ? JSON.parse(raw) : { selected: 0, tag: '', list: [] };
    if (!Array.isArray(profiles.list)) profiles.list = [];

    const selected = Number(profiles.selected) || 0;
    while (profiles.list.length <= selected) {
      profiles.list.push({ nick: 'Player', skin1: '', skin2: '', hat1: 0, hat2: 0 });
    }

    if (nickname !== undefined) profiles.list[selected].nick = nickname;
    if (tag !== undefined) profiles.tag = tag;
    if (skinUrl !== undefined) profiles.list[selected].skin1 = skinUrl;

    localStorage.setItem('senpaio:profiles', JSON.stringify(profiles));
  } catch (e) {
    console.warn('[SenpaMod Bridge] Failed syncing profiles to localStorage:', e);
  }
}

export function syncNicknameToNative(nickname) {
  syncProfileStorage({ nickname });
  const nativeInput = queryElement(SELECTORS.nativeNicknameInput);
  if (nativeInput) {
    setNativeInputValue(nativeInput, nickname);
    return true;
  }
  return false;
}

export function syncClanTagToNative(tag) {
  syncProfileStorage({ tag });
  const nativeTagInput = queryElement(SELECTORS.nativeTagInput);
  if (nativeTagInput) {
    setNativeInputValue(nativeTagInput, tag);
    return true;
  }
  return false;
}

/**
 * Trigger Play safely without tripping CE.checkEvent anti-tamper redirect.
 * Dispatches a custom event to the main-world bridge (src/injected.js)
 * which calls React's onClick({ isTrusted: true }).
 */
export function triggerPlay() {
  // Sync latest inputs
  const nickInput = document.getElementById('delt-nick-input');
  const tagInput = document.getElementById('delt-tag-input');
  const skinInput = document.getElementById('delt-skin-url-input');

  if (nickInput) syncNicknameToNative(nickInput.value);
  if (tagInput) syncClanTagToNative(tagInput.value);
  if (skinInput) syncProfileStorage({ skinUrl: skinInput.value });

  // Dispatch main-world trigger event
  window.dispatchEvent(new CustomEvent('delt-request-play'));

  // Also call window.__senpaGameBridge if in same context
  if (window.__senpaGameBridge && typeof window.__senpaGameBridge.triggerPlay === 'function') {
    window.__senpaGameBridge.triggerPlay();
  }
}

/**
 * Trigger Spectate safely without tripping CE.checkEvent
 */
export function triggerSpectate() {
  window.dispatchEvent(new CustomEvent('delt-request-spectate'));

  if (window.__senpaGameBridge && typeof window.__senpaGameBridge.triggerSpectate === 'function') {
    window.__senpaGameBridge.triggerSpectate();
  }
}

/**
 * Aligns native #play and #spectate buttons directly over our visual custom buttons.
 * When transform is disabled on .main-menu, position: fixed aligns 1:1 with viewport.
 */
export function alignNativeButtons() {
  if (isGameActive) return;

  const nativePlay = document.getElementById('play');
  const nativeSpectate = document.getElementById('spectate');
  const playTarget = document.getElementById('delt-play-target');
  const spectateTarget = document.getElementById('delt-spectate-target');

  if (nativePlay && playTarget) {
    const rect = playTarget.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      nativePlay.style.position = 'fixed';
      nativePlay.style.left = `${rect.left}px`;
      nativePlay.style.top = `${rect.top}px`;
      nativePlay.style.width = `${rect.width}px`;
      nativePlay.style.height = `${rect.height}px`;
      nativePlay.style.opacity = '0.001';
      nativePlay.style.zIndex = '9999999';
      nativePlay.style.display = 'block';
      nativePlay.style.visibility = 'visible';
      nativePlay.style.pointerEvents = 'auto';
      nativePlay.style.cursor = 'pointer';
      nativePlay.style.transform = 'none';
      nativePlay.style.margin = '0';
    }
  }

  if (nativeSpectate && spectateTarget) {
    const rect = spectateTarget.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      nativeSpectate.style.position = 'fixed';
      nativeSpectate.style.left = `${rect.left}px`;
      nativeSpectate.style.top = `${rect.top}px`;
      nativeSpectate.style.width = `${rect.width}px`;
      nativeSpectate.style.height = `${rect.height}px`;
      nativeSpectate.style.opacity = '0.001';
      nativeSpectate.style.zIndex = '9999999';
      nativeSpectate.style.display = 'block';
      nativeSpectate.style.visibility = 'visible';
      nativeSpectate.style.pointerEvents = 'auto';
      nativeSpectate.style.cursor = 'pointer';
      nativeSpectate.style.transform = 'none';
      nativeSpectate.style.margin = '0';
    }
  }
}

/**
 * Hides the native buttons so they don't intercept pointer events on the game canvas
 */
export function hideNativeButtons() {
  const nativePlay = document.getElementById('play');
  const nativeSpectate = document.getElementById('spectate');
  if (nativePlay) nativePlay.style.display = 'none';
  if (nativeSpectate) nativeSpectate.style.display = 'none';
}

/**
 * Setup listeners on native buttons before they are clicked
 */
export function hookNativeButtonEvents(onBeforeSpawn, onSpawnComplete) {
  const attach = () => {
    const nativePlay = document.getElementById('play');
    const nativeSpectate = document.getElementById('spectate');

    if (nativePlay && !nativePlay.dataset.deltHooked) {
      nativePlay.dataset.deltHooked = 'true';
      nativePlay.addEventListener('mousedown', () => {
        if (typeof onBeforeSpawn === 'function') onBeforeSpawn();
      });
      nativePlay.addEventListener('mouseenter', () => {
        if (typeof onBeforeSpawn === 'function') onBeforeSpawn();
      });
      nativePlay.addEventListener('click', () => {
        isGameActive = true;
        hideNativeButtons();
        if (typeof onSpawnComplete === 'function') onSpawnComplete();
      });
    }

    if (nativeSpectate && !nativeSpectate.dataset.deltHooked) {
      nativeSpectate.dataset.deltHooked = 'true';
      nativeSpectate.addEventListener('mousedown', () => {
        if (typeof onBeforeSpawn === 'function') onBeforeSpawn();
      });
      nativeSpectate.addEventListener('click', () => {
        isGameActive = true;
        hideNativeButtons();
        if (typeof onSpawnComplete === 'function') onSpawnComplete();
      });
    }
  };

  attach();
  setInterval(attach, 1000);

  window.addEventListener('resize', alignNativeButtons);
  window.addEventListener('scroll', alignNativeButtons);
}

/**
 * Listen for engine connection status events from src/injected.js
 */
export function listenEngineStatus(callback) {
  window.addEventListener('delt-engine-status', (event) => {
    if (event.detail && event.detail.status) {
      engineStatus = event.detail.status;
      if (typeof callback === 'function') {
        callback(event.detail);
      }
    }
  });
}

export function getEngineStatus() {
  return engineStatus;
}

/**
 * Fetch live servers directly from Senpa API tracker
 */
export async function fetchLiveServers() {
  try {
    const res = await fetch('https://api.senpa.io/tracker');
    if (!res.ok) throw new Error('Tracker HTTP ' + res.status);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[SenpaMod Bridge] Failed fetching tracker servers:', err);
    return [];
  }
}

/**
 * Select server by host or mode
 */
export function selectNativeServer(hostOrMode) {
  if (!hostOrMode) return;

  try {
    // 1. Save to localStorage so Senpa connects on reload / OT effect
    localStorage.setItem('senpaio:server', hostOrMode);

    // 2. Click matching native server row if available in DOM
    const rows = document.querySelectorAll('.server-row');
    for (const row of rows) {
      const modeEl = row.querySelector('.server-mode');
      const nameEl = row.querySelector('.server-name');
      const text = `${nameEl ? nameEl.textContent : ''} ${modeEl ? modeEl.textContent : ''}`.toLowerCase();
      if (text.includes(String(hostOrMode).toLowerCase())) {
        row.click();
        return true;
      }
    }
  } catch (e) {}

  return false;
}

export function setupGameLifecycleWatcher({ onDeathOrDisconnect, onGameStart, onToggleMenu }) {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
        return;
      }
      if (typeof onToggleMenu === 'function') {
        onToggleMenu();
      }
    }
  });

  const stateObserver = new MutationObserver(() => {
    const nativePlayBtn = queryElement(SELECTORS.nativePlayBtn);
    const isMenuPresent = Boolean(nativePlayBtn && nativePlayBtn.offsetParent !== null);

    if (isGameActive && isMenuPresent) {
      isGameActive = false;
      if (typeof onDeathOrDisconnect === 'function') {
        onDeathOrDisconnect();
      }
    }
  });

  stateObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  return {
    notifyGameStarted: () => {
      isGameActive = true;
      hideNativeButtons();
      if (typeof onGameStart === 'function') {
        onGameStart();
      }
    },
    notifyInGame: (inGame) => {
      isGameActive = inGame;
      if (inGame) hideNativeButtons();
    }
  };
}
