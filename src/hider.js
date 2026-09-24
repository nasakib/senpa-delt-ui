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
    /* CRITICAL: Ensure Cloudflare Turnstile captcha overlay always appears above our custom UI */
    #captcha-overlay {
      z-index: 2147483647 !important;
      position: fixed !important;
      inset: 0 !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      pointer-events: auto !important;
    }

    /* Keep native engine containers mounted and functional so WebSocket & React state stay alive */
    .server-panel,
    #primary-inputs {
      opacity: 0 !important;
      pointer-events: none !important;
      position: absolute !important;
      left: -9999px !important;
      top: -9999px !important;
      width: 1px !important;
      height: 1px !important;
      overflow: hidden !important;
    }

    /* Cleanly hide all native ads, headers, and extraneous panels */
    #bottomBar,
    #gameadsbanner-container,
    #gameadsbanner,
    #banner_ad_bottom,
    #ad-slot-center-panel,
    #onesignal-slidedown-container,
    .adsbygoogle,
    .advertisement-informer,
    .advertisement-informer-endgame,
    .quick-panel,
    .account-panel,
    .social-panel,
    .support-panel,
    #settings-btn,
    .info-footer,
    .main-menu > .logo,
    .Home_playContainer__1bzNp,
    .Home_appsContainer__14QHs {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }

    /* Prevent scale transformation and containing blocks so native buttons align 1:1 with viewport */
    #ui-root,
    #menu,
    .main-menu,
    .menu-area,
    .menu-columns,
    .menu-col,
    .play-panel,
    .action-row {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      transform: none !important;
      filter: none !important;
      backdrop-filter: none !important;
      perspective: none !important;
      contain: none !important;
      overflow: visible !important;
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
