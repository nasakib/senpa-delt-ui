/**
 * Built-in Skin Presets for Senpa Mod
 * 
 * 12 beautiful, self-contained SVG skins designed to match the
 * orbital carousel in the user's reference image:
 * - Anime Girl Pink (Sakura)
 * - Crimson Demon / Ninja
 * - Chibi Idol
 * - Neko Kitty
 * - Cosmic Nebula Galaxy
 * - Shiba Doge
 * - Bioluminescent Cell
 * - Japanese Kanji Badge
 * - Cyberpunk Skull
 * - Solar Dragon
 * - Retro Sunset Grid
 * - Royal Champion Crown
 */

const svgWrap = (content) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  ${content}
</svg>
`)}`;

export const DEFAULT_ORBITAL_SKINS = [
  {
    id: 'sakura-girl',
    name: 'Sakura Anime',
    url: svgWrap(`
      <defs>
        <radialGradient id="sakuraBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fff1f2"/>
          <stop offset="70%" stop-color="#fbcfe8"/>
          <stop offset="100%" stop-color="#f472b6"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill="url(#sakuraBg)" stroke="#f43f5e" stroke-width="4"/>
      <!-- Anime Hair back -->
      <path d="M40 90 Q30 160 70 170 Q100 175 130 170 Q170 160 160 90 Z" fill="#fda4af"/>
      <!-- Face -->
      <ellipse cx="100" cy="98" rx="48" ry="46" fill="#fff5f5"/>
      <!-- Eyes -->
      <ellipse cx="80" cy="95" rx="8" ry="12" fill="#be185d"/>
      <circle cx="82" cy="92" r="3" fill="#ffffff"/>
      <ellipse cx="120" cy="95" rx="8" ry="12" fill="#be185d"/>
      <circle cx="122" cy="92" r="3" fill="#ffffff"/>
      <!-- Blush -->
      <circle cx="70" cy="108" r="8" fill="#fda4af" opacity="0.6"/>
      <circle cx="130" cy="108" r="8" fill="#fda4af" opacity="0.6"/>
      <!-- Smile -->
      <path d="M94 116 Q100 123 106 116" stroke="#e11d48" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- Bangs -->
      <path d="M52 80 Q75 105 85 92 Q100 110 115 92 Q125 105 148 80 Q100 50 52 80 Z" fill="#fb7185"/>
      <polygon points="140,55 155,70 145,75" fill="#f43f5e"/>
    `)
  },
  {
    id: 'crimson-demon',
    name: 'Red Ninja Demon',
    url: svgWrap(`
      <circle cx="100" cy="100" r="98" fill="#18181b" stroke="#ef4444" stroke-width="4"/>
      <circle cx="100" cy="100" r="75" fill="#7f1d1d"/>
      <!-- Demon Mask -->
      <path d="M50 85 Q100 45 150 85 Q140 145 100 165 Q60 145 50 85 Z" fill="#dc2626"/>
      <!-- Horns -->
      <path d="M60 70 Q50 30 75 40 Q70 60 75 75 Z" fill="#450a0a"/>
      <path d="M140 70 Q150 30 125 40 Q130 60 125 75 Z" fill="#450a0a"/>
      <!-- Glowing Eyes -->
      <polygon points="70,95 90,102 75,108" fill="#fef08a"/>
      <polygon points="130,95 110,102 125,108" fill="#fef08a"/>
      <!-- Teeth -->
      <polygon points="85,135 90,125 95,135 100,125 105,135 110,125 115,135" fill="#ffffff"/>
    `)
  },
  {
    id: 'chibi-glasses',
    name: 'Chibi Idol',
    url: svgWrap(`
      <circle cx="100" cy="100" r="98" fill="#fdf2f8" stroke="#ec4899" stroke-width="4"/>
      <!-- Purple Hair -->
      <circle cx="50" cy="70" r="25" fill="#c084fc"/>
      <circle cx="150" cy="70" r="25" fill="#c084fc"/>
      <path d="M45 80 Q100 30 155 80 Q160 140 100 160 Q40 140 45 80 Z" fill="#a855f7"/>
      <ellipse cx="100" cy="100" rx="46" ry="42" fill="#fff1f2"/>
      <!-- Glasses -->
      <rect x="68" y="85" width="26" height="22" rx="4" fill="none" stroke="#db2777" stroke-width="4"/>
      <rect x="106" y="85" width="26" height="22" rx="4" fill="none" stroke="#db2777" stroke-width="4"/>
      <line x1="94" y1="96" x2="106" y2="96" stroke="#db2777" stroke-width="4"/>
      <circle cx="81" cy="96" r="5" fill="#3b82f6"/>
      <circle cx="119" cy="96" r="5" fill="#3b82f6"/>
      <path d="M95 120 Q100 126 105 120" stroke="#f43f5e" stroke-width="3" fill="none" stroke-linecap="round"/>
    `)
  },
  {
    id: 'neko-kitty',
    name: 'Neko Kitty',
    url: svgWrap(`
      <circle cx="100" cy="100" r="98" fill="#fef3c7" stroke="#f59e0b" stroke-width="4"/>
      <!-- Cat Ears -->
      <polygon points="45,65 65,20 85,55" fill="#d97706"/>
      <polygon points="52,60 65,32 78,55" fill="#fde68a"/>
      <polygon points="155,65 135,20 115,55" fill="#d97706"/>
      <polygon points="148,60 135,32 122,55" fill="#fde68a"/>
      <!-- Head -->
      <circle cx="100" cy="105" r="52" fill="#fbbf24"/>
      <!-- Eyes -->
      <ellipse cx="80" cy="98" rx="8" ry="12" fill="#1e293b"/>
      <circle cx="83" cy="94" r="3" fill="#ffffff"/>
      <ellipse cx="120" cy="98" rx="8" ry="12" fill="#1e293b"/>
      <circle cx="123" cy="94" r="3" fill="#ffffff"/>
      <!-- Whiskers -->
      <line x1="50" y1="108" x2="70" y2="110" stroke="#78350f" stroke-width="2"/>
      <line x1="50" y1="116" x2="70" y2="114" stroke="#78350f" stroke-width="2"/>
      <line x1="150" y1="108" x2="130" y2="110" stroke="#78350f" stroke-width="2"/>
      <line x1="150" y1="116" x2="130" y2="114" stroke="#78350f" stroke-width="2"/>
      <!-- Mouth -->
      <polygon points="97,110 103,110 100,114" fill="#ef4444"/>
      <path d="M94 116 Q100 120 106 116" stroke="#78350f" stroke-width="2" fill="none"/>
    `)
  },
  {
    id: 'cosmic-nebula',
    name: 'Cosmic Nebula',
    url: svgWrap(`
      <defs>
        <radialGradient id="nebula" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#00f2fe"/>
          <stop offset="30%" stop-color="#7928ca"/>
          <stop offset="70%" stop-color="#111026"/>
          <stop offset="100%" stop-color="#000000"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill="url(#nebula)" stroke="#00f2fe" stroke-width="4"/>
      <!-- Spiral Nebula arms -->
      <path d="M100 100 Q140 60 170 100 Q150 160 100 140 Q60 120 40 70 Q60 20 100 100" stroke="#ff0080" stroke-width="12" fill="none" opacity="0.6" stroke-linecap="round"/>
      <circle cx="65" cy="55" r="3" fill="#ffffff"/>
      <circle cx="145" cy="75" r="4" fill="#00f2fe"/>
      <circle cx="120" cy="140" r="3" fill="#ffffff"/>
      <circle cx="80" cy="150" r="2" fill="#ff0080"/>
      <circle cx="100" cy="100" r="8" fill="#ffffff" filter="drop-shadow(0 0 8px #00f2fe)"/>
    `)
  },
  {
    id: 'shiba-doge',
    name: 'Shiba Doge',
    url: svgWrap(`
      <circle cx="100" cy="100" r="98" fill="#fffbeb" stroke="#d97706" stroke-width="4"/>
      <!-- Doge Fur Head -->
      <circle cx="100" cy="100" r="65" fill="#f59e0b"/>
      <polygon points="55,55 45,25 75,45" fill="#b45309"/>
      <polygon points="145,55 155,25 125,45" fill="#b45309"/>
      <!-- Muzzle -->
      <ellipse cx="100" cy="120" rx="36" ry="24" fill="#ffffff"/>
      <ellipse cx="100" cy="108" rx="8" ry="6" fill="#18181b"/>
      <!-- Eyes -->
      <circle cx="78" cy="88" r="7" fill="#18181b"/>
      <circle cx="80" cy="86" r="2.5" fill="#ffffff"/>
      <circle cx="122" cy="88" r="7" fill="#18181b"/>
      <circle cx="124" cy="86" r="2.5" fill="#ffffff"/>
      <!-- Eyebrows -->
      <ellipse cx="78" cy="74" rx="6" ry="4" fill="#fef3c7"/>
      <ellipse cx="122" cy="74" rx="6" ry="4" fill="#fef3c7"/>
    `)
  },
  {
    id: 'bio-cell',
    name: 'Bioluminescent Cell',
    url: svgWrap(`
      <defs>
        <radialGradient id="bio" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#a7f3d0"/>
          <stop offset="45%" stop-color="#10b981"/>
          <stop offset="85%" stop-color="#064e3b"/>
          <stop offset="100%" stop-color="#022c22"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill="url(#bio)" stroke="#34d399" stroke-width="4"/>
      <circle cx="100" cy="100" r="48" fill="#059669" stroke="#6ee7b7" stroke-width="3" stroke-dasharray="6,4"/>
      <circle cx="100" cy="100" r="20" fill="#a7f3d0" opacity="0.8"/>
      <circle cx="80" cy="75" r="8" fill="#6ee7b7" opacity="0.7"/>
      <circle cx="125" cy="85" r="10" fill="#6ee7b7" opacity="0.7"/>
      <circle cx="95" cy="130" r="9" fill="#6ee7b7" opacity="0.7"/>
    `)
  },
  {
    id: 'kanji-jp',
    name: 'Japanese Kanji JP',
    url: svgWrap(`
      <circle cx="100" cy="100" r="98" fill="#fdf2f8" stroke="#f472b6" stroke-width="4"/>
      <circle cx="100" cy="100" r="75" fill="#fbcfe8"/>
      <text x="100" y="118" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="52" fill="#be185d" text-anchor="middle">JP</text>
      <circle cx="100" cy="100" r="88" fill="none" stroke="#be185d" stroke-width="2" stroke-dasharray="8,6"/>
    `)
  },
  {
    id: 'cyber-skull',
    name: 'Cyberpunk Skull',
    url: svgWrap(`
      <circle cx="100" cy="100" r="98" fill="#09090b" stroke="#00f2fe" stroke-width="4"/>
      <!-- Skull shape -->
      <path d="M55 90 Q55 45 100 45 Q145 45 145 90 Q145 125 125 130 L125 155 L75 155 L75 130 Q55 125 55 90 Z" fill="#18181b" stroke="#00f2fe" stroke-width="3"/>
      <!-- Eyes -->
      <polygon points="70,85 90,92 75,105" fill="#ff007f"/>
      <polygon points="130,85 110,92 125,105" fill="#00f2fe"/>
      <!-- Nose -->
      <polygon points="100,108 95,122 105,122" fill="#09090b"/>
      <!-- Teeth -->
      <line x1="85" y1="140" x2="85" y2="155" stroke="#00f2fe" stroke-width="3"/>
      <line x1="100" y1="140" x2="100" y2="155" stroke="#00f2fe" stroke-width="3"/>
      <line x1="115" y1="140" x2="115" y2="155" stroke="#00f2fe" stroke-width="3"/>
    `)
  },
  {
    id: 'solar-dragon',
    name: 'Solar Dragon',
    url: svgWrap(`
      <defs>
        <radialGradient id="solar" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="40%" stop-color="#f97316"/>
          <stop offset="85%" stop-color="#991b1b"/>
          <stop offset="100%" stop-color="#450a0a"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill="url(#solar)" stroke="#fbbf24" stroke-width="4"/>
      <!-- Dragon slit eye -->
      <ellipse cx="100" cy="100" rx="45" ry="30" fill="#fef08a" stroke="#ca8a04" stroke-width="3"/>
      <ellipse cx="100" cy="100" rx="9" ry="32" fill="#000000"/>
      <circle cx="97" cy="90" r="3" fill="#ffffff"/>
    `)
  },
  {
    id: 'retro-sunset',
    name: 'Vaporwave Sunset',
    url: svgWrap(`
      <defs>
        <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#3b0764"/>
          <stop offset="60%" stop-color="#db2777"/>
          <stop offset="100%" stop-color="#f59e0b"/>
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill="url(#sky)" stroke="#a855f7" stroke-width="4"/>
      <!-- Sun with horizontal bars -->
      <circle cx="100" cy="95" r="42" fill="#fef08a"/>
      <rect x="58" y="85" width="84" height="4" fill="#a21caf"/>
      <rect x="58" y="94" width="84" height="6" fill="#a21caf"/>
      <rect x="58" y="105" width="84" height="8" fill="#a21caf"/>
      <rect x="58" y="118" width="84" height="10" fill="#a21caf"/>
      <!-- Grid ground -->
      <path d="M30 145 L170 145 M45 160 L155 160 M60 175 L140 175" stroke="#00f2fe" stroke-width="2"/>
    `)
  },
  {
    id: 'royal-crown',
    name: 'Royal Champion',
    url: svgWrap(`
      <circle cx="100" cy="100" r="98" fill="#1e1b4b" stroke="#eab308" stroke-width="4"/>
      <circle cx="100" cy="100" r="75" fill="#312e81"/>
      <!-- Gold Crown -->
      <polygon points="50,130 50,85 75,105 100,70 125,105 150,85 150,130" fill="#eab308" stroke="#ca8a04" stroke-width="3"/>
      <circle cx="50" cy="85" r="5" fill="#ef4444"/>
      <circle cx="100" cy="70" r="6" fill="#3b82f6"/>
      <circle cx="150" cy="85" r="5" fill="#ef4444"/>
      <rect x="55" y="130" width="90" height="10" rx="3" fill="#ca8a04"/>
    `)
  }
];

/**
 * Returns full list of 12 preset skins
 */
export function getPresetSkins() {
  return DEFAULT_ORBITAL_SKINS;
}
