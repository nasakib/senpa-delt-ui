/**
 * Centralized DOM Selectors for Senpa.io
 * 
 * Edit or add selectors here after inspecting Senpa.io with DevTools.
 * Fallbacks are provided in case class hashes or element structures change.
 */

export const SELECTORS = {
  // Container of native main menu
  nativeMenuContainers: [
    '#menu',
    '.main-menu',
    '.menu-area',
    '#bottomBar',
    '#gameadsbanner-container',
    '.quick-panel',
    '.account-panel',
    '.social-panel',
    '.support-panel'
  ],

  // Specific native menu root
  nativeMenu: '#menu',
  nativeMainMenu: '.main-menu',
  nativeUiRoot: '#ui-root',

  // Player Name & Tag inputs
  nativeNicknameInput: [
    '#primary-inputs #name',
    'input#name',
    'input[placeholder="Nickname"]',
    'input[placeholder*="Nick" i]',
    '#name'
  ],
  nativeTagInput: [
    '#primary-inputs #tag',
    'input#tag',
    'input[placeholder="Tag"]',
    '#tag'
  ],

  // Play & Action Buttons
  nativePlayBtn: [
    '#play',
    'button#play',
    '.play-panel .action-row button#play',
    '.play-panel button.btn-blue',
    'button:has(i.fa-play)'
  ],
  nativeSpectateBtn: [
    '#spectate',
    'button#spectate',
    '.play-panel .action-row button#spectate',
    '.play-panel button.btn-yellow',
    'button:has(i.fa-eye)'
  ],
  nativeSettingsBtn: [
    '#settings-btn',
    'button#settings-btn',
    '.play-panel #settings-btn'
  ],

  // Server & Mode Selectors
  nativeServerPanel: '.server-panel',
  nativeServerRows: '.server-rows',
  nativeServerRow: '.server-row',
  nativeServerName: '.server-name',
  nativeServerPlayers: '.server-players',
  nativeServerMode: '.server-mode',
  nativeServerActiveRow: '.server-row.active',
  nativeRegionTabs: '.server-panel .tabs button, .server-panel .region-btn',

  // Game Canvas & In-Game Indicators
  nativeCanvas: '#screen',
  nativeHud: '.HUD',
  nativeLeaderboard: '.leaderboard',
  nativeStatsDisplay: '.stats-display',
  nativeChatRoom: '#chat-room',
  nativeMinimap: '.minimap-root',

  // Mod Element IDs & Classes
  modOverlayId: 'delt-menu-container',
  modHiderStyleId: 'delt-native-hider-style',
  modDynamicThemeStyleId: 'delt-dynamic-theme-style',
  modFabToggleId: 'delt-fab-toggle',
  modGridOverlayId: 'delt-grid-overlay'
};

/**
 * Helper to query the first matching element from a selector string or array of fallbacks
 * @param {string|string[]} selector 
 * @param {ParentNode} [root=document] 
 * @returns {HTMLElement|null}
 */
export function queryElement(selector, root = document) {
  if (Array.isArray(selector)) {
    for (const sel of selector) {
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
        // Ignore pseudo-selectors that might not be supported in older engines
      }
    }
    return null;
  }
  return root.querySelector(selector);
}

/**
 * Helper to query all matching elements from a selector string or array of fallbacks
 * @param {string|string[]} selector 
 * @param {ParentNode} [root=document] 
 * @returns {HTMLElement[]}
 */
export function queryElements(selector, root = document) {
  if (Array.isArray(selector)) {
    const found = new Set();
    for (const sel of selector) {
      try {
        const nodes = root.querySelectorAll(sel);
        nodes.forEach(node => found.add(node));
      } catch (e) {
        // Ignore invalid selectors
      }
    }
    return Array.from(found);
  }
  return Array.from(root.querySelectorAll(selector));
}
