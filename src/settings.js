/**
 * Settings Application & Theme Manager for Senpa.io
 * 
 * Supports:
 * - Menu background color customization
 * - Accent color presets + custom hex
 * - Font customization for menu, leaderboard, minimap, and chat
 * - Enemy skins toggle
 * - Direct hook to open Senpa's native settings modal
 */

import { SELECTORS, queryElement } from './selectors.js';
import { setEnemySkinsHidden } from './skins.js';

export const ACCENT_PRESETS = [
  { name: 'Pink Neon', hex: '#fe70c3', glow: 'rgba(254, 112, 195, 0.45)' },
  { name: 'Cyan Glow', hex: '#00f2fe', glow: 'rgba(0, 242, 254, 0.45)' },
  { name: 'Purple Ray', hex: '#a855f7', glow: 'rgba(168, 85, 247, 0.45)' },
  { name: 'Emerald', hex: '#10b981', glow: 'rgba(16, 185, 129, 0.45)' },
  { name: 'Amber Gold', hex: '#f59e0b', glow: 'rgba(245, 158, 11, 0.45)' },
  { name: 'Crimson', hex: '#ff4d6d', glow: 'rgba(255, 77, 109, 0.45)' }
];

export const MENU_BG_PRESETS = [
  { name: 'Charcoal Dark', hex: '#18191c' },
  { name: 'Slate Gray', hex: '#23272a' },
  { name: 'Midnight', hex: '#0e121a' },
  { name: 'AMOLED Black', hex: '#050507' },
  { name: 'Deep Navy', hex: '#0f172a' }
];

export function hexToRgba(hex, alpha = 0.4) {
  let c = (hex || '#000000').replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(ch => ch + ch).join('');
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Apply settings to the DOM, CSS variables, and fonts
 * @param {Object} settings 
 */
export function applyTheme(settings) {
  let styleEl = document.getElementById(SELECTORS.modDynamicThemeStyleId);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = SELECTORS.modDynamicThemeStyleId;
    (document.head || document.documentElement).appendChild(styleEl);
  }

  const accent = settings.accentColor || '#fe70c3';
  const accentGlow = hexToRgba(accent, 0.45);
  const accentBorder = hexToRgba(accent, 0.65);
  const menuBg = settings.menuBgColor || '#18191c';
  const blur = settings.blurIntensity ?? 16;
  const opacity = (settings.menuOpacity ?? 92) / 100;
  const gridColor = settings.gridColor || '#1e2638';
  const showGrid = settings.showGrid !== false;
  const font = settings.gameFont || 'Rajdhani, sans-serif';

  // Apply enemy skins preference to native storage
  if (typeof settings.hideEnemySkins === 'boolean') {
    setEnemySkinsHidden(settings.hideEnemySkins);
  }

  styleEl.textContent = `
    :root {
      --delt-accent: ${accent};
      --delt-accent-glow: ${accentGlow};
      --delt-accent-border: ${accentBorder};
      --delt-menu-bg: ${menuBg};
      --delt-bg: ${hexToRgba(menuBg, opacity)};
      --delt-blur: ${blur}px;
      --delt-grid-color: ${gridColor};
      --game-font: ${font};
    }

    /* Font customization applied to Leaderboard, Minimap, Chat, and Mod Menu */
    .leaderboard,
    .leaderboard *,
    .minimap-root,
    .minimap-root *,
    #chat-room,
    #chat-room *,
    .chat-input,
    .stats-display,
    .team-players-list,
    .delt-overlay-wrapper,
    .delt-overlay-wrapper * {
      font-family: var(--game-font) !important;
    }

    /* Canvas Theme Filter */
    ${getCanvasThemeCSS(settings.canvasTheme)}

    /* Custom Canvas Grid Overlay */
    #${SELECTORS.modGridOverlayId} {
      display: ${showGrid ? 'block' : 'none'} !important;
      background-size: 40px 40px;
      background-image: 
        linear-gradient(to right, ${hexToRgba(gridColor, 0.25)} 1px, transparent 1px),
        linear-gradient(to bottom, ${hexToRgba(gridColor, 0.25)} 1px, transparent 1px);
    }
  `;

  updateGridOverlay(showGrid);
}

/**
 * Open Senpa's original native settings modal so no existing settings are lost
 */
export function openNativeSenpaSettings() {
  const nativeBtn = queryElement(SELECTORS.nativeSettingsBtn);
  if (nativeBtn) {
    nativeBtn.click();
    return true;
  }
  return false;
}

function getCanvasThemeCSS(canvasTheme) {
  switch (canvasTheme) {
    case 'amoled':
      return `
        #screen, canvas.screen {
          filter: contrast(1.15) brightness(0.85) !important;
          background-color: #000000 !important;
        }
      `;
    case 'light':
      return `
        #screen, canvas.screen {
          filter: invert(0.92) hue-rotate(180deg) brightness(0.95) !important;
        }
      `;
    case 'dark':
    default:
      return `
        #screen, canvas.screen {
          filter: none !important;
        }
      `;
  }
}

function updateGridOverlay(showGrid) {
  let gridEl = document.getElementById(SELECTORS.modGridOverlayId);
  if (!gridEl && showGrid) {
    gridEl = document.createElement('div');
    gridEl.id = SELECTORS.modGridOverlayId;
    gridEl.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    `;
    const canvas = queryElement(SELECTORS.nativeCanvas);
    if (canvas && canvas.parentNode) {
      canvas.parentNode.insertBefore(gridEl, canvas.nextSibling);
    } else {
      (document.body || document.documentElement).appendChild(gridEl);
    }
  }
}
