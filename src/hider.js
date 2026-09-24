/**
 * Targeting & Clean Hiding Module for Senpa.io Native Menu
 * 
 * Hides the native menu containers cleanly via CSS without removing
 * them from the DOM, keeping all internal React state, listeners, and
 * references intact.
 */

import { SELECTORS, queryElements } from './selectors.js';

let hiderObserver = null;
let isHiding = true;

/**
 * Injects or updates the CSS rule that hides the native Senpa menu.
 */
export function injectHiderStyle() {
  let styleEl = document.getElementById(SELECTORS.modHiderStyleId);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = SELECTORS.modHiderStyleId;
    // Append to document head or root immediately
    (document.head || document.documentElement).appendChild(styleEl);
  }

  const selectorList = SELECTORS.nativeMenuContainers.join(',\n');
  styleEl.textContent = `
    /* Hides native Senpa.io pre-game menu without destroying DOM listeners */
    ${selectorList} {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
  `;
}

/**
 * Removes the hider CSS to temporarily reveal native UI (e.g., if mod is disabled)
 */
export function removeHiderStyle() {
  const styleEl = document.getElementById(SELECTORS.modHiderStyleId);
  if (styleEl) {
    styleEl.remove();
  }
}

/**
 * Starts a MutationObserver to continuously ensure native menus stay cleanly hidden
 * as React mounts, unmounts, or re-renders them.
 * 
 * @param {Function} [onNativeMenuDetected] Optional callback triggered when native menu is mounted
 */
export function startNativeMenuWatcher(onNativeMenuDetected) {
  // Ensure the CSS hider rule is present immediately
  injectHiderStyle();

  if (hiderObserver) {
    hiderObserver.disconnect();
  }

  const checkElements = () => {
    if (!isHiding) return;
    
    // Confirm style tag is still in DOM (in case Senpa clears or re-renders head)
    if (!document.getElementById(SELECTORS.modHiderStyleId)) {
      injectHiderStyle();
    }

    // Check if native menu elements exist in DOM
    const nativeMenu = document.querySelector(SELECTORS.nativeMenu) || 
                       document.querySelector(SELECTORS.nativeMainMenu);

    if (nativeMenu && typeof onNativeMenuDetected === 'function') {
      onNativeMenuDetected(nativeMenu);
    }
  };

  hiderObserver = new MutationObserver((mutations) => {
    let shouldCheck = false;
    for (const m of mutations) {
      if (m.type === 'childList' && (m.addedNodes.length > 0 || m.removedNodes.length > 0)) {
        shouldCheck = true;
        break;
      }
    }
    if (shouldCheck) {
      checkElements();
    }
  });

  // Observe root immediately
  const targetNode = document.documentElement || document.body;
  if (targetNode) {
    hiderObserver.observe(targetNode, {
      childList: true,
      subtree: true
    });
  }

  // Initial check once DOM is available
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkElements, { once: true });
  } else {
    checkElements();
  }
}

/**
 * Stop watching DOM
 */
export function stopNativeMenuWatcher() {
  if (hiderObserver) {
    hiderObserver.disconnect();
    hiderObserver = null;
  }
}

/**
 * Toggle hiding state
 * @param {boolean} active 
 */
export function setHidingActive(active) {
  isHiding = active;
  if (active) {
    injectHiderStyle();
  } else {
    removeHiderStyle();
  }
}
