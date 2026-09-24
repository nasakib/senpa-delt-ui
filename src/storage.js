/**
 * Storage Helper for Senpa Mod
 * 
 * Manages player settings, muted players, custom skins, fonts, and theme colors
 * with transparent chrome.storage.local and localStorage redundancy.
 */

import { DEFAULT_ORBITAL_SKINS } from './skinPresets.js';

export const AVAILABLE_FONTS = [
  { name: 'Rajdhani (Default)', value: 'Rajdhani, sans-serif' },
  { name: 'Inter (Modern Sans)', value: 'Inter, -apple-system, sans-serif' },
  { name: 'Ubuntu (Clean Curved)', value: 'Ubuntu, sans-serif' },
  { name: 'Roboto (Geometric)', value: 'Roboto, sans-serif' },
  { name: 'Press Start 2P (Pixel 8-Bit)', value: '"Press Start 2P", monospace' },
  { name: 'VT323 (Arcade Terminal)', value: 'VT323, monospace' },
  { name: 'Montserrat (Bold)', value: 'Montserrat, sans-serif' },
  { name: 'Poppins (Soft Modern)', value: 'Poppins, sans-serif' }
];

export const DEFAULT_SETTINGS = {
  nickname: 'SenpaPlayer',
  clanTag: '',
  activeSkinUrl: DEFAULT_ORBITAL_SKINS[0].url,
  recentSkins: DEFAULT_ORBITAL_SKINS.map(s => s.url),
  hideEnemySkins: false,
  gameFont: 'Rajdhani, sans-serif',
  menuBgColor: '#18191c',
  accentColor: '#fe70c3',
  gridColor: '#1e2638',
  showGrid: true,
  canvasTheme: 'dark', // 'dark', 'amoled', 'light'
  blurIntensity: 16,
  menuOpacity: 94,
  selectedMode: 'FFA',
  selectedServer: '',
  partyToken: '',
  mutedPlayers: [],
  modEnabled: true
};

const STORAGE_KEY = 'senpa_custom_mod_settings_v3';

function hasChromeStorage() {
  return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
}

export async function getSettings() {
  try {
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        chrome.storage.local.get([STORAGE_KEY], (result) => {
          if (chrome.runtime.lastError || !result[STORAGE_KEY]) {
            const fallback = loadFromLocalStorage();
            resolve({ ...DEFAULT_SETTINGS, ...fallback });
          } else {
            resolve({ ...DEFAULT_SETTINGS, ...result[STORAGE_KEY] });
          }
        });
      });
    } else {
      const fallback = loadFromLocalStorage();
      return { ...DEFAULT_SETTINGS, ...fallback };
    }
  } catch (err) {
    console.warn('[SenpaMod] Storage get error, using defaults:', err);
    return { ...DEFAULT_SETTINGS, ...loadFromLocalStorage() };
  }
}

export async function saveSettings(partialSettings) {
  const current = await getSettings();
  const updated = { ...current, ...partialSettings };

  try {
    saveToLocalStorage(updated);
    if (hasChromeStorage()) {
      await new Promise((resolve) => {
        chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => {
          resolve();
        });
      });
    }
  } catch (err) {
    console.warn('[SenpaMod] Storage save error:', err);
  }

  return updated;
}

export async function resetSettings() {
  try {
    saveToLocalStorage(DEFAULT_SETTINGS);
    if (hasChromeStorage()) {
      await new Promise((resolve) => {
        chrome.storage.local.set({ [STORAGE_KEY]: DEFAULT_SETTINGS }, () => {
          resolve();
        });
      });
    }
  } catch (e) {
    console.warn('[SenpaMod] Reset error:', e);
  }
  return { ...DEFAULT_SETTINGS };
}

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveToLocalStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // Ignore quota errors
  }
}
