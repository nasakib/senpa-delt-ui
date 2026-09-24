/**
 * Targeting & Clean Hiding Module for Senpa.io Native Menu
 * 
 * Hides all native ads, banners, inputs, and footers while allowing
 * #play and #spectate to be cleanly aligned over our custom UI buttons.
 */

import { SELECTORS } from './selectors.js';

let hiderObserver = null;
let isHiding = true;

export function injectHiderStyle() {
  let styleEl = document.getElementById(SELECTORS.modHiderStyleId);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = SELECTORS.modHiderStyleId;
    (document.head || document.documentElement).appendChild(styleEl);
  }

  styleEl.textContent = `
    /* Cleanly hide all native ads, headers, inputs, and banners */
    #bottomBar,
    #gameadsbanner-container,
    .quick-panel,
    .account-panel,
    .social-panel,
    .support-panel,
    .server-panel,
    #primary-inputs,
    #settings-btn,
    .info-footer,
    .main-menu > .logo,
    .Home_playContainer__1bzNp,
    .Home_appsContainer__14QHs {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }

    /* Make native menu background completely invisible so our custom UI shines */
    #menu,
    .main-menu,
    .menu-area,
    .menu-columns,
    .menu-col,
    .play-panel {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      pointer-events: none !important;
    }

    /* Keep native action row transparent */
    .action-row {
      border: none !important;
      background: transparent !important;
    }
  `;
}

export function removeHiderStyle() {
  const styleEl = document.getElementById(SELECTORS.modHiderStyleId);
  if (styleEl) styleEl.remove();
}

export function startNativeMenuWatcher(onNativeMenuDetected) {
  injectHiderStyle();

  if (hiderObserver) hiderObserver.disconnect();

  const checkElements = () => {
    if (!isHiding) return;
    if (!document.getElementById(SELECTORS.modHiderStyleId)) {
      injectHiderStyle();
    }
    const nativeMenu = document.querySelector('#menu') || document.querySelector('.main-menu');
    if (nativeMenu && typeof onNativeMenuDetected === 'function') {
      onNativeMenuDetected(nativeMenu);
    }
  };

  hiderObserver = new MutationObserver(() => checkElements());

  const targetNode = document.documentElement || document.body;
  if (targetNode) {
    hiderObserver.observe(targetNode, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkElements, { once: true });
  } else {
    checkElements();
  }
}

export function stopNativeMenuWatcher() {
  if (hiderObserver) {
    hiderObserver.disconnect();
    hiderObserver = null;
  }
}

export function setHidingActive(active) {
  isHiding = active;
  if (active) injectHiderStyle();
  else removeHiderStyle();
}
