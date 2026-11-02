const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const BANNERS_DIR = path.join(__dirname, '../public/images/banners');
const PRODUCTS_DIR = path.join(__dirname, '../public/images/products');

async function createMasterBanner() {
  const W = 1920;
  const H = 640;

  // 1. Load the cleaned Mohar canvas (1024 x 315) and upscale to 1920 x 640 with sharp Lanczos3 filter
  const baseCanvas = await sharp(path.join(BANNERS_DIR, 'mohar-base-cleaned.png'))
    .resize(W, H, { fit: 'fill', kernel: 'lanczos3' })
    .toBuffer();

  // 2. Prepare Necklace Cameo (Left side, nestled with left lotus)
  // Cameo dimension: 320 x 400
  const cameoW = 320;
  const cameoH = 400;

  const necklaceRaw = await sharp(path.join(PRODUCTS_DIR, 'gold-solitaire-pendant-necklace.jpg'))
    .resize(cameoW, cameoH, { fit: 'cover' })
    .toBuffer();

  const cameoMaskSvg = `
    <svg width="${cameoW}" height="${cameoH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="arch">
          <path d="M 0 ${cameoW/2} A ${cameoW/2} ${cameoW/2} 0 0 1 ${cameoW} ${cameoW/2} L ${cameoW} ${cameoH - 24} A 24 24 0 0 1 ${cameoW - 24} ${cameoH} L 24 ${cameoH} A 24 24 0 0 1 0 ${cameoH - 24} Z" />
        </clipPath>
      </defs>
      <path d="M 0 ${cameoW/2} A ${cameoW/2} ${cameoW/2} 0 0 1 ${cameoW} ${cameoW/2} L ${cameoW} ${cameoH - 24} A 24 24 0 0 1 ${cameoW - 24} ${cameoH} L 24 ${cameoH} A 24 24 0 0 1 0 ${cameoH - 24} Z" fill="#FFFFFF" />
    </svg>
  `;
  const cameoMaskBuf = await sharp(Buffer.from(cameoMaskSvg)).png().toBuffer();

  const maskedNecklace = await sharp(necklaceRaw)
    .composite([{ input: cameoMaskBuf, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 3. Prepare Earrings Cameo (Right side, nestled with right lotus)
  const earringsRaw = await sharp(path.join(PRODUCTS_DIR, 'gold-pearl-drop-jhumkas.jpg'))
    .resize(cameoW, cameoH, { fit: 'cover' })
    .toBuffer();

  const maskedEarrings = await sharp(earringsRaw)
    .composite([{ input: cameoMaskBuf, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Position cameos:
  // Left cameo: left = 190, top = 100
  // Right cameo: left = W - 190 - cameoW = 1410, top = 100
  const leftCameoX = 190;
  const rightCameoX = W - 190 - cameoW;
  const cameoY = 100;

  // 4. Create vector frames, royal gold borders, subtle dropshadows and tags
  const overlaySvg = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="cameoShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#4A341E" flood-opacity="0.25" />
        </filter>
        <linearGradient id="goldBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F3DC9B" />
          <stop offset="50%" stop-color="#C59B48" />
          <stop offset="100%" stop-color="#DFBA67" />
        </linearGradient>
        <radialGradient id="cameoGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#EED6A5" stop-opacity="0.45" />
          <stop offset="70%" stop-color="#E8CCA0" stop-opacity="0.15" />
          <stop offset="100%" stop-color="#FAF4EA" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Soft gold glow aura behind cameos -->
      <circle cx="${leftCameoX + cameoW/2}" cy="${cameoY + cameoH/2}" r="260" fill="url(#cameoGlow)" />
      <circle cx="${rightCameoX + cameoW/2}" cy="${cameoY + cameoH/2}" r="260" fill="url(#cameoGlow)" />

      <!-- Left Cameo Arch Border -->
      <g transform="translate(${leftCameoX}, ${cameoY})" filter="url(#cameoShadow)">
        <path d="M 0 ${cameoW/2} A ${cameoW/2} ${cameoW/2} 0 0 1 ${cameoW} ${cameoW/2} L ${cameoW} ${cameoH - 24} A 24 24 0 0 1 ${cameoW - 24} ${cameoH} L 24 ${cameoH} A 24 24 0 0 1 0 ${cameoH - 24} Z"
              fill="none" stroke="url(#goldBorderGrad)" stroke-width="3.5" />
        <path d="M 4 ${cameoW/2} A ${(cameoW-8)/2} ${(cameoW-8)/2} 0 0 1 ${cameoW-4} ${cameoW/2} L ${cameoW-4} ${cameoH - 28} A 20 20 0 0 1 ${cameoW - 24} ${cameoH-4} L 24 ${cameoH-4} A 20 20 0 0 1 4 ${cameoH - 28} Z"
              fill="none" stroke="#FFFFFF" stroke-width="1.2" stroke-opacity="0.65" />
      </g>

      <!-- Right Cameo Arch Border -->
      <g transform="translate(${rightCameoX}, ${cameoY})" filter="url(#cameoShadow)">
        <path d="M 0 ${cameoW/2} A ${cameoW/2} ${cameoW/2} 0 0 1 ${cameoW} ${cameoW/2} L ${cameoW} ${cameoH - 24} A 24 24 0 0 1 ${cameoW - 24} ${cameoH} L 24 ${cameoH} A 24 24 0 0 1 0 ${cameoH - 24} Z"
              fill="none" stroke="url(#goldBorderGrad)" stroke-width="3.5" />
        <path d="M 4 ${cameoW/2} A ${(cameoW-8)/2} ${(cameoW-8)/2} 0 0 1 ${cameoW-4} ${cameoW/2} L ${cameoW-4} ${cameoH - 28} A 20 20 0 0 1 ${cameoW - 24} ${cameoH-4} L 24 ${cameoH-4} A 20 20 0 0 1 4 ${cameoH - 28} Z"
              fill="none" stroke="#FFFFFF" stroke-width="1.2" stroke-opacity="0.65" />
      </g>

      <!-- Cameo Floating Pill Tags -->
      <!-- Left: NECKLACES -->
      <g transform="translate(${leftCameoX + cameoW/2}, ${cameoY + cameoH - 6})" filter="url(#cameoShadow)">
        <rect x="-85" y="-15" width="170" height="30" rx="15" fill="#FAF5EE" stroke="#B88A3B" stroke-width="1.5" />
        <text x="0" y="4" font-family="Georgia, serif" font-size="11" font-weight="bold" fill="#8A1A31" text-anchor="middle" letter-spacing="2">NECKLACES</text>
      </g>

      <!-- Right: EARRINGS -->
      <g transform="translate(${rightCameoX + cameoW/2}, ${cameoY + cameoH - 6})" filter="url(#cameoShadow)">
        <rect x="-85" y="-15" width="170" height="30" rx="15" fill="#FAF5EE" stroke="#B88A3B" stroke-width="1.5" />
        <text x="0" y="4" font-family="Georgia, serif" font-size="11" font-weight="bold" fill="#8A1A31" text-anchor="middle" letter-spacing="2">EARRINGS</text>
      </g>
    </svg>
  `;
  const overlayBuf = await sharp(Buffer.from(overlaySvg)).png().toBuffer();

  // 5. Composite together
  const masterBanner = await sharp(baseCanvas)
    .composite([
      { input: maskedNecklace, left: leftCameoX, top: cameoY },
      { input: maskedEarrings, left: rightCameoX, top: cameoY },
      { input: overlayBuf, left: 0, top: 0 }
    ])
    .jpeg({ quality: 95, mozjpeg: true })
    .toBuffer();

  // Write to public banner destinations
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-kalavies-royal.jpg'), masterBanner);
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-everyday-elegance.jpg'), masterBanner);
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-dainty-hoops.jpg'), masterBanner);
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-minimal-chains.jpg'), masterBanner);

  // Mobile version
  const mobileBanner = await sharp(masterBanner)
    .resize(1000, 600, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 90 })
    .toBuffer();
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-kalavies-royal-mobile.jpg'), mobileBanner);

  console.log('✅ Generated luxury master banner with store necklace and earrings!');
}

createMasterBanner().catch(console.error);
