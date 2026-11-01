const sharp = require('sharp');
const path = require('path');

async function createLuxuryGoldBanner() {
  const width = 1920;
  const height = 800;

  // 1. Create seamless warm champagne and rich espresso background
  // Left 40% is dark warm espresso for crystal-clear white text contrast
  // Right 60% is radiant champagne and gold studio silk lighting
  const bgSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="studioLighting" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#120E0C" />
          <stop offset="35%" stop-color="#1C1612" />
          <stop offset="52%" stop-color="#3D2E22" />
          <stop offset="68%" stop-color="#A68352" />
          <stop offset="85%" stop-color="#DEC496" />
          <stop offset="100%" stop-color="#F7EEDF" />
        </linearGradient>
        <radialGradient id="softWarmGlow" cx="80%" cy="50%" r="55%">
          <stop offset="0%" stop-color="#FFF8EE" stop-opacity="0.6" />
          <stop offset="50%" stop-color="#DEC496" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#120E0C" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#studioLighting)" />
      <rect width="${width}" height="${height}" fill="url(#softWarmGlow)" />
    </svg>
  `);

  // Helper function to create an elegant circular jewellery card with gold ring border & drop shadow
  async function createJewelleryCard(imgPath, size, borderSize = 3) {
    const r = size / 2;
    const innerR = r - borderSize - 2;

    // Mask for circular crop
    const circleMask = Buffer.from(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${r}" cy="${r}" r="${innerR}" fill="#FFFFFF"/>
      </svg>
    `);

    // Crop image into perfect circle
    const cropped = await sharp(imgPath)
      .resize(size, size, { fit: 'cover' })
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .png()
      .toBuffer();

    // Gold border + subtle glow overlay
    const borderOverlay = Buffer.from(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFF2CE" />
            <stop offset="40%" stop-color="#D4AF37" />
            <stop offset="70%" stop-color="#AA7C11" />
            <stop offset="100%" stop-color="#EDC967" />
          </linearGradient>
          <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.35"/>
          </filter>
        </defs>
        <circle cx="${r}" cy="${r}" r="${innerR}" fill="none" stroke="url(#goldGradient)" stroke-width="${borderSize}" filter="url(#cardShadow)"/>
      </svg>
    `);

    return sharp(cropped)
      .composite([{ input: borderOverlay, blend: 'over' }])
      .png()
      .toBuffer();
  }

  // 1. Filigree Kada (Hero centerpiece - 380x380)
  const kadaCard = await createJewelleryCard('/tmp/gold_jewellery/gold_kada.jpg', 380, 4);

  // 2. Gold Stacking Rings (320x320)
  const ringsCard = await createJewelleryCard('/tmp/gold_jewellery/gold_rings.jpg', 320, 3.5);

  // 3. Gold Huggie / Drop Earrings (270x270)
  const earringsCard = await createJewelleryCard('/tmp/gold_jewellery/gold_earrings.jpg', 270, 3);

  // 4. 14K Thin Bangle Bracelet (290x290)
  const braceletCard = await createJewelleryCard('/tmp/gold_jewellery/gold_bracelets.jpg', 290, 3);

  // Elegant luxury typography and labels on the canvas
  const labelsSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .pill { fill: rgba(255, 255, 255, 0.94); stroke: #C9A84C; stroke-width: 1.5; rx: 14; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.25)); }
          .pill-text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 11px; font-weight: 700; fill: #1A1A1A; letter-spacing: 0.16em; text-anchor: middle; text-transform: uppercase; }
        </style>
      </defs>

      <!-- Labels positioned cleanly beneath / near each piece -->
      <!-- Kada -->
      <g transform="translate(1080, 580)">
        <rect class="pill" x="-95" y="-14" width="190" height="28" />
        <text class="pill-text" x="0" y="4">FILIGREE GOLD KADA</text>
      </g>
      
      <!-- Stacking Rings -->
      <g transform="translate(1560, 690)">
        <rect class="pill" x="-85" y="-14" width="170" height="28" />
        <text class="pill-text" x="0" y="4">STACKING RINGS</text>
      </g>

      <!-- Gold Earrings -->
      <g transform="translate(1620, 325)">
        <rect class="pill" x="-80" y="-14" width="160" height="28" />
        <text class="pill-text" x="0" y="4">GOLD EARRINGS</text>
      </g>

      <!-- 14k Bangle Bracelet -->
      <g transform="translate(1290, 175)">
        <rect class="pill" x="-90" y="-14" width="180" height="28" />
        <text class="pill-text" x="0" y="4">14K THIN BRACELET</text>
      </g>
    </svg>
  `);

  // Final composition
  await sharp(bgSvg)
    .composite([
      { input: kadaCard, left: 890, top: 190 },
      { input: braceletCard, left: 1145, top: 40 },
      { input: earringsCard, left: 1485, top: 60 },
      { input: ringsCard, left: 1400, top: 380 },
      { input: labelsSvg, left: 0, top: 0 },
    ])
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(path.join(__dirname, '../public/images/banners/hero-gold-jewellery.jpg'));

  console.log('Created ultra-luxury hero-gold-jewellery.jpg');
}

createLuxuryGoldBanner().catch(console.error);
