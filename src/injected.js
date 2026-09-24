/**
 * Senpa.io Delt UI - Main World Game Engine Bridge & Anti-Tamper Shield
 * 
 * Runs in the page's MAIN execution context to:
 * 1. Monitor WebSocket connection & handshake state (Ly.handshakeDone).
 * 2. Execute genuine React component handlers for PLAY and SPECTATE passing { isTrusted: true },
 *    completely neutralizing the developer's paranoid anti-tamper redirect trap (CE.checkEvent).
 * 3. Auto-queue spawn if user clicks PLAY before the initial WebSocket handshake completes.
 * 4. Pre-initialize senpaio:region to prevent the 5-second ipapi.co stall.
 */

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.__senpaDeltInjected) return;
  window.__senpaDeltInjected = true;

  // 1. Pre-initialize region in localStorage if missing to avoid 5s ipapi.co timeout
  try {
    if (!localStorage.getItem('senpaio:region')) {
      localStorage.setItem('senpaio:region', 'NA');
    }
  } catch (e) {}

  // 2. Track WebSocket & Handshake status
  let gameWs = null;
  let handshakeDone = false;
  let pendingPlay = false;

  window.__senpaGameBridge = {
    isHandshakeDone: () => handshakeDone,
    isConnected: () => Boolean(gameWs && gameWs.readyState === WebSocket.OPEN),
    triggerPlay,
    triggerSpectate
  };

  // Intercept WebSocket to track connection & handshake
  const NativeWebSocket = window.WebSocket;
  window.WebSocket = function (url, protocols) {
    const ws = new NativeWebSocket(url, protocols);

    try {
      const urlStr = String(url || '');
      // Game server websockets usually connect to senpa.io hosts on port 71xx
      if (urlStr.includes('senpa.io') || urlStr.includes(':71') || urlStr.includes('ws')) {
        gameWs = ws;
        handshakeDone = false;

        window.dispatchEvent(new CustomEvent('delt-engine-status', {
          detail: { connected: false, handshake: false, status: 'connecting', url: urlStr }
        }));

        ws.addEventListener('open', () => {
          window.dispatchEvent(new CustomEvent('delt-engine-status', {
            detail: { connected: true, handshake: false, status: 'connected', url: urlStr }
          }));
        });

        ws.addEventListener('message', () => {
          // Any message from server indicates handshake exchange has begun / finished
          if (!handshakeDone) {
            handshakeDone = true;
            window.dispatchEvent(new CustomEvent('delt-engine-status', {
              detail: { connected: true, handshake: true, status: 'ready', url: urlStr }
            }));

            // If a play request was queued while connecting, trigger it now!
            if (pendingPlay) {
              pendingPlay = false;
              setTimeout(() => {
                triggerPlay();
              }, 50);
            }
          }
        });

        ws.addEventListener('close', () => {
          handshakeDone = false;
          window.dispatchEvent(new CustomEvent('delt-engine-status', {
            detail: { connected: false, handshake: false, status: 'disconnected' }
          }));
        });
      }
    } catch (err) {
      console.warn('[SenpaMod Bridge] WebSocket hook error:', err);
    }

    return ws;
  };
  window.WebSocket.prototype = NativeWebSocket.prototype;

  /**
   * Finds React props on a DOM node
   */
  function getReactProps(dom) {
    if (!dom) return null;
    const key = Object.keys(dom).find(k => k.startsWith('__reactProps$'));
    return key ? dom[key] : null;
  }

  /**
   * Safely triggers native Play action bypassing CE.checkEvent anti-tamper redirect
   */
  function triggerPlay() {
    const playBtn = document.getElementById('play');
    if (!playBtn) {
      pendingPlay = true;
      return false;
    }

    // If handshake is not yet complete, queue and wait
    if (!handshakeDone && gameWs && gameWs.readyState === WebSocket.CONNECTING) {
      pendingPlay = true;
      window.dispatchEvent(new CustomEvent('delt-engine-status', {
        detail: { status: 'waiting_handshake' }
      }));
      return true;
    }

    const props = getReactProps(playBtn);
    if (props && typeof props.onClick === 'function') {
      try {
        // Pass { isTrusted: true } so CE.checkEvent(e) evaluates (e && !e.isTrusted) as false!
        props.onClick({ isTrusted: true, preventDefault: () => {}, stopPropagation: () => {} });
        window.dispatchEvent(new CustomEvent('delt-play-triggered', { detail: { success: true } }));
        return true;
      } catch (err) {
        console.warn('[SenpaMod Bridge] Error invoking React play onClick:', err);
      }
    }

    // Direct hardware-like click as fallback
    try {
      playBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Safely triggers native Spectate action
   */
  function triggerSpectate() {
    const specBtn = document.getElementById('spectate');
    if (!specBtn) return false;

    const props = getReactProps(specBtn);
    if (props && typeof props.onClick === 'function') {
      try {
        props.onClick({ isTrusted: true, preventDefault: () => {}, stopPropagation: () => {} });
        return true;
      } catch (err) {
        console.warn('[SenpaMod Bridge] Error invoking React spectate onClick:', err);
      }
    }

    try {
      specBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      return true;
    } catch (e) {
      return false;
    }
  }

  // Listen for custom trigger events from isolated content script
  window.addEventListener('delt-request-play', () => {
    triggerPlay();
  });

  window.addEventListener('delt-request-spectate', () => {
    triggerSpectate();
  });

  console.log('[SenpaMod] Main World Engine Bridge & Anti-Tamper Shield Active.');
})();
