/**
 * Settings Application & Theme Manager for Delt UI Mod
 */

import { SELECTORS, queryElement } from './selectors.js';

export const ACCENT_PRESETS = [
  { name: 'Cyan Neon', hex: '#00f2fe', glow: 'rgba(0, 242, 254, 0.45)' },
  { name: 'Purple Ray', hex: '#a855f7', glow: 'rgba(168, 85, 247, 0.45)' },
  { name: 'Emerald', hex: '#10b981', glow: 'rgba(16, 185, 129, 0.45)' },
  { name: 'Rose Red', hex: '#ff4d6d', glow: 'rgba(255, 77, 109, 0.45)' },
  { name: 'Solar Gold', hex: '#f59e0b', glow: 'rgba(245, 158, 11, 0.45)' },
  { name: 'Electric Blue', hex: '#3b82f6', glow: 'rgba(59, 130, 246, 0.45)' }
];

/**
 * Converts Hex to RGBA string with custom alpha
 */
export function hexToRgba(hex, alpha = 0.4) {
  let c = hex.replace('#', '');
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
 * Apply the current settings directly to the DOM and CSS variables
 * @param {Object} settings 
 */
export function applyTheme(settings) {
  let styleEl = document.getElementById(SELECTORS.modDynamicThemeStyleId);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = SELECTORS.modDynamicThemeStyleId;
    (document.head || document.documentElement).appendChild(styleEl);
  }

  const accent = settings.accentColor || '#00f2fe';
  const accentGlow = hexToRgba(accent, 0.45);
  const accentBorder = hexToRgba(accent, 0.65);
  const blur = settings.blurIntensity ?? 18;
  const opacity = (settings.menuOpacity ?? 82) / 100;
  const gridColor = settings.gridColor || '#1e2638';
  const showGrid = settings.showGrid !== false;

  // Apply to dynamic style tag
  styleEl.textContent = `
    :root {
      --delt-accent: ${accent};
      --delt-accent-glow: ${accentGlow};
      --delt-accent-border: ${accentBorder};
      --delt-blur: ${blur}px;
      --delt-bg-opacity: ${opacity};
      --delt-grid-color: ${gridColor};
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

  // Ensure grid overlay element is placed right above canvas if enabled
  updateGridOverlay(showGrid);
}

/**
 * Helper to compute canvas CSS filter based on selected theme
 */
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

/**
 * Injects or removes the custom visual grid overlay
 */
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
