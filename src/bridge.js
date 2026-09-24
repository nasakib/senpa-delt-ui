/**
 * Bridge Module between Custom Menu and Senpa.io Game Engine
 * 
 * Solves the anti-tamper redirect (CE.checkEvent / isTrusted) by aligning
 * Senpa's native #play and #spectate buttons directly over our custom UI buttons,
 * ensuring all clicks are 100% genuine browser hardware events with isTrusted: true!
 */

import { SELECTORS, queryElement, queryElements } from './selectors.js';

let isGameActive = false;

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

export function syncNicknameToNative(nickname) {
  const nativeInput = queryElement(SELECTORS.nativeNicknameInput);
  if (nativeInput) {
    setNativeInputValue(nativeInput, nickname);
    return true;
  }
  return false;
}

export function syncClanTagToNative(tag) {
  const nativeTagInput = queryElement(SELECTORS.nativeTagInput);
  if (nativeTagInput) {
    setNativeInputValue(nativeTagInput, tag);
    return true;
  }
  return false;
}

/**
 * Aligns native #play and #spectate buttons directly over our visual custom buttons.
 * This ensures the user's click hits the native button with isTrusted: true,
 * completely neutralizing Senpa's anti-tamper YouTube redirect!
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
 * @param {Function} onBeforeSpawn 
 * @param {Function} onSpawnComplete
 */
export function hookNativeButtonEvents(onBeforeSpawn, onSpawnComplete) {
  const attach = () => {
    const nativePlay = document.getElementById('play');
    const nativeSpectate = document.getElementById('spectate');

    if (nativePlay && !nativePlay.dataset.deltHooked) {
      nativePlay.dataset.deltHooked = 'true';
      // Sync on mousedown / mouseenter so inputs are ready BEFORE click fires
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
 * Fallback click simulation
 */
export function clickNativePlay() {
  const playBtn = queryElement(SELECTORS.nativePlayBtn);
  if (playBtn) {
    playBtn.click();
    return true;
  }
  return false;
}

export function clickNativeSpectate() {
  const spectateBtn = queryElement(SELECTORS.nativeSpectateBtn);
  if (spectateBtn) {
    spectateBtn.click();
    return true;
  }
  return false;
}

export function getLiveServersFromNative() {
  const rows = queryElements(SELECTORS.nativeServerRow);
  const servers = [];

  rows.forEach((row, index) => {
    const nameEl = row.querySelector(SELECTORS.nativeServerName);
    const playersEl = row.querySelector(SELECTORS.nativeServerPlayers);
    const modeEl = row.querySelector(SELECTORS.nativeServerMode);

    const name = nameEl ? nameEl.textContent.trim() : `Server ${index + 1}`;
    const players = playersEl ? playersEl.textContent.trim() : '-/-';
    const mode = modeEl ? modeEl.textContent.trim() : 'FFA';
    const isActive = row.classList.contains('active');

    servers.push({
      name,
      players,
      mode,
      isActive,
      element: row
    });
  });

  return servers;
}

export function selectNativeServer(identifier) {
  const servers = getLiveServersFromNative();
  if (typeof identifier === 'number') {
    if (servers[identifier] && servers[identifier].element) {
      servers[identifier].element.click();
      return true;
    }
  } else {
    const match = servers.find(s => s.name.toLowerCase() === String(identifier).toLowerCase() || s.mode.toLowerCase() === String(identifier).toLowerCase());
    if (match && match.element) {
      match.element.click();
      return true;
    }
  }
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
    const isMenuPresent = Boolean(nativePlayBtn);

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
