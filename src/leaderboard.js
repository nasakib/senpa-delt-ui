/**
 * Leaderboard & Spectate Enhancements for Senpa.io
 * 
 * Implements:
 * 1. Automatic #1 Leaderboard Player Spectate button & hotkey
 * 2. Clickable Leaderboard rows with gold crown 👑 on the #1 player
 * 3. Focus spectate camera on top players
 */

import { SELECTORS, queryElement } from './selectors.js';
import { clickNativeSpectate } from './bridge.js';

let lbObserver = null;

/**
 * Initialize Leaderboard enhancements
 */
export function initLeaderboardEnhancements() {
  setupLeaderboardObserver();
  setupLeaderboardHotkey();
}

/**
 * Automatically initiates spectating and focuses on the #1 player
 */
export function spectateTopPlayer() {
  console.log('[SenpaMod] Spectating #1 player...');

  // 1. Ensure spectate mode is active
  clickNativeSpectate();

  // 2. Dispatch 'Q' keydown/keyup to toggle/cycle spectate target to leader if needed
  setTimeout(() => {
    dispatchSpectateKey('KeyQ', 81);
  }, 150);

  // 3. Highlight the #1 row in the UI
  const firstRow = document.querySelector('.leaderboard .positions > div:first-child');
  if (firstRow) {
    firstRow.classList.add('delt-spectating-highlight');
    setTimeout(() => firstRow.classList.remove('delt-spectating-highlight'), 1200);
  }
}

/**
 * Observe .leaderboard .positions to inject crowns and click-to-spectate listeners
 */
function setupLeaderboardObserver() {
  if (lbObserver) lbObserver.disconnect();

  const handlePositions = (positionsContainer) => {
    if (!positionsContainer) return;

    lbObserver = new MutationObserver(() => {
      enhanceLeaderboardRows(positionsContainer);
    });

    lbObserver.observe(positionsContainer, { childList: true, subtree: true });
    enhanceLeaderboardRows(positionsContainer);
  };

  const positions = document.querySelector('.leaderboard .positions');
  if (positions) {
    handlePositions(positions);
  } else {
    // Wait for leaderboard to be created
    const poll = setInterval(() => {
      const el = document.querySelector('.leaderboard .positions');
      if (el) {
        clearInterval(poll);
        handlePositions(el);
      }
    }, 1000);
  }
}

/**
 * Decorates rows in the leaderboard to be interactive
 */
function enhanceLeaderboardRows(container) {
  const rows = container.children;
  if (!rows || rows.length === 0) return;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.classList.contains('delt-lb-enhanced')) continue;

    row.classList.add('delt-lb-enhanced');
    row.style.cursor = 'pointer';

    if (i === 0) {
      // Crown for #1 player
      row.classList.add('delt-lb-first');
      if (!row.querySelector('.delt-crown-icon')) {
        const crown = document.createElement('span');
        crown.className = 'delt-crown-icon';
        crown.textContent = '👑 ';
        row.insertBefore(crown, row.firstChild);
      }
      row.title = 'Click to Spectate #1 Player';
    } else {
      row.title = `Click to Spectate #${i + 1}`;
    }

    row.addEventListener('click', (e) => {
      e.stopPropagation();
      spectateTopPlayer();
    });
  }
}

/**
 * Key listener for hotkey (e.g. '1') to spectate #1
 */
function setupLeaderboardHotkey() {
  window.addEventListener('keydown', (e) => {
    // Press '1' while not in input fields to spectate #1
    if (e.key === '1' && !isInputFocused()) {
      spectateTopPlayer();
    }
  });
}

function isInputFocused() {
  const el = document.activeElement;
  return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}

function dispatchSpectateKey(code, keyCode) {
  const canvas = queryElement(SELECTORS.nativeCanvas) || window;
  const eventDown = new KeyboardEvent('keydown', {
    code,
    key: 'q',
    keyCode,
    which: keyCode,
    bubbles: true,
    cancelable: true
  });
  const eventUp = new KeyboardEvent('keyup', {
    code,
    key: 'q',
    keyCode,
    which: keyCode,
    bubbles: true,
    cancelable: true
  });
  canvas.dispatchEvent(eventDown);
  setTimeout(() => canvas.dispatchEvent(eventUp), 50);
}
