/**
 * Skins Management & Sync Module for Senpa.io
 * 
 * Handles reading/writing the active player skin to Senpa.io's internal
 * profiles storage (`senpaio:profiles`), orbital skin carousel state,
 * and toggling enemy skin rendering in `Senpaio:settings`.
 */

const STORAGE_PROFILES_KEY = 'senpaio:profiles';
const STORAGE_SETTINGS_KEY = 'Senpaio:settings';

/**
 * Retrieve the active player skin URL from Senpa's native storage
 * @returns {string} Skin image URL
 */
export function getNativeActiveSkin() {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILES_KEY);
    if (!raw) return '';
    const profiles = JSON.parse(raw);
    const selected = profiles.selected || 0;
    if (profiles.list && profiles.list[selected] && profiles.list[selected].skin1) {
      return profiles.list[selected].skin1;
    }
  } catch (err) {
    console.warn('[SenpaMod] Failed reading native skin:', err);
  }
  return '';
}

/**
 * Save and sync the selected skin URL to Senpa's native profile storage
 * @param {string} skinUrl 
 */
export function setNativeActiveSkin(skinUrl) {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILES_KEY);
    let profiles = raw ? JSON.parse(raw) : { selected: 0, tag: '', list: [] };

    if (!Array.isArray(profiles.list)) {
      profiles.list = [];
    }

    const selected = Number(profiles.selected) || 0;

    // Ensure list has at least selected item
    while (profiles.list.length <= selected) {
      profiles.list.push({ nick: 'Player', skin1: '', skin2: '', hat1: 0, hat2: 0 });
    }

    // Set primary skin
    profiles.list[selected].skin1 = skinUrl.trim();

    localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(profiles));
    return true;
  } catch (err) {
    console.warn('[SenpaMod] Failed saving native skin:', err);
    return false;
  }
}

/**
 * Set enemy skins visibility in Senpa's game settings
 * @param {boolean} hideEnemy If true, enemy skins will be hidden
 */
export function setEnemySkinsHidden(hideEnemy) {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    let settings = raw ? JSON.parse(raw) : {};

    // In Senpa settings, 'enemyCellSkin' controls showing enemy skins
    settings.enemyCellSkin = !hideEnemy;

    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (err) {
    console.warn('[SenpaMod] Failed saving enemy skin setting:', err);
    return false;
  }
}

/**
 * Check if enemy skins are currently hidden in Senpa settings
 * @returns {boolean}
 */
export function isEnemySkinsHidden() {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (!raw) return false;
    const settings = JSON.parse(raw);
    return settings.enemyCellSkin === false;
  } catch (e) {
    return false;
  }
}
