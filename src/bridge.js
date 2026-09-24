/**
 * Bridge Module between Delt.io Mod Menu and Native Senpa.io Game Engine
 * 
 * Handles syncing nicknames, tag, button clicks, server selection,
 * and game state events (play, death, disconnect, menu toggle).
 */

import { SELECTORS, queryElement, queryElements } from './selectors.js';

/**
 * Bulletproof setter for React-controlled <input> elements.
 * Overcomes React's internal synthetic event interception by invoking
 * HTMLInputElement.prototype setter directly before dispatching bubbling events.
 * 
 * @param {HTMLInputElement} inputEl 
 * @param {string} value 
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

  // Dispatch standard bubbling input & change events
  inputEl.dispatchEvent(new Event('input', { bubbles: true }));
  inputEl.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Synchronize nickname from Delt menu to native Senpa input
 * @param {string} nickname 
 * @returns {boolean} Success status
 */
export function syncNicknameToNative(nickname) {
  const nativeInput = queryElement(SELECTORS.nativeNicknameInput);
  if (nativeInput) {
    setNativeInputValue(nativeInput, nickname);
    return true;
  }
  return false;
}

/**
 * Synchronize clan tag from Delt menu to native Senpa tag input
 * @param {string} tag 
 * @returns {boolean} Success status
 */
export function syncClanTagToNative(tag) {
  const nativeTagInput = queryElement(SELECTORS.nativeTagInput);
  if (nativeTagInput) {
    setNativeInputValue(nativeTagInput, tag);
    return true;
  }
  return false;
}

/**
 * Simulate clicking the native Senpa Play button
 * @returns {boolean} Success status
 */
export function clickNativePlay() {
  const playBtn = queryElement(SELECTORS.nativePlayBtn);
  if (playBtn) {
    // Simulate natural mouse sequence for full React synthetic event compatibility
    playBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
    playBtn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
    playBtn.click();
    return true;
  }
  return false;
}

/**
 * Simulate clicking the native Senpa Spectate button
 * @returns {boolean} Success status
 */
export function clickNativeSpectate() {
  const spectateBtn = queryElement(SELECTORS.nativeSpectateBtn);
  if (spectateBtn) {
    spectateBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
    spectateBtn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
    spectateBtn.click();
    return true;
  }
  return false;
}

/**
 * Scrapes live servers available in the native Senpa UI
 * @returns {Array<{name: string, players: string, mode: string, isActive: boolean, element: HTMLElement}>}
 */
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

/**
 * Selects a server in Senpa by clicking its native row
 * @param {string|number} identifier Server name or index
 */
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

/**
 * Listens for game lifecycle events (death, disconnect, game start, menu requests).
 * Automatically re-shows the Delt overlay when player dies.
 * 
 * @param {Object} callbacks
 * @param {Function} callbacks.onDeathOrDisconnect Triggered when player dies or returns to menu
 * @param {Function} callbacks.onGameStart Triggered when play button succeeds and game starts
 * @param {Function} callbacks.onToggleMenu Triggered when user presses Escape or hotkey
 */
export function setupGameLifecycleWatcher({ onDeathOrDisconnect, onGameStart, onToggleMenu }) {
  let wasInGame = false;

  // Keydown listener for quick Escape menu toggle
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Don't toggle if user is typing in an input
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
        return;
      }
      if (typeof onToggleMenu === 'function') {
        onToggleMenu();
      }
    }
  });

  // Watch for DOM changes indicating transition between menu and game
  const stateObserver = new MutationObserver(() => {
    const nativePlayBtn = queryElement(SELECTORS.nativePlayBtn);
    const nativeMenu = queryElement(SELECTORS.nativeMenu);
    const hud = queryElement(SELECTORS.nativeHud);

    // If native play button or menu is attached and was previously in-game -> player died/disconnected!
    const isMenuPresent = Boolean(nativePlayBtn || nativeMenu);

    if (wasInGame && isMenuPresent) {
      wasInGame = false;
      if (typeof onDeathOrDisconnect === 'function') {
        onDeathOrDisconnect();
      }
    }
  });

  stateObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });

  return {
    notifyGameStarted: () => {
      wasInGame = true;
      if (typeof onGameStart === 'function') {
        onGameStart();
      }
    },
    notifyInGame: (inGame) => {
      wasInGame = inGame;
    }
  };
}
