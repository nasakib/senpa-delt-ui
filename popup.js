const STORAGE_KEY = 'delt_senpa_mod_settings_v1';

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('mod-active-toggle');
  const swatches = document.querySelectorAll('.popup-swatch');

  // Load current settings
  if (chrome && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get([STORAGE_KEY], (res) => {
      const settings = res[STORAGE_KEY] || {};
      if (typeof settings.modEnabled === 'boolean') {
        toggle.checked = settings.modEnabled;
      }
      if (settings.accentColor) {
        swatches.forEach(s => {
          if (s.dataset.color === settings.accentColor) {
            s.classList.add('active');
          }
        });
      }
    });
  }

  // Toggle mod enable/disable
  toggle.addEventListener('change', () => {
    updateSetting({ modEnabled: toggle.checked });
  });

  // Swatch click
  swatches.forEach(s => {
    s.addEventListener('click', () => {
      swatches.forEach(other => other.classList.remove('active'));
      s.classList.add('active');
      updateSetting({ accentColor: s.dataset.color });
    });
  });

  function updateSetting(partial) {
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([STORAGE_KEY], (res) => {
        const cur = res[STORAGE_KEY] || {};
        const updated = { ...cur, ...partial };
        chrome.storage.local.set({ [STORAGE_KEY]: updated });
      });
    }
  }
});
