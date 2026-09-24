/**
 * Clean & Modern Game Menu UI Builder
 * 
 * Faithfully matches the provided UI layout:
 * - Top icon bar (Home, Profile, Settings, Colors, Controls, Audio, Close)
 * - Central Orbital Skin Carousel (large active circle + 12 orbiting mini skin bubbles)
 * - Built-in guaranteed SVG skin illustrations
 * - Direct custom skin URL input with live preview & native sync
 * - Tag + Nickname input + Color box
 * - Region & Mode dropdowns
 * - Wide prominent PLAY button (with native button alignment to bypass anti-tamper redirect)
 * - SPECTATE & SPECTATE #1 buttons
 * - Party & WebSocket server join rows
 */

import { SELECTORS, queryElement } from './selectors.js';
import { AVAILABLE_FONTS } from './storage.js';
import { DEFAULT_ORBITAL_SKINS } from './skinPresets.js';
import { ACCENT_PRESETS, MENU_BG_PRESETS, openNativeSenpaSettings } from './settings.js';
import { getMutedPlayers, unmutePlayer } from './chat.js';
import { setNativeActiveSkin, getNativeActiveSkin } from './skins.js';
import {
  alignNativeButtons,
  hideNativeButtons,
  triggerPlay,
  triggerSpectate,
  listenEngineStatus,
  fetchLiveServers,
  selectNativeServer
} from './bridge.js';

let activeSkinIndex = 0;
let isSkinVisible = true;

export function createDeltMenu({
  settings,
  onNicknameChange,
  onTagChange,
  onSkinChange,
  onPlay,
  onSpectate,
  onSettingChange,
  onResetSettings,
  onSelectServer
}) {
  let existing = document.getElementById(SELECTORS.modOverlayId);
  if (existing) existing.remove();

  // Combine default preset skins with any custom recent skins
  const skinPresets = DEFAULT_ORBITAL_SKINS;
  const initialSkin = settings.activeSkinUrl || getNativeActiveSkin() || skinPresets[0].url;

  activeSkinIndex = skinPresets.findIndex(s => s.url === initialSkin);
  if (activeSkinIndex === -1) activeSkinIndex = 0;

  const container = document.createElement('div');
  container.id = SELECTORS.modOverlayId;
  container.className = 'delt-overlay-wrapper';

  container.innerHTML = `
    <div class="delt-glass-card" id="delt-card">
      <!-- TOP ICON NAVIGATION BAR -->
      <div class="delt-nav-bar">
        <button class="delt-nav-item active" data-tab="play" title="Play / Home">
          <i class="fas fa-home"></i>
        </button>
        <button class="delt-nav-item" data-tab="profile" title="Player Profile">
          <i class="fas fa-user"></i>
        </button>
        <button class="delt-nav-item" data-tab="settings" title="Settings & Fonts">
          <i class="fas fa-cog"></i>
        </button>
        <button class="delt-nav-item" data-tab="theme" title="Menu & Accent Colors">
          <i class="fas fa-tint"></i>
        </button>
        <button class="delt-nav-item" data-tab="controls" title="Keyboard Controls">
          <i class="fas fa-keyboard"></i>
        </button>
        <button class="delt-nav-item" data-tab="audio" title="Audio & Music">
          <i class="fas fa-music"></i>
        </button>
        <button class="delt-nav-item delt-nav-close" id="delt-nav-close-btn" title="Close Menu (Esc)">
          <i class="fas fa-times-circle"></i>
        </button>
      </div>

      <!-- TAB 1: PLAY (FAITHFUL TO SCREENSHOT) -->
      <div class="delt-tab-pane active" id="delt-tab-play">
        <!-- ORBITAL SKIN CAROUSEL -->
        <div class="delt-orbital-container">
          <!-- Left arrow -->
          <button type="button" class="delt-orbit-arrow delt-orbit-left" id="delt-skin-prev" title="Previous Skin">«</button>

          <!-- Toggle skin visibility button -->
          <button type="button" class="delt-orbit-tool delt-orbit-eye" id="delt-skin-eye" title="Toggle Skin Visibility">
            <i class="fas fa-eye"></i>
          </button>

          <!-- Orbital Ring of 12 Mini Skin Bubbles -->
          <div class="delt-orbital-ring" id="delt-orbital-ring">
            ${skinPresets.map((skin, idx) => `
              <div 
                class="delt-orbit-thumb ${idx === activeSkinIndex ? 'active' : ''}" 
                data-idx="${idx}" 
                data-url="${escapeHtml(skin.url)}" 
                style="--orbit-angle: ${(idx / skinPresets.length) * 360}deg"
                title="${skin.name}"
              >
                <img src="${escapeHtml(skin.url)}" alt="${skin.name}" />
              </div>
            `).join('')}
          </div>

          <!-- Main Central Big Skin Circle -->
          <div class="delt-center-skin-wrap">
            <div class="delt-center-skin" id="delt-active-skin-preview">
              <img id="delt-center-skin-img" src="${escapeHtml(initialSkin)}" alt="Active Skin" />
            </div>
          </div>

          <!-- Right arrow -->
          <button type="button" class="delt-orbit-arrow delt-orbit-right" id="delt-skin-next" title="Next Skin">»</button>

          <!-- Bottom +/- zoom controls -->
          <div class="delt-orbit-zoom-row">
            <button type="button" class="delt-zoom-btn" id="delt-zoom-in" title="Zoom In">+</button>
            <button type="button" class="delt-zoom-btn" id="delt-zoom-out" title="Zoom Out">-</button>
          </div>
        </div>

        <!-- INPUT SECTION: TAG + NICKNAME + COLOR BOX -->
        <div class="delt-primary-row">
          <input 
            type="text" 
            id="delt-tag-input" 
            class="delt-input delt-tag-box" 
            placeholder="TAG" 
            maxlength="5" 
            value="${escapeHtml(settings.clanTag || '')}" 
          />
          <input 
            type="text" 
            id="delt-nick-input" 
            class="delt-input delt-nick-box" 
            placeholder="Player Nickname" 
            maxlength="15" 
            value="${escapeHtml(settings.nickname || '')}" 
          />
          <div class="delt-color-swatch-box" id="delt-player-color-box" title="Accent Color">
            <input type="color" id="delt-quick-color-input" value="${settings.accentColor || '#fe70c3'}" />
          </div>
        </div>

        <!-- CUSTOM SKIN URL INPUT -->
        <div class="delt-url-row">
          <input 
            type="url" 
            id="delt-skin-url-input" 
            class="delt-input delt-url-box" 
            placeholder="Custom Skin URL (https://i.imgur.com/... or data:image/...)" 
            value="${initialSkin.startsWith('data:') ? '' : escapeHtml(initialSkin)}" 
          />
        </div>

        <!-- REGION & MODE DROPDOWNS -->
        <div class="delt-select-grid">
          <select id="delt-region-select" class="delt-select">
            <option value="North America">North America (Live)</option>
            <option value="Europe">Europe (Live)</option>
            <option value="Asia">Asia (Live)</option>
            <option value="South America">South America (Live)</option>
          </select>
          <select id="delt-mode-select" class="delt-select">
            <option value="FFA" ${settings.selectedMode === 'FFA' ? 'selected' : ''}>FFA</option>
            <option value="Party" ${settings.selectedMode === 'Party' ? 'selected' : ''}>Party</option>
            <option value="MegaSplit" ${settings.selectedMode === 'MegaSplit' ? 'selected' : ''}>MegaSplit</option>
            <option value="Crazy" ${settings.selectedMode === 'Crazy' ? 'selected' : ''}>Crazy</option>
            <option value="Instant" ${settings.selectedMode === 'Instant' ? 'selected' : ''}>Instant Merge</option>
            <option value="Teams" ${settings.selectedMode === 'Teams' ? 'selected' : ''}>Teams</option>
          </select>
          <button class="delt-btn-icon-square" id="delt-btn-show-servers" title="Server List">
            <i class="fas fa-layer-group"></i>
          </button>
        </div>

        <!-- BIG PLAY BUTTON (Target for Native #play Alignment) -->
        <button type="button" class="delt-btn-main-play" id="delt-play-target">
          <span class="delt-play-status-dot ready" id="delt-play-status-dot" title="Server Ready"></span>
          <span id="delt-play-label">PLAY</span>
        </button>

        <!-- SECONDARY ACTIONS (SPECTATE & SPECTATE #1) -->
        <div class="delt-btn-row">
          <button type="button" class="delt-btn-secondary" id="delt-spectate-top-btn" title="Automatically Spectate Leaderboard #1">
            <span class="delt-gold-crown">👑</span> SPECTATE #1
          </button>
          <button type="button" class="delt-btn-secondary" id="delt-spectate-target" title="Spectate Free Roam">
            SPECTATE
          </button>
        </div>

        <!-- LIVE SERVERS OVERLAY MODAL -->
        <div class="delt-server-modal delt-hidden" id="delt-server-modal">
          <div class="delt-server-modal-header">
            <span><i class="fas fa-server"></i> LIVE SERVERS</span>
            <button type="button" class="delt-server-modal-close" id="delt-server-modal-close">✕</button>
          </div>
          <div class="delt-server-modal-list" id="delt-server-modal-list">
            <div class="delt-server-loading">Fetching online servers...</div>
          </div>
        </div>

        <!-- PARTY CODE ROW -->
        <div class="delt-join-row">
          <input 
            type="text" 
            id="delt-party-input" 
            class="delt-input delt-party-box" 
            placeholder="Party Token / Room Code" 
            value="${escapeHtml(settings.partyToken || '')}" 
          />
          <button class="delt-btn-join" id="delt-join-party-btn">JOIN</button>
        </div>

        <!-- WEBSOCKET DIRECT CONNECT ROW -->
        <div class="delt-join-row">
          <input 
            type="text" 
            id="delt-ws-input" 
            class="delt-input delt-ws-box" 
            placeholder="wss://live-arena... or server IP" 
          />
          <button class="delt-btn-icon-action" id="delt-ws-connect-btn" title="Direct Connect">
            ⚡
          </button>
        </div>

        <!-- CREATE / ROOM BAR -->
        <div class="delt-party-bar">
          <button class="delt-btn-sm" id="delt-party-create-btn">CREATE</button>
          <span class="delt-party-code-disp" id="delt-party-code-label">PUBLIC</span>
          <button class="delt-btn-sm" id="delt-party-join-active-btn">JOIN</button>
        </div>
      </div>

      <!-- TAB 2: PROFILE -->
      <div class="delt-tab-pane" id="delt-tab-profile">
        <div class="delt-pane-heading">PLAYER PROFILE & STATS</div>
        <div class="delt-profile-card">
          <div class="delt-profile-avatar-wrap">
            <img src="${escapeHtml(initialSkin)}" id="delt-profile-avatar" alt="Avatar" />
          </div>
          <div class="delt-profile-meta">
            <span class="delt-profile-nick" id="delt-profile-nick-disp">${escapeHtml(settings.nickname || 'Player')}</span>
            <span class="delt-profile-tag" id="delt-profile-tag-disp">[${escapeHtml(settings.clanTag || 'TAG')}]</span>
          </div>
        </div>
        <div class="delt-settings-group">
          <button class="delt-btn-action-full" id="delt-open-native-profile">
            <i class="fas fa-id-card"></i> Manage Senpa Accounts & Clans
          </button>
        </div>
      </div>

      <!-- TAB 3: SETTINGS (FONTS, ENEMY SKINS, MUTED PLAYERS, NATIVE SETTINGS) -->
      <div class="delt-tab-pane" id="delt-tab-settings">
        <div class="delt-pane-heading">GAMEPLAY & VISUAL SETTINGS</div>

        <!-- ENEMY SKINS TOGGLE -->
        <div class="delt-setting-row">
          <div class="delt-setting-text">
            <span class="delt-setting-name">Hide Enemy Skins</span>
            <span class="delt-setting-hint">Hides opponent custom skins for higher FPS & clarity</span>
          </div>
          <label class="delt-switch">
            <input type="checkbox" id="delt-toggle-enemy-skins" ${settings.hideEnemySkins ? 'checked' : ''} />
            <span class="delt-slider"></span>
          </label>
        </div>

        <!-- FONT SELECTOR -->
        <div class="delt-setting-row">
          <div class="delt-setting-text">
            <span class="delt-setting-name">Game & Leaderboard Font</span>
            <span class="delt-setting-hint">Changes typography across Menu, Leaderboard, & Chat</span>
          </div>
          <select id="delt-font-select" class="delt-select delt-select-sm">
            ${AVAILABLE_FONTS.map(f => `
              <option value="${f.value}" ${settings.gameFont === f.value ? 'selected' : ''}>${f.name}</option>
            `).join('')}
          </select>
        </div>

        <!-- CANVAS ARENA GRID OVERLAY -->
        <div class="delt-setting-row">
          <div class="delt-setting-text">
            <span class="delt-setting-name">Arena Grid Lines</span>
            <span class="delt-setting-hint">Display custom background grid coordinate overlay</span>
          </div>
          <div class="delt-setting-actions">
            <input type="color" id="delt-grid-color" class="delt-color-circle" value="${settings.gridColor || '#1e2638'}" />
            <label class="delt-switch">
              <input type="checkbox" id="delt-grid-toggle" ${settings.showGrid !== false ? 'checked' : ''} />
              <span class="delt-slider"></span>
            </label>
          </div>
        </div>

        <!-- CANVAS CONTRAST THEME -->
        <div class="delt-setting-row">
          <div class="delt-setting-text">
            <span class="delt-setting-name">Canvas Mode</span>
            <span class="delt-setting-hint">Dark, High-contrast AMOLED, or Light mode</span>
          </div>
          <div class="delt-pill-group" id="delt-canvas-theme-pills">
            <button type="button" class="delt-pill ${settings.canvasTheme === 'dark' || !settings.canvasTheme ? 'active' : ''}" data-theme="dark">Dark</button>
            <button type="button" class="delt-pill ${settings.canvasTheme === 'amoled' ? 'active' : ''}" data-theme="amoled">AMOLED</button>
            <button type="button" class="delt-pill ${settings.canvasTheme === 'light' ? 'active' : ''}" data-theme="light">Light</button>
          </div>
        </div>

        <!-- MUTED PLAYERS MANAGER -->
        <div class="delt-setting-box">
          <div class="delt-box-title">
            <span>MUTED PLAYERS IN CHAT</span>
            <span id="delt-muted-count">(${settings.mutedPlayers?.length || 0})</span>
          </div>
          <div class="delt-muted-list" id="delt-muted-items">
            ${(!settings.mutedPlayers || settings.mutedPlayers.length === 0)
              ? '<span class="delt-empty-note">No players muted. Hover over a chat message or type /mute [nick].</span>'
              : settings.mutedPlayers.map(p => `
                <div class="delt-muted-tag">
                  <span>${escapeHtml(p)}</span>
                  <button type="button" class="delt-unmute-btn" data-nick="${escapeHtml(p)}" title="Unmute">✕</button>
                </div>
              `).join('')
            }
          </div>
        </div>

        <!-- NATIVE SENPA SETTINGS LAUNCHER -->
        <div class="delt-settings-group">
          <button class="delt-btn-action-full" id="delt-open-native-settings-btn">
            <i class="fas fa-sliders-h"></i> Open Original Senpa Settings (Controls, Audio, Performance)
          </button>
        </div>
      </div>

      <!-- TAB 4: THEME & COLOR CUSTOMIZER -->
      <div class="delt-tab-pane" id="delt-tab-theme">
        <div class="delt-pane-heading">MENU COLOR & THEME CUSTOMIZER</div>

        <!-- MENU BACKGROUND TONE -->
        <div class="delt-setting-box">
          <div class="delt-box-title">MENU BACKGROUND COLOR</div>
          <div class="delt-swatch-grid" id="delt-menu-bg-swatches">
            ${MENU_BG_PRESETS.map(bg => `
              <button 
                type="button" 
                class="delt-color-pill ${settings.menuBgColor === bg.hex ? 'active' : ''}" 
                data-hex="${bg.hex}"
                style="background-color: ${bg.hex}"
              >
                ${bg.name}
              </button>
            `).join('')}
          </div>
          <div class="delt-custom-color-row">
            <span>Custom Background Tone:</span>
            <input type="color" id="delt-custom-bg-input" value="${settings.menuBgColor || '#18191c'}" />
          </div>
        </div>

        <!-- ACCENT NEON COLOR -->
        <div class="delt-setting-box">
          <div class="delt-box-title">ACCENT GLOW COLOR</div>
          <div class="delt-accent-swatches-row">
            ${ACCENT_PRESETS.map(p => `
              <button 
                type="button" 
                class="delt-swatch-circle ${settings.accentColor === p.hex ? 'active' : ''}" 
                data-hex="${p.hex}" 
                style="background-color: ${p.hex}" 
                title="${p.name}"
              ></button>
            `).join('')}
            <input type="color" id="delt-custom-accent-input" class="delt-color-circle" value="${settings.accentColor || '#fe70c3'}" title="Custom Hex" />
          </div>
        </div>

        <!-- BLUR & OPACITY SLIDERS -->
        <div class="delt-setting-row">
          <div class="delt-setting-text">
            <span class="delt-setting-name">Card Transparency: <span id="delt-opacity-num">${settings.menuOpacity ?? 94}%</span></span>
          </div>
          <input type="range" id="delt-opacity-slider" class="delt-range" min="50" max="100" value="${settings.menuOpacity ?? 94}" />
        </div>

        <div class="delt-setting-row">
          <div class="delt-setting-text">
            <span class="delt-setting-name">Backdrop Blur: <span id="delt-blur-num">${settings.blurIntensity ?? 16}px</span></span>
          </div>
          <input type="range" id="delt-blur-slider" class="delt-range" min="0" max="25" value="${settings.blurIntensity ?? 16}" />
        </div>

        <div class="delt-settings-group">
          <button type="button" class="delt-btn-text" id="delt-reset-theme-btn">↺ Reset Colors to Default</button>
        </div>
      </div>

      <!-- TAB 5: CONTROLS & KEYBINDS -->
      <div class="delt-tab-pane" id="delt-tab-controls">
        <div class="delt-pane-heading">KEYBOARD CONTROLS REFERENCE</div>
        <div class="delt-key-grid">
          <div class="delt-key-card"><kbd>SPACE</kbd><span>Split 50%</span></div>
          <div class="delt-key-card"><kbd>W</kbd><span>Eject Mass / Feed</span></div>
          <div class="delt-key-card"><kbd>E</kbd><span>Macro Feed</span></div>
          <div class="delt-key-card"><kbd>1</kbd><span>Spectate #1 Player</span></div>
          <div class="delt-key-card"><kbd>Q</kbd><span>Cycle Spectate Target</span></div>
          <div class="delt-key-card"><kbd>ESC</kbd><span>Toggle Menu Overlay</span></div>
          <div class="delt-key-card"><kbd>ENTER</kbd><span>Quick Spawn / Chat</span></div>
          <div class="delt-key-card"><kbd>TAB</kbd><span>Leaderboard Toggle</span></div>
        </div>
      </div>

      <!-- TAB 6: AUDIO / SOUND -->
      <div class="delt-tab-pane" id="delt-tab-audio">
        <div class="delt-pane-heading">AUDIO & SOUND EFFECTS</div>
        <div class="delt-setting-row">
          <div class="delt-setting-text">
            <span class="delt-setting-name">Game Sound Effects</span>
            <span class="delt-setting-hint">Eating, splitting, and pop sounds</span>
          </div>
          <label class="delt-switch">
            <input type="checkbox" id="delt-sfx-toggle" checked />
            <span class="delt-slider"></span>
          </label>
        </div>
      </div>
    </div>
  `;

  (document.body || document.documentElement).appendChild(container);

  createFabToggle();

  wireMenuEvents(container, {
    settings,
    skinPresets,
    onNicknameChange,
    onTagChange,
    onSkinChange,
    onPlay,
    onSpectate,
    onSettingChange,
    onResetSettings,
    onSelectServer
  });

  // Align native buttons over PLAY and SPECTATE targets
  setTimeout(alignNativeButtons, 100);

  return container;
}

function wireMenuEvents(container, ctx) {
  const {
    settings,
    skinPresets,
    onNicknameChange,
    onTagChange,
    onSkinChange,
    onPlay,
    onSpectate,
    onSettingChange,
    onResetSettings,
    onSelectServer
  } = ctx;

  // 1. TOP NAV BAR TAB SWITCHING
  const navItems = container.querySelectorAll('.delt-nav-item:not(.delt-nav-close)');
  const tabPanes = container.querySelectorAll('.delt-tab-pane');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabTarget = item.getAttribute('data-tab');
      navItems.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      const targetPane = container.querySelector(`#delt-tab-${tabTarget}`);
      if (targetPane) targetPane.classList.add('active');

      if (tabTarget === 'play') {
        setTimeout(alignNativeButtons, 50);
      } else {
        hideNativeButtons();
      }
    });
  });

  const closeBtn = container.querySelector('#delt-nav-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', () => hideDeltMenu());

  // 2. ORBITAL SKIN CAROUSEL
  const activeSkinImg = container.querySelector('#delt-center-skin-img');
  const skinUrlInput = container.querySelector('#delt-skin-url-input');
  const orbitThumbs = container.querySelectorAll('.delt-orbit-thumb');

  const updateActiveSkin = (url, idx = -1) => {
    if (activeSkinImg) activeSkinImg.src = url;
    if (skinUrlInput) {
      skinUrlInput.value = url.startsWith('data:') ? '' : url;
    }

    orbitThumbs.forEach((thumb, i) => {
      if (i === idx || thumb.getAttribute('data-url') === url) {
        thumb.classList.add('active');
      } else {
        thumb.classList.remove('active');
      }
    });

    const avatar = container.querySelector('#delt-profile-avatar');
    if (avatar) avatar.src = url;

    setNativeActiveSkin(url);
    if (typeof onSkinChange === 'function') onSkinChange(url);
  };

  // Thumbnail clicks
  orbitThumbs.forEach((thumb) => {
    thumb.addEventListener('click', (e) => {
      e.stopPropagation();
      const url = thumb.getAttribute('data-url');
      const idx = Number(thumb.getAttribute('data-idx'));
      activeSkinIndex = idx;
      updateActiveSkin(url, idx);
    });
  });

  // Prev / Next arrows
  const prevBtn = container.querySelector('#delt-skin-prev');
  const nextBtn = container.querySelector('#delt-skin-next');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      activeSkinIndex = (activeSkinIndex - 1 + skinPresets.length) % skinPresets.length;
      updateActiveSkin(skinPresets[activeSkinIndex].url, activeSkinIndex);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      activeSkinIndex = (activeSkinIndex + 1) % skinPresets.length;
      updateActiveSkin(skinPresets[activeSkinIndex].url, activeSkinIndex);
    });
  }

  // Eye tool (toggle skin preview)
  const eyeBtn = container.querySelector('#delt-skin-eye');
  if (eyeBtn) {
    eyeBtn.addEventListener('click', () => {
      isSkinVisible = !isSkinVisible;
      if (activeSkinImg) {
        activeSkinImg.style.opacity = isSkinVisible ? '1' : '0.1';
      }
      eyeBtn.classList.toggle('active', !isSkinVisible);
    });
  }

  // Zoom +/- buttons
  let skinZoom = 1;
  const zoomIn = container.querySelector('#delt-zoom-in');
  const zoomOut = container.querySelector('#delt-zoom-out');
  if (zoomIn && activeSkinImg) {
    zoomIn.addEventListener('click', () => {
      skinZoom = Math.min(1.4, skinZoom + 0.1);
      activeSkinImg.style.transform = `scale(${skinZoom})`;
    });
  }
  if (zoomOut && activeSkinImg) {
    zoomOut.addEventListener('click', () => {
      skinZoom = Math.max(0.7, skinZoom - 0.1);
      activeSkinImg.style.transform = `scale(${skinZoom})`;
    });
  }

  // Custom Skin URL Input (live preview & sync)
  if (skinUrlInput) {
    skinUrlInput.addEventListener('input', (e) => {
      const url = e.target.value.trim();
      if (url && activeSkinImg) {
        activeSkinImg.src = url;
        setNativeActiveSkin(url);
        if (typeof onSkinChange === 'function') onSkinChange(url);
      }
    });
  }

  // 3. TAG & NICKNAME INPUTS
  const nickInput = container.querySelector('#delt-nick-input');
  const tagInput = container.querySelector('#delt-tag-input');

  if (nickInput) {
    nickInput.addEventListener('input', (e) => {
      onNicknameChange(e.target.value);
      const profileNick = container.querySelector('#delt-profile-nick-disp');
      if (profileNick) profileNick.textContent = e.target.value || 'Player';
    });
  }

  if (tagInput) {
    tagInput.addEventListener('input', (e) => {
      onTagChange(e.target.value);
      const profileTag = container.querySelector('#delt-profile-tag-disp');
      if (profileTag) profileTag.textContent = `[${e.target.value || 'TAG'}]`;
    });
  }

  // Quick Accent Color Picker on Play Tab
  const quickColor = container.querySelector('#delt-quick-color-input');
  if (quickColor) {
    quickColor.addEventListener('input', (e) => {
      onSettingChange({ accentColor: e.target.value });
    });
  }

  // 4. MAIN PLAY & SPECTATE ACTION BUTTONS
  const playTarget = container.querySelector('#delt-play-target');
  const playLabel = container.querySelector('#delt-play-label');
  const playDot = container.querySelector('#delt-play-status-dot');

  if (playTarget) {
    playTarget.addEventListener('click', (e) => {
      e.stopPropagation();
      if (playLabel) playLabel.textContent = 'SPAWNING...';
      playTarget.classList.add('delt-btn-loading');
      if (typeof onPlay === 'function') onPlay();
      else triggerPlay();
    });
  }

  const spectateTarget = container.querySelector('#delt-spectate-target');
  if (spectateTarget) {
    spectateTarget.addEventListener('click', (e) => {
      e.stopPropagation();
      hideDeltMenu();
      if (typeof onSpectate === 'function') onSpectate();
      else triggerSpectate();
    });
  }

  // Engine status listener to keep button state updated
  listenEngineStatus((statusDetail) => {
    if (!playLabel || !playDot) return;
    if (statusDetail.status === 'ready' || statusDetail.status === 'connected') {
      playLabel.textContent = 'PLAY';
      playDot.className = 'delt-play-status-dot ready';
      playDot.title = 'Server Ready';
    } else if (statusDetail.status === 'connecting') {
      playLabel.textContent = 'CONNECTING...';
      playDot.className = 'delt-play-status-dot connecting';
      playDot.title = 'Connecting to Server...';
    } else if (statusDetail.status === 'waiting_handshake') {
      playLabel.textContent = 'JOINING...';
      playDot.className = 'delt-play-status-dot connecting';
      playDot.title = 'Waiting for Server Handshake...';
    }
  });

  window.addEventListener('delt-play-triggered', () => {
    hideDeltMenu();
  });

  // 5. LIVE SERVERS MODAL
  const serverModal = container.querySelector('#delt-server-modal');
  const showServersBtn = container.querySelector('#delt-btn-show-servers');
  const closeServerModal = container.querySelector('#delt-server-modal-close');
  const serverListEl = container.querySelector('#delt-server-modal-list');

  const renderServers = async () => {
    if (!serverListEl) return;
    serverListEl.innerHTML = '<div class="delt-server-loading">Fetching online servers...</div>';
    const servers = await fetchLiveServers();
    if (!servers.length) {
      serverListEl.innerHTML = '<div class="delt-empty-note">No servers found. Check your internet connection.</div>';
      return;
    }

    serverListEl.innerHTML = servers.map(s => `
      <div class="delt-server-row-item" data-host="${escapeHtml(s.host)}" data-region="${escapeHtml(s.region || '')}">
        <div class="delt-server-info-col">
          <span class="delt-server-row-name">${escapeHtml(s.name || s.host)}</span>
          <span class="delt-server-row-sub">${escapeHtml(s.region || '')} • ${escapeHtml(s.mode_name || s.mode || 'FFA')}</span>
        </div>
        <div class="delt-server-meta-col">
          <span class="delt-server-badge-players">${escapeHtml(s.num_players || 0)}/${escapeHtml(s.max_players || 100)}</span>
          <button type="button" class="delt-btn-server-connect">CONNECT</button>
        </div>
      </div>
    `).join('');

    serverListEl.querySelectorAll('.delt-server-row-item').forEach(item => {
      item.addEventListener('click', () => {
        const host = item.getAttribute('data-host');
        const region = item.getAttribute('data-region');
        if (region) {
          localStorage.setItem('senpaio:region', region);
          const regionSelect = container.querySelector('#delt-region-select');
          if (regionSelect) {
            if (region === 'NA') regionSelect.value = 'North America';
            else if (region === 'EU') regionSelect.value = 'Europe';
            else if (region === 'AS') regionSelect.value = 'Asia';
          }
        }
        selectNativeServer(host);
        if (serverModal) serverModal.classList.add('delt-hidden');
      });
    });
  };

  if (showServersBtn && serverModal) {
    showServersBtn.addEventListener('click', () => {
      serverModal.classList.toggle('delt-hidden');
      if (!serverModal.classList.contains('delt-hidden')) {
        renderServers();
      }
    });
  }

  if (closeServerModal && serverModal) {
    closeServerModal.addEventListener('click', () => {
      serverModal.classList.add('delt-hidden');
    });
  }

  // 6. SPECTATE TOP BUTTON
  const spectateTopBtn = container.querySelector('#delt-spectate-top-btn');
  if (spectateTopBtn) {
    spectateTopBtn.addEventListener('click', () => {
      hideDeltMenu();
      spectateTopPlayer();
    });
  }

  // Mode & Region Select
  const modeSelect = container.querySelector('#delt-mode-select');
  if (modeSelect) {
    modeSelect.addEventListener('change', (e) => {
      onSettingChange({ selectedMode: e.target.value });
      if (typeof onSelectServer === 'function') onSelectServer(e.target.value);
    });
  }

  // 5. SETTINGS TAB
  const enemySkinsToggle = container.querySelector('#delt-toggle-enemy-skins');
  if (enemySkinsToggle) {
    enemySkinsToggle.addEventListener('change', (e) => {
      onSettingChange({ hideEnemySkins: e.target.checked });
    });
  }

  const fontSelect = container.querySelector('#delt-font-select');
  if (fontSelect) {
    fontSelect.addEventListener('change', (e) => {
      onSettingChange({ gameFont: e.target.value });
    });
  }

  const gridColor = container.querySelector('#delt-grid-color');
  const gridToggle = container.querySelector('#delt-grid-toggle');
  if (gridColor) gridColor.addEventListener('input', (e) => onSettingChange({ gridColor: e.target.value }));
  if (gridToggle) gridToggle.addEventListener('change', (e) => onSettingChange({ showGrid: e.target.checked }));

  const canvasPills = container.querySelectorAll('#delt-canvas-theme-pills .delt-pill');
  canvasPills.forEach(pill => {
    pill.addEventListener('click', () => {
      canvasPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      onSettingChange({ canvasTheme: pill.getAttribute('data-theme') });
    });
  });

  container.querySelectorAll('.delt-unmute-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const nick = btn.getAttribute('data-nick');
      unmutePlayer(nick);
      btn.parentElement.remove();
    });
  });

  const nativeSettingsBtn = container.querySelector('#delt-open-native-settings-btn');
  if (nativeSettingsBtn) {
    nativeSettingsBtn.addEventListener('click', () => openNativeSenpaSettings());
  }

  // 6. THEME TAB
  const bgSwatches = container.querySelectorAll('#delt-menu-bg-swatches .delt-color-pill');
  const customBgInput = container.querySelector('#delt-custom-bg-input');

  bgSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      const hex = swatch.getAttribute('data-hex');
      bgSwatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      if (customBgInput) customBgInput.value = hex;
      onSettingChange({ menuBgColor: hex });
    });
  });

  if (customBgInput) {
    customBgInput.addEventListener('input', (e) => {
      bgSwatches.forEach(s => s.classList.remove('active'));
      onSettingChange({ menuBgColor: e.target.value });
    });
  }

  const accentSwatches = container.querySelectorAll('.delt-accent-swatches-row .delt-swatch-circle');
  const customAccentInput = container.querySelector('#delt-custom-accent-input');

  accentSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      const hex = swatch.getAttribute('data-hex');
      accentSwatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      if (customAccentInput) customAccentInput.value = hex;
      if (quickColor) quickColor.value = hex;
      onSettingChange({ accentColor: hex });
    });
  });

  if (customAccentInput) {
    customAccentInput.addEventListener('input', (e) => {
      accentSwatches.forEach(s => s.classList.remove('active'));
      if (quickColor) quickColor.value = e.target.value;
      onSettingChange({ accentColor: e.target.value });
    });
  }

  const opSlider = container.querySelector('#delt-opacity-slider');
  const opNum = container.querySelector('#delt-opacity-num');
  if (opSlider) {
    opSlider.addEventListener('input', (e) => {
      if (opNum) opNum.textContent = `${e.target.value}%`;
      onSettingChange({ menuOpacity: Number(e.target.value) });
    });
  }

  const blurSlider = container.querySelector('#delt-blur-slider');
  const blurNum = container.querySelector('#delt-blur-num');
  if (blurSlider) {
    blurSlider.addEventListener('input', (e) => {
      if (blurNum) blurNum.textContent = `${e.target.value}px`;
      onSettingChange({ blurIntensity: Number(e.target.value) });
    });
  }

  const resetThemeBtn = container.querySelector('#delt-reset-theme-btn');
  if (resetThemeBtn) resetThemeBtn.addEventListener('click', () => onResetSettings());
}

function createFabToggle() {
  let fab = document.getElementById(SELECTORS.modFabToggleId);
  if (!fab) {
    fab = document.createElement('button');
    fab.id = SELECTORS.modFabToggleId;
    fab.className = 'delt-fab';
    fab.title = 'Open Menu (Esc)';
    fab.innerHTML = `<i class="fas fa-bars"></i>`;
    fab.addEventListener('click', () => toggleDeltMenu());
    (document.body || document.documentElement).appendChild(fab);
  }
}

export function showDeltMenu() {
  const container = document.getElementById(SELECTORS.modOverlayId);
  const fab = document.getElementById(SELECTORS.modFabToggleId);
  if (container) {
    container.classList.remove('delt-hidden');
    container.style.display = 'flex';
  }
  if (fab) fab.style.display = 'none';

  setTimeout(alignNativeButtons, 50);
}

export function hideDeltMenu() {
  const container = document.getElementById(SELECTORS.modOverlayId);
  const fab = document.getElementById(SELECTORS.modFabToggleId);
  if (container) {
    container.classList.add('delt-hidden');
    container.style.display = 'none';
  }
  if (fab) fab.style.display = 'flex';

  hideNativeButtons();

  const canvas = queryElement(SELECTORS.nativeCanvas);
  if (canvas) canvas.focus();
}

export function isDeltMenuVisible() {
  const container = document.getElementById(SELECTORS.modOverlayId);
  return container && container.style.display !== 'none' && !container.classList.contains('delt-hidden');
}

export function toggleDeltMenu() {
  if (isDeltMenuVisible()) hideDeltMenu();
  else showDeltMenu();
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
