/**
 * Storage Helper for Senpa Delt UI
 * 
 * Supports chrome.storage.local with transparent localStorage fallback.
 */

export const DEFAULT_SETTINGS = {
  nickname: 'DeltPlayer',
  clanTag: '',
  accentColor: '#00f2fe',
  accentGlow: 'rgba(0, 242, 254, 0.45)',
  gridColor: '#1e2638',
  showGrid: true,
  canvasTheme: 'dark', // 'dark', 'amoled', 'light'
  blurIntensity: 18,
  menuOpacity: 82,
  selectedMode: 'FFA',
  selectedServer: '',
  modEnabled: true
};

const STORAGE_KEY = 'delt_senpa_mod_settings_v1';

/**
 * Check if chrome.storage is available
 */
function hasChromeStorage() {
  return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
}

/**
 * Load settings from storage, merged with defaults
 * @returns {Promise<typeof DEFAULT_SETTINGS>}
 */
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
    console.warn('[DeltUI] Storage get error, using defaults:', err);
    return { ...DEFAULT_SETTINGS, ...loadFromLocalStorage() };
  }
}

/**
 * Save settings to storage (both chrome.storage and localStorage for redundancy)
 * @param {Partial<typeof DEFAULT_SETTINGS>} partialSettings 
 * @returns {Promise<typeof DEFAULT_SETTINGS>}
 */
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
    console.warn('[DeltUI] Storage save error:', err);
  }

  return updated;
}

/**
 * Reset settings back to defaults
 */
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
    console.warn('[DeltUI] Reset error:', e);
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
    // Ignore quota issues
  }
}
