const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const INSP_PATH = '/Users/apple/.gemini/antigravity/brain/70a9e96f-cda9-4f6f-bdb5-215aa945162b/.user_uploaded/media_1793638911458_15188104.png';
const BANNERS_DIR = path.join(__dirname, '../public/images/banners');
const PRODUCTS_DIR = path.join(__dirname, '../public/images/products');

async function createCleanBaseCanvas(W, H) {
  const { data, info } = await sharp(INSP_PATH).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const c = info.channels;
  const buf = Buffer.from(data);

  const getPx = (x, y) => {
    const idx = (y * w + x) * c;
    return [buf[idx], buf[idx+1], buf[idx+2]];
  };

  const setPx = (x, y, r, g, b) => {
    const idx = (y * w + x) * c;
    buf[idx] = r;
    buf[idx+1] = g;
    buf[idx+2] = b;
  };

  // Inpaint center text
  for (let y = 50; y < 215; y++) {
    for (let x = 260; x < 770; x++) {
      const topY = 45;
      const botY = 250;
      const leftX = 250;
      const rightX = 780;

      const vFactor = (y - topY) / (botY - topY);
      const hFactor = (x - leftX) / (rightX - leftX);

      const topPx = getPx(x, topY);
      const botPx = getPx(x, botY);
      const leftPx = getPx(leftX, y);
      const rightPx = getPx(Math.min(w - 1, rightX), y);

      const r = Math.round((1 - vFactor) * topPx[0] + vFactor * botPx[0] * 0.5 + ((1 - hFactor) * leftPx[0] + hFactor * rightPx[0]) * 0.5);
      const g = Math.round((1 - vFactor) * topPx[1] + vFactor * botPx[1] * 0.5 + ((1 - hFactor) * leftPx[1] + hFactor * rightPx[1]) * 0.5);
      const b = Math.round((1 - vFactor) * topPx[2] + vFactor * botPx[2] * 0.5 + ((1 - hFactor) * leftPx[2] + hFactor * rightPx[2]) * 0.5);

      setPx(x, y, r, g, b);
    }
  }

  // Inpaint button
  for (let y = 190; y < 250; y++) {
    for (let x = 775; x < 930; x++) {
      const topY = 180;
      const botY = 255;
      const vFactor = (y - topY) / (botY - topY);
      const topPx = getPx(x, topY);
      const botPx = getPx(x, botY);
      setPx(x, y,
        Math.round((1 - vFactor) * topPx[0] + vFactor * botPx[0]),
        Math.round((1 - vFactor) * topPx[1] + vFactor * botPx[1]),
        Math.round((1 - vFactor) * topPx[2] + vFactor * botPx[2])
      );
    }
  }

  return await sharp(buf, { raw: { width: w, height: h, channels: c } })
    .resize(W, H, { fit: 'fill', kernel: 'lanczos3' })
    .png()
    .toBuffer();
}

async function buildSingleJewelleryBanner({
  baseCanvas,
  jewelleryImagePath,
  tagLabel,
  outFileName,
  mobileOutFileName,
  jewellerySide = 'right'
}) {
  const W = 1920;
  const H = 640;

  // Cameo dimensions (prominent single jewellery showcase)
  const cameoW = 370;
  const cameoH = 430;
  const cameoY = 85;
  const cameoX = jewellerySide === 'right' ? (W - 170 - cameoW) : 170;

  // Mask for arched cameo
  const archMaskSvg = `
    <svg width="${cameoW}" height="${cameoH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="archClip">
          <path d="M 0 ${cameoW/2} A ${cameoW/2} ${cameoW/2} 0 0 1 ${cameoW} ${cameoW/2} L ${cameoW} ${cameoH - 24} A 24 24 0 0 1 ${cameoW - 24} ${cameoH} L 24 ${cameoH} A 24 24 0 0 1 0 ${cameoH - 24} Z" />
        </clipPath>
      </defs>
      <path d="M 0 ${cameoW/2} A ${cameoW/2} ${cameoW/2} 0 0 1 ${cameoW} ${cameoW/2} L ${cameoW} ${cameoH - 24} A 24 24 0 0 1 ${cameoW - 24} ${cameoH} L 24 ${cameoH} A 24 24 0 0 1 0 ${cameoH - 24} Z" fill="#FFFFFF" />
    </svg>
  `;
  const archMaskBuf = await sharp(Buffer.from(archMaskSvg)).png().toBuffer();

  const jewelleryRaw = await sharp(jewelleryImagePath)
    .resize(cameoW, cameoH, { fit: 'cover' })
    .toBuffer();

  const maskedJewellery = await sharp(jewelleryRaw)
    .composite([{ input: archMaskBuf, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Vector frame, gold border, soft shadow, label pill, and floating petals
  const overlaySvg = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="cameoShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#4A341E" flood-opacity="0.28" />
        </filter>
        <linearGradient id="goldBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F5DF9E" />
          <stop offset="50%" stop-color="#C59B48" />
          <stop offset="100%" stop-color="#E2C272" />
        </linearGradient>
        <radialGradient id="cameoGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#EED6A5" stop-opacity="0.55" />
          <stop offset="70%" stop-color="#E8CCA0" stop-opacity="0.18" />
          <stop offset="100%" stop-color="#FAF4EA" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Soft gold glow aura behind the single jewellery piece -->
      <circle cx="${cameoX + cameoW/2}" cy="${cameoY + cameoH/2}" r="280" fill="url(#cameoGlow)" />

      <!-- Cameo Arch Border -->
      <g transform="translate(${cameoX}, ${cameoY})" filter="url(#cameoShadow)">
        <path d="M 0 ${cameoW/2} A ${cameoW/2} ${cameoW/2} 0 0 1 ${cameoW} ${cameoW/2} L ${cameoW} ${cameoH - 24} A 24 24 0 0 1 ${cameoW - 24} ${cameoH} L 24 ${cameoH} A 24 24 0 0 1 0 ${cameoH - 24} Z"
              fill="none" stroke="url(#goldBorderGrad)" stroke-width="3.8" />
        <path d="M 4 ${cameoW/2} A ${(cameoW-8)/2} ${(cameoW-8)/2} 0 0 1 ${cameoW-4} ${cameoW/2} L ${cameoW-4} ${cameoH - 28} A 20 20 0 0 1 ${cameoW - 24} ${cameoH-4} L 24 ${cameoH-4} A 20 20 0 0 1 4 ${cameoH - 28} Z"
              fill="none" stroke="#FFFFFF" stroke-width="1.2" stroke-opacity="0.65" />
      </g>

      <!-- Cameo Floating Pill Label -->
      <g transform="translate(${cameoX + cameoW/2}, ${cameoY + cameoH - 6})" filter="url(#cameoShadow)">
        <rect x="-95" y="-16" width="190" height="32" rx="16" fill="#FAF5EE" stroke="#B88A3B" stroke-width="1.6" />
        <text x="0" y="5" font-family="Georgia, serif" font-size="11.5" font-weight="bold" fill="#8A1A31" text-anchor="middle" letter-spacing="2.2">${tagLabel}</text>
      </g>

      <!-- Subtle Floating Lotus Petals drifting around the single jewellery piece -->
      <g transform="translate(${cameoX - 45}, ${cameoY + 60}) rotate(-25) scale(0.65)">
        <path d="M 0 0 C 25 -45 55 -55 75 -22 C 85 12 55 45 22 32 Z" fill="#E88B9E" fill-opacity="0.85" />
      </g>
      <g transform="translate(${cameoX + cameoW + 20}, ${cameoY + 280}) rotate(30) scale(0.55)">
        <path d="M 0 0 C 25 -45 55 -55 75 -22 C 85 12 55 45 22 32 Z" fill="#F0A8B6" fill-opacity="0.8" />
      </g>
      <g transform="translate(${cameoX - 30}, ${cameoY + cameoH - 30}) rotate(15) scale(0.5)">
        <path d="M 0 0 C 25 -45 55 -55 75 -22 C 85 12 55 45 22 32 Z" fill="#E88B9E" fill-opacity="0.75" />
      </g>
    </svg>
  `;
  const overlayBuf = await sharp(Buffer.from(overlaySvg)).png().toBuffer();

  const finalBanner = await sharp(baseCanvas)
    .composite([
      { input: maskedJewellery, left: cameoX, top: cameoY },
      { input: overlayBuf, left: 0, top: 0 }
    ])
    .jpeg({ quality: 95, mozjpeg: true })
    .toBuffer();

  // Save desktop version
  const fullPath = path.join(BANNERS_DIR, outFileName);
  fs.writeFileSync(fullPath, finalBanner);
  console.log(`✅ Generated ${outFileName}`);

  // Generate mobile optimized version (1000 x 600)
  if (mobileOutFileName) {
    const mobileBanner = await sharp(finalBanner)
      .resize(1000, 600, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 90 })
      .toBuffer();
    fs.writeFileSync(path.join(BANNERS_DIR, mobileOutFileName), mobileBanner);
    console.log(`✅ Generated ${mobileOutFileName}`);
  }
}

async function run() {
  const W = 1920;
  const H = 640;
  console.log('Generating clean base canvas...');
  const baseCanvas = await createCleanBaseCanvas(W, H);

  // ========================================================
  // SLIDER 1: ONLY ONE JEWELLERY IMAGE -> NECKLACE
  // ========================================================
  await buildSingleJewelleryBanner({
    baseCanvas,
    jewelleryImagePath: path.join(PRODUCTS_DIR, 'gold-solitaire-pendant-necklace.jpg'),
    tagLabel: 'NECKLACES',
    outFileName: 'hero-necklace.jpg',
    mobileOutFileName: 'hero-necklace-mobile.jpg',
    jewellerySide: 'right'
  });
  fs.copyFileSync(path.join(BANNERS_DIR, 'hero-necklace.jpg'), path.join(BANNERS_DIR, 'hero-kalavies-royal.jpg'));
  fs.copyFileSync(path.join(BANNERS_DIR, 'hero-necklace.jpg'), path.join(BANNERS_DIR, 'hero-everyday-elegance.jpg'));
  fs.copyFileSync(path.join(BANNERS_DIR, 'hero-necklace-mobile.jpg'), path.join(BANNERS_DIR, 'hero-kalavies-royal-mobile.jpg'));

  // ========================================================
  // SLIDER 2: ONLY ONE JEWELLERY IMAGE -> EARRINGS
  // ========================================================
  await buildSingleJewelleryBanner({
    baseCanvas,
    jewelleryImagePath: path.join(PRODUCTS_DIR, 'gold-pearl-drop-jhumkas.jpg'),
    tagLabel: 'EARRINGS',
    outFileName: 'hero-earrings.jpg',
    mobileOutFileName: 'hero-earrings-mobile.jpg',
    jewellerySide: 'right'
  });
  fs.copyFileSync(path.join(BANNERS_DIR, 'hero-earrings.jpg'), path.join(BANNERS_DIR, 'hero-dainty-hoops.jpg'));

  // ========================================================
  // SLIDER 3: ONLY ONE JEWELLERY IMAGE -> BANGLES
  // ========================================================
  await buildSingleJewelleryBanner({
    baseCanvas,
    jewelleryImagePath: path.join(PRODUCTS_DIR, 'gold-minimal-wire-bangle.jpg'),
    tagLabel: 'BANGLES',
    outFileName: 'hero-bangles.jpg',
    mobileOutFileName: 'hero-bangles-mobile.jpg',
    jewellerySide: 'right'
  });
  fs.copyFileSync(path.join(BANNERS_DIR, 'hero-bangles.jpg'), path.join(BANNERS_DIR, 'hero-minimal-chains.jpg'));

  console.log('\n🎉 ALL 3 SLIDERS GENERATED WITH ONLY ONE JEWELLERY IMAGE EACH!');
}

run().catch(console.error);
