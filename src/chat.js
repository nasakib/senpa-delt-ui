/**
 * Chat Enhancement Module for Senpa.io
 * 
 * Implements:
 * 1. Player Muting in Chat (one-click mute button, auto-hiding muted messages, /mute commands)
 * 2. Interactive Emoji Drawer & Shortcode Replacement (:fire: -> 🔥)
 * 3. Modern Glassmorphic Chat Box UI styling & controls
 */

import { queryElement, queryElements } from './selectors.js';
import { getSettings, saveSettings } from './storage.js';

export const COMMON_EMOJIS = [
  '🔥', '💀', '👑', '⚡', '❤️', '👀', '🚀', '⭐', '💥', '🛡️',
  '😎', '😭', '🤣', '🤡', '😈', '🤩', '😱', '🤫', '🥳', '😤',
  '🎮', '⚔️', '🏆', '🎯', '💣', '🕹️', '💯', '💪', '👾', '🍿',
  '👻', '⚠️', '💎', '🌟', '🥇', '🥈', '🥉', '✨', '💤', '👋'
];

export const EMOJI_SHORTCODES = {
  ':fire:': '🔥',
  ':skull:': '💀',
  ':crown:': '👑',
  ':heart:': '❤️',
  ':gg:': '🏆',
  ':ez:': '😎',
  ':cry:': '😭',
  ':clown:': '🤡',
  ':devil:': '😈',
  ':zap:': '⚡',
  ':100:': '💯',
  ':star:': '⭐',
  ':eyes:': '👀',
  ':rocket:': '🚀'
};

let chatObserver = null;
let currentMutedPlayers = new Set();

/**
 * Initialize chat enhancements
 */
export async function initChatEnhancements() {
  const settings = await getSettings();
  currentMutedPlayers = new Set((settings.mutedPlayers || []).map(p => p.toLowerCase().trim()));

  setupChatObserver();
  setupChatInputEnhancements();
  setupMuteCommandListener();
  applyMutedFilter();
}

/**
 * Add a player to the muted list
 * @param {string} nickname 
 */
export async function mutePlayer(nickname) {
  if (!nickname) return;
  const cleanNick = nickname.toLowerCase().trim();
  currentMutedPlayers.add(cleanNick);

  const settings = await getSettings();
  const list = Array.from(currentMutedPlayers);
  await saveSettings({ mutedPlayers: list });

  applyMutedFilter();
  showChatNotification(`Muted player: ${nickname}`);
}

/**
 * Remove a player from the muted list
 * @param {string} nickname 
 */
export async function unmutePlayer(nickname) {
  if (!nickname) return;
  const cleanNick = nickname.toLowerCase().trim();
  currentMutedPlayers.delete(cleanNick);

  const settings = await getSettings();
  const list = Array.from(currentMutedPlayers);
  await saveSettings({ mutedPlayers: list });

  applyMutedFilter();
  showChatNotification(`Unmuted player: ${nickname}`);
}

/**
 * Check if player is muted
 * @param {string} nickname 
 * @returns {boolean}
 */
export function isPlayerMuted(nickname) {
  if (!nickname) return false;
  return currentMutedPlayers.has(nickname.toLowerCase().trim());
}

/**
 * Get all currently muted players
 * @returns {string[]}
 */
export function getMutedPlayers() {
  return Array.from(currentMutedPlayers);
}

/**
 * Observes #chat-room-inner for new messages to inject mute buttons and hide muted messages
 */
function setupChatObserver() {
  if (chatObserver) chatObserver.disconnect();

  const handleContainer = (inner) => {
    if (!inner) return;

    chatObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList') {
          m.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              processChatMessage(node);
            }
          });
        }
      }
    });

    chatObserver.observe(inner, { childList: true, subtree: true });

    // Process any already existing messages
    inner.querySelectorAll('div').forEach(processChatMessage);
  };

  const inner = document.querySelector('#chat-room-inner');
  if (inner) {
    handleContainer(inner);
  } else {
    // Wait for chat room to be mounted by React
    const poll = setInterval(() => {
      const el = document.querySelector('#chat-room-inner');
      if (el) {
        clearInterval(poll);
        handleContainer(el);
      }
    }, 500);
  }
}

/**
 * Process a single chat message row element
 */
function processChatMessage(row) {
  const nickEl = row.querySelector('.nick');
  if (!nickEl) return;

  const rawNick = nickEl.textContent.trim().replace(/^:/, '').trim();
  const isMuted = isPlayerMuted(rawNick);

  if (isMuted) {
    row.style.display = 'none';
    return;
  } else {
    row.style.display = '';
  }

  // Inject hover mute action button if not already added
  if (!row.querySelector('.delt-chat-mute-btn')) {
    const muteBtn = document.createElement('button');
    muteBtn.className = 'delt-chat-mute-btn';
    muteBtn.title = `Mute ${rawNick}`;
    muteBtn.innerHTML = '🔇';
    muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      mutePlayer(rawNick);
    });

    nickEl.parentNode.insertBefore(muteBtn, nickEl.nextSibling);
  }
}

/**
 * Re-scan all chat messages and hide/show based on active muted list
 */
function applyMutedFilter() {
  const inner = document.querySelector('#chat-room-inner');
  if (!inner) return;
  inner.querySelectorAll('div').forEach(processChatMessage);
}

/**
 * Setup Emoji Launcher & chat input enhancement
 */
function setupChatInputEnhancements() {
  const injectEmojiTrigger = () => {
    const chatInput = document.querySelector('.chat-input');
    if (!chatInput) return;

    if (document.getElementById('delt-emoji-launcher')) return;

    // Create Emoji Trigger Button
    const emojiBtn = document.createElement('button');
    emojiBtn.id = 'delt-emoji-launcher';
    emojiBtn.className = 'delt-chat-emoji-btn';
    emojiBtn.title = 'Open Emojis';
    emojiBtn.innerHTML = '😊';

    // Create Emoji Drawer Popover
    const emojiDrawer = document.createElement('div');
    emojiDrawer.id = 'delt-emoji-drawer';
    emojiDrawer.className = 'delt-emoji-drawer delt-hidden';

    emojiDrawer.innerHTML = `
      <div class="delt-emoji-header">
        <span>QUICK EMOJIS</span>
        <span class="delt-emoji-close">✕</span>
      </div>
      <div class="delt-emoji-grid">
        ${COMMON_EMOJIS.map(em => `<button type="button" class="delt-emoji-item" data-emoji="${em}">${em}</button>`).join('')}
      </div>
    `;

    // Append into chat input container or body
    (chatInput.parentNode || document.body).appendChild(emojiBtn);
    (chatInput.parentNode || document.body).appendChild(emojiDrawer);

    // Toggle drawer
    emojiBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      emojiDrawer.classList.toggle('delt-hidden');
    });

    emojiDrawer.querySelector('.delt-emoji-close').addEventListener('click', () => {
      emojiDrawer.classList.add('delt-hidden');
    });

    // Emoji click inserts into input
    emojiDrawer.querySelectorAll('.delt-emoji-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const emoji = item.getAttribute('data-emoji');
        insertTextIntoInput(chatInput, emoji);
        chatInput.focus();
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!emojiDrawer.contains(e.target) && e.target !== emojiBtn) {
        emojiDrawer.classList.add('delt-hidden');
      }
    });

    // Auto shortcode replacement on typing (:fire: -> 🔥)
    chatInput.addEventListener('input', () => {
      let val = chatInput.value;
      let changed = false;
      for (const [code, emoji] of Object.entries(EMOJI_SHORTCODES)) {
        if (val.includes(code)) {
          val = val.replaceAll(code, emoji);
          changed = true;
        }
      }
      if (changed) {
        setNativeInputValue(chatInput, val);
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectEmojiTrigger, { once: true });
  } else {
    injectEmojiTrigger();
  }

  // Also check periodically in case chat is re-rendered
  setInterval(injectEmojiTrigger, 2000);
}

/**
 * Handle /mute [nick] and /unmute [nick] commands directly in chat input
 */
function setupMuteCommandListener() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const chatInput = document.querySelector('.chat-input');
      if (chatInput && document.activeElement === chatInput) {
        const val = chatInput.value.trim();
        if (val.startsWith('/mute ')) {
          e.preventDefault();
          e.stopPropagation();
          const target = val.slice(6).trim();
          mutePlayer(target);
          chatInput.value = '';
        } else if (val.startsWith('/unmute ')) {
          e.preventDefault();
          e.stopPropagation();
          const target = val.slice(8).trim();
          unmutePlayer(target);
          chatInput.value = '';
        }
      }
    }
  }, true);
}

function insertTextIntoInput(inputEl, text) {
  const start = inputEl.selectionStart || inputEl.value.length;
  const end = inputEl.selectionEnd || inputEl.value.length;
  const prev = inputEl.value;
  const next = prev.substring(0, start) + text + prev.substring(end);
  setNativeInputValue(inputEl, next);
}

function setNativeInputValue(inputEl, value) {
  try {
    const proto = window.HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, 'value');
    if (desc && desc.set) {
      desc.set.call(inputEl, value);
    } else {
      inputEl.value = value;
    }
  } catch (e) {
    inputEl.value = value;
  }
  inputEl.dispatchEvent(new Event('input', { bubbles: true }));
  inputEl.dispatchEvent(new Event('change', { bubbles: true }));
}

function showChatNotification(text) {
  const container = document.querySelector('#chat-room-inner');
  if (!container) return;

  const notif = document.createElement('div');
  notif.className = 'delt-chat-system-notif';
  notif.textContent = `[Mod] ${text}`;
  container.appendChild(notif);
  container.scrollTop = container.scrollHeight;
}
