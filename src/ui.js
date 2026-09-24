/**
 * Delt.io-Inspired Glassmorphic Menu UI Builder
 * 
 * Generates the modern glassmorphism overlay (#delt-menu-container),
 * controls, tab navigation, floating FAB toggle, and server list.
 */

import { SELECTORS, queryElement } from './selectors.js';
import { ACCENT_PRESETS } from './settings.js';

/**
 * Creates and injects the complete Delt overlay into the document.
 * 
 * @param {Object} options
 * @param {Object} options.settings Current user settings
 * @param {Function} options.onNicknameChange Callback on nickname input
 * @param {Function} options.onTagChange Callback on clan tag input
 * @param {Function} options.onPlay Callback when Play is clicked
 * @param {Function} options.onSpectate Callback when Spectate is clicked
 * @param {Function} options.onSettingChange Callback when any setting is adjusted
 * @param {Function} options.onResetSettings Callback when reset is clicked
 * @param {Function} options.onSelectServer Callback when server is selected
 * @returns {HTMLElement} The injected menu container
 */
export function createDeltMenu({
  settings,
  onNicknameChange,
  onTagChange,
  onPlay,
  onSpectate,
  onSettingChange,
  onResetSettings,
  onSelectServer
}) {
  // Remove existing instance if present
  let existing = document.getElementById(SELECTORS.modOverlayId);
  if (existing) {
    existing.remove();
  }

  const container = document.createElement('div');
  container.id = SELECTORS.modOverlayId;
  container.className = 'delt-overlay-wrapper';

  container.innerHTML = `
    <div class="delt-glass-card" id="delt-card">
      <!-- Glow ambient background effect -->
      <div class="delt-card-glow"></div>

      <!-- Top Header -->
      <div class="delt-header">
        <div class="delt-brand">
          <div class="delt-logo-badge">Δ</div>
          <div class="delt-title-group">
            <span class="delt-title">DELT<span class="delt-accent-text">.IO</span></span>
            <span class="delt-subtitle">SENPA.IO MOD // V3</span>
          </div>
        </div>
        <div class="delt-header-controls">
          <span class="delt-status-pill"><span class="delt-status-dot"></span>READY</span>
          <button class="delt-icon-btn delt-close-btn" id="delt-header-close" title="Close Overlay (Esc)">✕</button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="delt-tab-bar">
        <button class="delt-tab-btn active" data-tab="play">
          <span class="delt-tab-icon">▶</span> Play
        </button>
        <button class="delt-tab-btn" data-tab="settings">
          <span class="delt-tab-icon">⚙</span> Settings
        </button>
        <button class="delt-tab-btn" data-tab="controls">
          <span class="delt-tab-icon">⌨</span> Controls
        </button>
        <button class="delt-tab-btn" data-tab="servers">
          <span class="delt-tab-icon">🌐</span> Servers
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="delt-tab-contents">
        <!-- 1. PLAY TAB -->
        <div class="delt-tab-pane active" id="delt-tab-play">
          <!-- Nickname & Tag Row -->
          <div class="delt-input-group">
            <div class="delt-input-wrap delt-tag-wrap">
              <label class="delt-label">CLAN TAG</label>
              <input 
                type="text" 
                id="delt-tag-input" 
                class="delt-input" 
                placeholder="TAG" 
                maxlength="5" 
                value="${escapeHtml(settings.clanTag || '')}"
              />
            </div>
            <div class="delt-input-wrap delt-nick-wrap">
              <label class="delt-label">PLAYER NICKNAME</label>
              <input 
                type="text" 
                id="delt-nick-input" 
                class="delt-input" 
                placeholder="Enter Nickname..." 
                maxlength="15" 
                value="${escapeHtml(settings.nickname || '')}"
                autofocus
              />
            </div>
          </div>

          <!-- Server / Mode Quick Dropdown -->
          <div class="delt-field-row">
            <label class="delt-label">GAME MODE & REGION</label>
            <div class="delt-select-wrap">
              <select id="delt-mode-select" class="delt-select">
                <option value="FFA" ${settings.selectedMode === 'FFA' ? 'selected' : ''}>FFA (Free For All)</option>
                <option value="MegaSplit" ${settings.selectedMode === 'MegaSplit' ? 'selected' : ''}>MegaSplit (Fast)</option>
                <option value="Crazy" ${settings.selectedMode === 'Crazy' ? 'selected' : ''}>Crazy Mode</option>
                <option value="Instant" ${settings.selectedMode === 'Instant' ? 'selected' : ''}>Instant Merge</option>
                <option value="Teams" ${settings.selectedMode === 'Teams' ? 'selected' : ''}>Teams</option>
              </select>
            </div>
          </div>

          <!-- Primary Spawn Actions -->
          <div class="delt-actions-row">
            <button class="delt-btn delt-btn-play" id="delt-play-btn">
              <span class="delt-play-glow"></span>
              <span class="delt-btn-icon">⚡</span>
              <span class="delt-btn-text">PLAY / SPAWN</span>
            </button>
            <button class="delt-btn delt-btn-spectate" id="delt-spectate-btn" title="Spectate Game">
              <span class="delt-btn-icon">👁</span>
              <span class="delt-btn-text">SPECTATE</span>
            </button>
          </div>

          <!-- Footer Tips -->
          <div class="delt-pane-footer">
            <span class="delt-hint">Press <kbd>Enter</kbd> to Spawn • <kbd>Esc</kbd> to Toggle Menu</span>
          </div>
        </div>

        <!-- 2. SETTINGS TAB -->
        <div class="delt-tab-pane" id="delt-tab-settings">
          <!-- Accent Color Swatches & Picker -->
          <div class="delt-setting-item">
            <div class="delt-setting-info">
              <span class="delt-setting-title">Accent Theme</span>
              <span class="delt-setting-desc">Primary neon glow and interactive highlight color</span>
            </div>
            <div class="delt-color-picker-row">
              <div class="delt-swatches" id="delt-accent-swatches">
                ${ACCENT_PRESETS.map(p => `
                  <button 
                    type="button" 
                    class="delt-swatch ${settings.accentColor === p.hex ? 'active' : ''}" 
                    style="background-color: ${p.hex}" 
                    data-hex="${p.hex}" 
                    title="${p.name}"
                  ></button>
                `).join('')}
              </div>
              <input 
                type="color" 
                id="delt-custom-accent" 
                class="delt-color-input" 
                value="${settings.accentColor || '#00f2fe'}" 
                title="Custom Color"
              />
            </div>
          </div>

          <!-- Grid Color & Visibility -->
          <div class="delt-setting-item">
            <div class="delt-setting-info">
              <span class="delt-setting-title">Game Grid Overlay</span>
              <span class="delt-setting-desc">Toggle background coordinate grid lines & color</span>
            </div>
            <div class="delt-setting-controls">
              <input 
                type="color" 
                id="delt-grid-color" 
                class="delt-color-input" 
                value="${settings.gridColor || '#1e2638'}" 
              />
              <label class="delt-switch">
                <input type="checkbox" id="delt-grid-toggle" ${settings.showGrid !== false ? 'checked' : ''} />
                <span class="delt-slider"></span>
              </label>
            </div>
          </div>

          <!-- Canvas Theme Selector -->
          <div class="delt-setting-item">
            <div class="delt-setting-info">
              <span class="delt-setting-title">Canvas Theme</span>
              <span class="delt-setting-desc">Visual contrast mode for game arena</span>
            </div>
            <div class="delt-pill-select" id="delt-canvas-theme-group">
              <button type="button" class="delt-pill-btn ${settings.canvasTheme === 'dark' || !settings.canvasTheme ? 'active' : ''}" data-theme="dark">Dark</button>
              <button type="button" class="delt-pill-btn ${settings.canvasTheme === 'amoled' ? 'active' : ''}" data-theme="amoled">AMOLED</button>
              <button type="button" class="delt-pill-btn ${settings.canvasTheme === 'light' ? 'active' : ''}" data-theme="light">Light</button>
            </div>
          </div>

          <!-- Glass Blur & Opacity Sliders -->
          <div class="delt-setting-item">
            <div class="delt-setting-info">
              <span class="delt-setting-title">Backdrop Blur: <span id="delt-blur-val">${settings.blurIntensity ?? 18}px</span></span>
              <span class="delt-setting-desc">Frosted glass backdrop intensity</span>
            </div>
            <input 
              type="range" 
              id="delt-blur-slider" 
              class="delt-range" 
              min="0" 
              max="30" 
              value="${settings.blurIntensity ?? 18}" 
            />
          </div>

          <div class="delt-setting-item">
            <div class="delt-setting-info">
              <span class="delt-setting-title">Menu Opacity: <span id="delt-opacity-val">${settings.menuOpacity ?? 82}%</span></span>
              <span class="delt-setting-desc">Transparency of the glassmorphic card</span>
            </div>
            <input 
              type="range" 
              id="delt-opacity-slider" 
              class="delt-range" 
              min="40" 
              max="95" 
              value="${settings.menuOpacity ?? 82}" 
            />
          </div>

          <!-- Reset Defaults -->
          <div class="delt-settings-footer">
            <button type="button" class="delt-btn-text" id="delt-reset-btn">↺ Reset to Defaults</button>
          </div>
        </div>

        <!-- 3. CONTROLS TAB -->
        <div class="delt-tab-pane" id="delt-tab-controls">
          <div class="delt-controls-grid">
            <div class="delt-key-row">
              <kbd class="delt-kbd">SPACE</kbd>
              <div class="delt-key-meta">
                <span class="delt-key-title">Split Cell</span>
                <span class="delt-key-desc">Splits active cell 50/50 forward</span>
              </div>
            </div>
            <div class="delt-key-row">
              <kbd class="delt-kbd">W</kbd>
              <div class="delt-key-meta">
                <span class="delt-key-title">Eject Mass / Feed</span>
                <span class="delt-key-desc">Shoots mass pellets towards cursor</span>
              </div>
            </div>
            <div class="delt-key-row">
              <kbd class="delt-kbd">E</kbd>
              <div class="delt-key-meta">
                <span class="delt-key-title">Macro Feed</span>
                <span class="delt-key-desc">Rapid mass ejection</span>
              </div>
            </div>
            <div class="delt-key-row">
              <kbd class="delt-kbd">ESC</kbd>
              <div class="delt-key-meta">
                <span class="delt-key-title">Toggle Delt Menu</span>
                <span class="delt-key-desc">Open or close this overlay anytime</span>
              </div>
            </div>
            <div class="delt-key-row">
              <kbd class="delt-kbd">TAB</kbd>
              <div class="delt-key-meta">
                <span class="delt-key-title">Leaderboard / Stats</span>
                <span class="delt-key-desc">Toggle in-game player rankings</span>
              </div>
            </div>
            <div class="delt-key-row">
              <kbd class="delt-kbd">ENTER</kbd>
              <div class="delt-key-meta">
                <span class="delt-key-title">Quick Spawn</span>
                <span class="delt-key-desc">Spawns directly into the arena</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. SERVERS TAB -->
        <div class="delt-tab-pane" id="delt-tab-servers">
          <div class="delt-server-list-header">
            <span>LIVE SENPA.IO ROOMS</span>
            <button class="delt-refresh-btn" id="delt-refresh-servers-btn" title="Refresh Servers">↻ Refresh</button>
          </div>
          <div class="delt-server-list" id="delt-server-items">
            <div class="delt-server-placeholder">Loading available server nodes...</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Append overlay to body or root
  (document.body || document.documentElement).appendChild(container);

  // Inactive floating FAB toggle button (allows opening menu during gameplay)
  createFabToggle();

  // Attach interactive listeners
  wireDeltMenuEvents(container, {
    onNicknameChange,
    onTagChange,
    onPlay,
    onSpectate,
    onSettingChange,
    onResetSettings,
    onSelectServer
  });

  return container;
}

/**
 * Attaches all event handlers to the generated menu
 */
function wireDeltMenuEvents(container, callbacks) {
  // Tab Switching
  const tabButtons = container.querySelectorAll('.delt-tab-btn');
  const tabPanes = container.querySelectorAll('.delt-tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabTarget = btn.getAttribute('data-tab');
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = container.querySelector(`#delt-tab-${tabTarget}`);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });

  // Nickname & Tag Inputs (live sync)
  const nickInput = container.querySelector('#delt-nick-input');
  const tagInput = container.querySelector('#delt-tag-input');

  if (nickInput) {
    nickInput.addEventListener('input', (e) => {
      callbacks.onNicknameChange(e.target.value);
    });
    nickInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        callbacks.onPlay();
      }
    });
  }

  if (tagInput) {
    tagInput.addEventListener('input', (e) => {
      callbacks.onTagChange(e.target.value);
    });
    tagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        callbacks.onPlay();
      }
    });
  }

  // Play & Spectate Buttons
  const playBtn = container.querySelector('#delt-play-btn');
  const spectateBtn = container.querySelector('#delt-spectate-btn');

  if (playBtn) {
    playBtn.addEventListener('click', () => callbacks.onPlay());
  }

  if (spectateBtn) {
    spectateBtn.addEventListener('click', () => callbacks.onSpectate());
  }

  // Close Header Button
  const closeBtn = container.querySelector('#delt-header-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => hideDeltMenu());
  }

  // Game Mode Select
  const modeSelect = container.querySelector('#delt-mode-select');
  if (modeSelect) {
    modeSelect.addEventListener('change', (e) => {
      callbacks.onSettingChange({ selectedMode: e.target.value });
      if (typeof callbacks.onSelectServer === 'function') {
        callbacks.onSelectServer(e.target.value);
      }
    });
  }

  // Accent Color Preset Swatches
  const swatches = container.querySelectorAll('.delt-swatch');
  const customColorInput = container.querySelector('#delt-custom-accent');

  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      const hex = swatch.getAttribute('data-hex');
      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      if (customColorInput) customColorInput.value = hex;
      callbacks.onSettingChange({ accentColor: hex });
    });
  });

  if (customColorInput) {
    customColorInput.addEventListener('input', (e) => {
      swatches.forEach(s => s.classList.remove('active'));
      callbacks.onSettingChange({ accentColor: e.target.value });
    });
  }

  // Grid Color & Toggle
  const gridColorInput = container.querySelector('#delt-grid-color');
  const gridToggle = container.querySelector('#delt-grid-toggle');

  if (gridColorInput) {
    gridColorInput.addEventListener('input', (e) => {
      callbacks.onSettingChange({ gridColor: e.target.value });
    });
  }

  if (gridToggle) {
    gridToggle.addEventListener('change', (e) => {
      callbacks.onSettingChange({ showGrid: e.target.checked });
    });
  }

  // Canvas Theme Segmented Buttons
  const themeButtons = container.querySelectorAll('#delt-canvas-theme-group .delt-pill-btn');
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme');
      themeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      callbacks.onSettingChange({ canvasTheme: theme });
    });
  });

  // Blur & Opacity Sliders
  const blurSlider = container.querySelector('#delt-blur-slider');
  const blurVal = container.querySelector('#delt-blur-val');
  if (blurSlider) {
    blurSlider.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      if (blurVal) blurVal.textContent = `${val}px`;
      callbacks.onSettingChange({ blurIntensity: val });
    });
  }

  const opacitySlider = container.querySelector('#delt-opacity-slider');
  const opacityVal = container.querySelector('#delt-opacity-val');
  if (opacitySlider) {
    opacitySlider.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      if (opacityVal) opacityVal.textContent = `${val}%`;
      callbacks.onSettingChange({ menuOpacity: val });
    });
  }

  // Reset Button
  const resetBtn = container.querySelector('#delt-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => callbacks.onResetSettings());
  }
}

/**
 * Creates floating FAB button that lets players open Delt menu during gameplay
 */
function createFabToggle() {
  let fab = document.getElementById(SELECTORS.modFabToggleId);
  if (!fab) {
    fab = document.createElement('button');
    fab.id = SELECTORS.modFabToggleId;
    fab.className = 'delt-fab';
    fab.title = 'Open Delt.io Menu (Esc)';
    fab.innerHTML = `<span>Δ</span>`;
    fab.addEventListener('click', () => {
      toggleDeltMenu();
    });
    (document.body || document.documentElement).appendChild(fab);
  }
}

/**
 * Update the list of servers displayed in the Servers tab
 * @param {Array<{name: string, players: string, mode: string, isActive: boolean}>} servers 
 * @param {Function} onSelect 
 */
export function updateDeltServerList(servers, onSelect) {
  const listContainer = document.querySelector('#delt-server-items');
  if (!listContainer) return;

  if (!servers || servers.length === 0) {
    listContainer.innerHTML = `<div class="delt-server-placeholder">No active Senpa servers detected. Retrying...</div>`;
    return;
  }

  listContainer.innerHTML = '';
  servers.forEach((srv, idx) => {
    const item = document.createElement('div');
    item.className = `delt-server-card ${srv.isActive ? 'active' : ''}`;
    item.innerHTML = `
      <div class="delt-server-meta">
        <span class="delt-srv-name">${escapeHtml(srv.name)}</span>
        <span class="delt-srv-mode">${escapeHtml(srv.mode)}</span>
      </div>
      <div class="delt-server-right">
        <span class="delt-srv-players">👥 ${escapeHtml(srv.players)}</span>
        <button class="delt-srv-btn">${srv.isActive ? 'CONNECTED' : 'JOIN'}</button>
      </div>
    `;

    item.addEventListener('click', () => {
      const allCards = listContainer.querySelectorAll('.delt-server-card');
      allCards.forEach(c => c.classList.remove('active'));
      item.classList.add('active');
      if (typeof onSelect === 'function') {
        onSelect(srv.name || idx);
      }
    });

    listContainer.appendChild(item);
  });
}

/**
 * Show the Delt menu overlay
 */
export function showDeltMenu() {
  const container = document.getElementById(SELECTORS.modOverlayId);
  const fab = document.getElementById(SELECTORS.modFabToggleId);
  if (container) {
    container.classList.remove('delt-hidden');
    container.style.display = 'flex';
  }
  if (fab) {
    fab.style.display = 'none';
  }
}

/**
 * Hide the Delt menu overlay (pointer events return cleanly to game canvas)
 */
export function hideDeltMenu() {
  const container = document.getElementById(SELECTORS.modOverlayId);
  const fab = document.getElementById(SELECTORS.modFabToggleId);
  if (container) {
    container.classList.add('delt-hidden');
    container.style.display = 'none';
  }
  if (fab) {
    fab.style.display = 'flex';
  }
  
  // Ensure focus is restored to the canvas for immediate keyboard controls
  const canvas = queryElement(SELECTORS.nativeCanvas);
  if (canvas) {
    canvas.focus();
  }
}

/**
 * Check if the menu is currently visible
 */
export function isDeltMenuVisible() {
  const container = document.getElementById(SELECTORS.modOverlayId);
  return container && container.style.display !== 'none' && !container.classList.contains('delt-hidden');
}

/**
 * Toggle menu visibility
 */
export function toggleDeltMenu() {
  if (isDeltMenuVisible()) {
    hideDeltMenu();
  } else {
    showDeltMenu();
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
