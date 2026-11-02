const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const BANNERS_DIR = path.join(__dirname, '../public/images/banners');

async function prepareSingleCard(imgPath, w, h, labelText, rx = 24) {
  const resized = await sharp(imgPath)
    .resize(w, h, { fit: 'cover', position: 'center' })
    .toBuffer();

  const maskSvg = Buffer.from(`
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${w}" height="${h}" rx="${rx}" ry="${rx}" fill="#FFFFFF" />
    </svg>
  `);

  const upperText = labelText.toUpperCase().replace(/&/g, '&amp;');
  const tagWidth = upperText.length * 8.5 + 34;
  const borderSvg = Buffer.from(`
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer soft glow and luxury double border -->
      <rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="${rx}" ry="${rx}" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-opacity="0.95" />
      <rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="${rx}" ry="${rx}" fill="none" stroke="#C9A84C" stroke-width="1.5" stroke-opacity="0.5" />
      
      <!-- Bottom Floating Pill Tag Badge -->
      <g transform="translate(24, ${h - 52})">
        <rect width="${tagWidth}" height="32" rx="16" fill="#FFFFFF" fill-opacity="0.96" filter="drop-shadow(0px 4px 10px rgba(0,0,0,0.12))" />
        <circle cx="16" cy="16" r="4.5" fill="#C9A84C" />
        <text x="30" y="20.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#201C18" letter-spacing="0.14em">${upperText}</text>
      </g>
    </svg>
  `);

  const masked = await sharp(resized)
    .composite([{ input: maskSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  return sharp(masked)
    .composite([{ input: borderSvg }])
    .png()
    .toBuffer();
}

function makeSunlitBackgroundSvg(w, h, stop1 = '#FAF8F5', stop2 = '#F4EFE6', stop3 = '#EDE5D6') {
  return Buffer.from(`
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${stop1}" />
          <stop offset="42%" stop-color="${stop2}" />
          <stop offset="75%" stop-color="${stop3}" />
          <stop offset="100%" stop-color="#E8DFCE" />
        </linearGradient>
        <radialGradient id="sunlitGlow" cx="74%" cy="46%" r="62%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
          <stop offset="55%" stop-color="#FFFFFF" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#bgGrad)" />
      <rect width="${w}" height="${h}" fill="url(#sunlitGlow)" />
      <!-- Delicate gold hairline divider separating left editorial copy from right image card -->
      <line x1="910" y1="80" x2="910" y2="${h - 80}" stroke="#C9A84C" stroke-width="1.2" stroke-opacity="0.32" stroke-dasharray="6 8" />
    </svg>
  `);
}

async function run() {
  const width = 1920;
  const height = 720;
  const cardW = 860;
  const cardH = 560;
  const cardTop = 80;
  const cardLeft = 960;

  // -------------------------------------------------------------
  // SLIDER 1: GOLD HEART BOW PENDANT NECKLACE (user-gold-heart-necklace.jpg)
  // -------------------------------------------------------------
  console.log('Generating Banner 1: Gold Heart Bow Necklace...');
  const bg1 = makeSunlitBackgroundSvg(width, height, '#FAF8F5', '#F5EFE7', '#ECE4D4');
  const card1 = await prepareSingleCard(
    path.join(BANNERS_DIR, 'user-gold-heart-necklace.jpg'),
    cardW,
    cardH,
    'Gold Heart Bow Pendant'
  );

  const banner1Path = path.join(BANNERS_DIR, 'hero-everyday-elegance.jpg');
  const banner1Necklace = path.join(BANNERS_DIR, 'hero-necklace.jpg');
  const banner1Royal = path.join(BANNERS_DIR, 'hero-kalavies-royal.jpg');

  const b1Buffer = await sharp(bg1)
    .composite([{ input: card1, top: cardTop, left: cardLeft }])
    .jpeg({ quality: 94 })
    .toBuffer();

  fs.writeFileSync(banner1Path, b1Buffer);
  fs.writeFileSync(banner1Necklace, b1Buffer);
  fs.writeFileSync(banner1Royal, b1Buffer);

  // -------------------------------------------------------------
  // SLIDER 2: OXIDISED PEACOCK TURQUOISE EARRINGS (user-peacock-earrings.jpg)
  // -------------------------------------------------------------
  console.log('Generating Banner 2: Peacock Turquoise Earrings...');
  const bg2 = makeSunlitBackgroundSvg(width, height, '#FCFAF7', '#F6F2EC', '#EFE9DF');
  const card2 = await prepareSingleCard(
    path.join(BANNERS_DIR, 'user-peacock-earrings.jpg'),
    cardW,
    cardH,
    'Peacock Turquoise Earrings'
  );

  const banner2Path = path.join(BANNERS_DIR, 'hero-dainty-hoops.jpg');
  const banner2Earrings = path.join(BANNERS_DIR, 'hero-earrings.jpg');

  const b2Buffer = await sharp(bg2)
    .composite([{ input: card2, top: cardTop, left: cardLeft }])
    .jpeg({ quality: 94 })
    .toBuffer();

  fs.writeFileSync(banner2Path, b2Buffer);
  fs.writeFileSync(banner2Earrings, b2Buffer);

  // -------------------------------------------------------------
  // SLIDER 3: CRYSTAL FLORAL DROP EARRINGS (user-crystal-earrings.png)
  // -------------------------------------------------------------
  console.log('Generating Banner 3: Crystal Floral Drop Earrings...');
  const bg3 = makeSunlitBackgroundSvg(width, height, '#FAF8F5', '#F5EFE7', '#ECE3D3');
  // For crystal earrings on white: create clean padded card
  const card3 = await prepareSingleCard(
    path.join(BANNERS_DIR, 'user-crystal-earrings.png'),
    cardW,
    cardH,
    'Dainty Crystal Floral Drops'
  );

  const banner3Path = path.join(BANNERS_DIR, 'hero-minimal-chains.jpg');
  const banner3Bangles = path.join(BANNERS_DIR, 'hero-bangles.jpg');

  const b3Buffer = await sharp(bg3)
    .composite([{ input: card3, top: cardTop, left: cardLeft }])
    .jpeg({ quality: 94 })
    .toBuffer();

  fs.writeFileSync(banner3Path, b3Buffer);
  fs.writeFileSync(banner3Bangles, b3Buffer);

  // Mobile versions (single centered cards)
  const mobileW = 900;
  const mobileH = 600;
  for (const [srcFile, dstFile] of [
    ['hero-everyday-elegance.jpg', 'hero-necklace-mobile.jpg'],
    ['hero-dainty-hoops.jpg', 'hero-earrings-mobile.jpg'],
    ['hero-minimal-chains.jpg', 'hero-bangles-mobile.jpg']
  ]) {
    const mobBuf = await sharp(path.join(BANNERS_DIR, srcFile))
      .resize(mobileW, mobileH, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 90 })
      .toBuffer();
    fs.writeFileSync(path.join(BANNERS_DIR, dstFile), mobBuf);
  }

  console.log('\n🎉 ALL 3 BANNERS GENERATED WITH SUNLIT BACKGROUND & USER IMAGE CARDS!');
}

run().catch(console.error);
