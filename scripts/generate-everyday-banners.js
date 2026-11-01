const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const BANNERS_DIR = path.join(__dirname, '../public/images/banners');

async function prepareCard(imgPath, w, h, labelText, rx = 18) {
  const resized = await sharp(imgPath)
    .resize(w, h, { fit: 'cover', position: 'center' })
    .toBuffer();

  const maskSvg = Buffer.from(`
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${w}" height="${h}" rx="${rx}" ry="${rx}" fill="#FFFFFF" />
    </svg>
  `);

  const upperText = labelText.toUpperCase().replace(/&/g, '&amp;');
  const tagWidth = upperText.length * 8.5 + 28;
  const borderSvg = Buffer.from(`
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${rx}" ry="${rx}" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-opacity="0.85" />
      <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${rx}" ry="${rx}" fill="none" stroke="#C9A84C" stroke-width="1.2" stroke-opacity="0.45" />
      <g transform="translate(18, ${h - 44})">
        <rect width="${tagWidth}" height="28" rx="14" fill="#FFFFFF" fill-opacity="0.95" />
        <circle cx="12" cy="14" r="3.5" fill="#C9A84C" />
        <text x="24" y="18" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" fill="#201C18" letter-spacing="0.1em">${upperText}</text>
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

function makeBackgroundSvg(w, h, stop1 = '#FAF8F5', stop2 = '#F4EFE6', stop3 = '#EDE5D6') {
  return Buffer.from(`
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${stop1}" />
          <stop offset="38%" stop-color="${stop2}" />
          <stop offset="70%" stop-color="${stop3}" />
          <stop offset="100%" stop-color="#E7DDCB" />
        </linearGradient>
        <radialGradient id="sunlitGlow" cx="72%" cy="45%" r="65%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
          <stop offset="55%" stop-color="#FFFFFF" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#bgGrad)" />
      <rect width="${w}" height="${h}" fill="url(#sunlitGlow)" />
      <line x1="880" y1="90" x2="880" y2="710" stroke="#C9A84C" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="6 8" />
    </svg>
  `);
}

async function generateAllBanners() {
  const width = 1920;
  const height = 800;

  // -------------------------------------------------------------
  // BANNER 1: Everyday Elegance, Made Affordable
  // Showcasing: Small gold earrings, silver earrings, delicate chain & pendant
  // -------------------------------------------------------------
  console.log('Generating Banner 1: Everyday Elegance...');
  const bg1 = makeBackgroundSvg(width, height);
  const card1_1 = await prepareCard('/tmp/modern_jewellery/minimal_flatlay.jpg', 440, 620, 'Delicate Chains & Pendants');
  const card1_2 = await prepareCard('public/images/products/gold-lightweight-huggie-hoops.jpg', 490, 295, 'Small Gold Huggies & Hoops');
  const card1_3 = await prepareCard('/tmp/modern_jewellery/silver_earrings.jpg', 490, 305, 'Silver-Tone Daily Earrings');

  const banner1Path = path.join(BANNERS_DIR, 'hero-everyday-elegance.jpg');
  await sharp(bg1)
    .composite([
      { input: card1_1, top: 90, left: 915 },
      { input: card1_2, top: 90, left: 1380 },
      { input: card1_3, top: 405, left: 1380 }
    ])
    .jpeg({ quality: 93 })
    .toFile(banner1Path);

  // -------------------------------------------------------------
  // BANNER 2: Dainty Studs & Everyday Hoops
  // Showcasing: Girl wearing sunlit minimal hoops + floral studs + delicate rings
  // -------------------------------------------------------------
  console.log('Generating Banner 2: Dainty Hoops & Studs...');
  const bg2 = makeBackgroundSvg(width, height, '#FCFAF7', '#F6F2EC', '#EFE9DF');
  const card2_1 = await prepareCard('/tmp/modern_jewellery/girl_sunlit_hoops.jpg', 460, 620, 'Sunlit Everyday Hoops');
  const card2_2 = await prepareCard('public/images/products/gold-lightweight-floral-studs.jpg', 470, 295, 'Dainty Floral Studs');
  const card2_3 = await prepareCard('/tmp/gold_jewellery/gold_rings.jpg', 470, 305, 'Minimal Stacking Rings');

  const banner2Path = path.join(BANNERS_DIR, 'hero-dainty-hoops.jpg');
  await sharp(bg2)
    .composite([
      { input: card2_1, top: 90, left: 915 },
      { input: card2_2, top: 90, left: 1400 },
      { input: card2_3, top: 405, left: 1400 }
    ])
    .jpeg({ quality: 93 })
    .toFile(banner2Path);

  // -------------------------------------------------------------
  // BANNER 3: Delicate Chains & Layered Pendants
  // Showcasing: Clean minimal chain flatlay + thin wire bracelet + girl wearing necklace
  // -------------------------------------------------------------
  console.log('Generating Banner 3: Delicate Chains...');
  const bg3 = makeBackgroundSvg(width, height, '#FAF8F5', '#F5EFE7', '#ECE3D3');
  const card3_1 = await prepareCard('/tmp/modern_jewellery/pexels_girl_earring.jpg', 470, 620, 'Minimal Style For Daily Wear');
  const card3_2 = await prepareCard('/tmp/modern_jewellery/dainty_necklace.jpg', 460, 295, 'Solitaire Pendant Chains');
  const card3_3 = await prepareCard('/tmp/gold_jewellery/gold_bracelets.jpg', 460, 305, 'Sleek Minimal Bangles');

  const banner3Path = path.join(BANNERS_DIR, 'hero-minimal-chains.jpg');
  await sharp(bg3)
    .composite([
      { input: card3_1, top: 90, left: 915 },
      { input: card3_2, top: 90, left: 1410 },
      { input: card3_3, top: 405, left: 1410 }
    ])
    .jpeg({ quality: 93 })
    .toFile(banner3Path);

  console.log('✅ All 3 bright luxury banners generated successfully in', BANNERS_DIR);
}

generateAllBanners().catch(console.error);
