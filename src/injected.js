/**
 * Senpa.io Delt UI - Main World Game Engine Bridge
 * 
 * Runs in the page's MAIN execution context to safely invoke
 * React component handlers for PLAY and SPECTATE with { isTrusted: true },
 * ensuring 0 redirects while preserving all native engine behavior.
 */

(function () {
  'use strict';

  if (window.__senpaDeltInjected) return;
  window.__senpaDeltInjected = true;

  // Pre-initialize region in localStorage if missing to avoid 5s ipapi.co stall
  try {
    if (!localStorage.getItem('senpaio:region')) {
      localStorage.setItem('senpaio:region', 'NA');
    }
  } catch (e) {}

  function getReactProps(dom) {
    if (!dom) return null;
    const key = Object.keys(dom).find(k => k.startsWith('__reactProps$'));
    return key ? dom[key] : null;
  }

  function getReactFiber(dom) {
    if (!dom) return null;
    const key = Object.keys(dom).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'));
    return key ? dom[key] : null;
  }

  function getClickHandler(dom) {
    if (!dom) return null;
    const props = getReactProps(dom);
    if (props && typeof props.onClick === 'function') {
      return props.onClick;
    }
    const fiber = getReactFiber(dom);
    if (fiber && fiber.memoizedProps && typeof fiber.memoizedProps.onClick === 'function') {
      return fiber.memoizedProps.onClick;
    }
    return null;
  }

  function triggerPlay() {
    const playBtn = document.getElementById('play');
    if (!playBtn) return false;

    const onClick = getClickHandler(playBtn);
    if (typeof onClick === 'function') {
      try {
        // ALWAYS pass isTrusted: true so CE.checkEvent never triggers the YouTube redirect trap
        onClick({
          isTrusted: true,
          preventDefault: () => {},
          stopPropagation: () => {}
        });
        window.dispatchEvent(new CustomEvent('delt-play-triggered', { detail: { success: true } }));
        return true;
      } catch (err) {
        console.warn('[SenpaMod Bridge] Error invoking React play onClick:', err);
      }
    }

    return false;
  }

  function triggerSpectate() {
    const specBtn = document.getElementById('spectate');
    if (!specBtn) return false;

    const onClick = getClickHandler(specBtn);
    if (typeof onClick === 'function') {
      try {
        onClick({
          isTrusted: true,
          preventDefault: () => {},
          stopPropagation: () => {}
        });
        window.dispatchEvent(new CustomEvent('delt-spectate-triggered', { detail: { success: true } }));
        return true;
      } catch (err) {
        console.warn('[SenpaMod Bridge] Error invoking React spectate onClick:', err);
      }
    }

    return false;
  }

  window.addEventListener('delt-request-play', () => {
    triggerPlay();
  });

  window.addEventListener('delt-request-spectate', () => {
    triggerSpectate();
  });

  console.log('[SenpaMod] Main World Engine Bridge Active.');
})();
