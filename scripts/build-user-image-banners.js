const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const BANNERS_DIR = path.join(__dirname, '../public/images/banners');
const INSP_PATH = '/Users/apple/.gemini/antigravity/brain/70a9e96f-cda9-4f6f-bdb5-215aa945162b/.user_uploaded/media_1793638911458_15188104.png';

const W = 1920;
const H = 640;

async function extractMoharDecorations() {
  // Left lotus
  const leftLotus = await sharp(INSP_PATH)
    .extract({ left: 0, top: 0, width: 245, height: 265 })
    .resize(null, H, { fit: 'contain' })
    .toBuffer();

  // Bottom ornamental border
  const bottomBorder = await sharp(INSP_PATH)
    .extract({ left: 0, top: 268, width: 1024, height: 47 })
    .resize(W, 64, { fit: 'fill' })
    .toBuffer();

  return { leftLotus, bottomBorder };
}

// ========================================================
// 1. SLIDER 1: GOLD HEART BOW NECKLACE ON MODEL
// ========================================================
async function createNecklaceBanner(decs) {
  // Model skin tone dominant: around (228, 185, 155) / (238, 195, 168)
  // We'll create a seamless wide canvas where the model is on the right (x=800..1920)
  // and smoothly fades into warm champagne silk on the left (x=0..1000)
  const modelImg = path.join(BANNERS_DIR, 'user-gold-heart-necklace.jpg');

  // Resize model to 900x900, crop around the heart pendant
  // Heart pendant is at center-bottom: crop extract around x:50..950, y:150..950
  const croppedModel = await sharp(modelImg)
    .extract({ left: 80, top: 120, width: 840, height: 750 })
    .resize(720, 640, { fit: 'cover' })
    .toBuffer();

  // Feather left edge of model photo
  const maskSvg = `
    <svg width="720" height="640" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fadeLeft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0" />
          <stop offset="25%" stop-color="#FFFFFF" stop-opacity="0.85" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="1" />
        </linearGradient>
      </defs>
      <rect width="720" height="640" fill="url(#fadeLeft)" />
    </svg>
  `;
  const maskBuf = await sharp(Buffer.from(maskSvg)).png().toBuffer();

  const featheredModel = await sharp(croppedModel)
    .composite([{ input: maskBuf, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Silk background matching skin & champagne warmth
  const bgSvg = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="silkGlow" cx="40%" cy="40%" r="70%">
          <stop offset="0%" stop-color="#FFFDF9" />
          <stop offset="50%" stop-color="#FAF4EA" />
          <stop offset="85%" stop-color="#F2E6D5" />
          <stop offset="100%" stop-color="#E8D5C0" />
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#silkGlow)" />
    </svg>
  `;
  const baseBg = await sharp(Buffer.from(bgSvg)).png().toBuffer();

  // Accents & floating petals
  const accentsSvg = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <!-- Floating petals -->
      <g transform="translate(680, 480) rotate(-20) scale(0.7)">
        <path d="M 0 0 C 25 -45 55 -55 75 -22 C 85 12 55 45 22 32 Z" fill="#E88B9E" fill-opacity="0.85" />
      </g>
      <g transform="translate(1120, 160) rotate(32) scale(0.6)">
        <path d="M 0 0 C 25 -45 55 -55 75 -22 C 85 12 55 45 22 32 Z" fill="#F0A8B6" fill-opacity="0.75" />
      </g>
    </svg>
  `;
  const accentsBuf = await sharp(Buffer.from(accentsSvg)).png().toBuffer();

  const finalBanner = await sharp(baseBg)
    .composite([
      { input: decs.leftLotus, left: 0, top: 0 },
      { input: featheredModel, left: W - 720, top: 0 },
      { input: accentsBuf, left: 0, top: 0 },
      { input: decs.bottomBorder, left: 0, top: H - 64 }
    ])
    .jpeg({ quality: 95, mozjpeg: true })
    .toBuffer();

  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-necklace.jpg'), finalBanner);
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-everyday-elegance.jpg'), finalBanner);
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-kalavies-royal.jpg'), finalBanner);

  // Mobile
  const mobile = await sharp(finalBanner).resize(1000, 600, { fit: 'cover', position: 'center' }).jpeg({ quality: 90 }).toBuffer();
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-necklace-mobile.jpg'), mobile);
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-kalavies-royal-mobile.jpg'), mobile);
  console.log('✅ Generated hero-necklace.jpg with user gold heart necklace image!');
}

// ========================================================
// 2. SLIDER 2: PEACOCK TURQUOISE EARRING ON MODEL
// ========================================================
async function createPeacockBanner(decs) {
  const modelImg = path.join(BANNERS_DIR, 'user-peacock-earrings.jpg');

  // Earring is on ear: crop to focus on ear and turquoise stones
  const croppedModel = await sharp(modelImg)
    .extract({ left: 100, top: 120, width: 800, height: 750 })
    .resize(720, 640, { fit: 'cover' })
    .toBuffer();

  // Feather left edge
  const maskSvg = `
    <svg width="720" height="640" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fadeLeft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0" />
          <stop offset="25%" stop-color="#FFFFFF" stop-opacity="0.85" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="1" />
        </linearGradient>
      </defs>
      <rect width="720" height="640" fill="url(#fadeLeft)" />
    </svg>
  `;
  const maskBuf = await sharp(Buffer.from(maskSvg)).png().toBuffer();

  const featheredModel = await sharp(croppedModel)
    .composite([{ input: maskBuf, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const bgSvg = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="silkGlow" cx="40%" cy="40%" r="70%">
          <stop offset="0%" stop-color="#FFFDF9" />
          <stop offset="50%" stop-color="#FAF4EA" />
          <stop offset="85%" stop-color="#F2E6D5" />
          <stop offset="100%" stop-color="#E8D5C0" />
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#silkGlow)" />
    </svg>
  `;
  const baseBg = await sharp(Buffer.from(bgSvg)).png().toBuffer();

  const accentsSvg = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(710, 470) rotate(-18) scale(0.65)">
        <path d="M 0 0 C 25 -45 55 -55 75 -22 C 85 12 55 45 22 32 Z" fill="#E88B9E" fill-opacity="0.85" />
      </g>
    </svg>
  `;
  const accentsBuf = await sharp(Buffer.from(accentsSvg)).png().toBuffer();

  const finalBanner = await sharp(baseBg)
    .composite([
      { input: decs.leftLotus, left: 0, top: 0 },
      { input: featheredModel, left: W - 720, top: 0 },
      { input: accentsBuf, left: 0, top: 0 },
      { input: decs.bottomBorder, left: 0, top: H - 64 }
    ])
    .jpeg({ quality: 95, mozjpeg: true })
    .toBuffer();

  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-earrings.jpg'), finalBanner);
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-dainty-hoops.jpg'), finalBanner);

  // Mobile
  const mobile = await sharp(finalBanner).resize(1000, 600, { fit: 'cover', position: 'center' }).jpeg({ quality: 90 }).toBuffer();
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-earrings-mobile.jpg'), mobile);
  console.log('✅ Generated hero-earrings.jpg with user peacock earring image!');
}

// ========================================================
// 3. SLIDER 3: CRYSTAL FLORAL DROP EARRINGS
// ========================================================
async function createCrystalBanner(decs) {
  const crystalImg = path.join(BANNERS_DIR, 'user-crystal-earrings.png');

  // Resize crystal earrings (clean cut-out on silk)
  // Height: 500px, width proportional (around 500)
  const resizedCrystal = await sharp(crystalImg)
    .resize(500, 500, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const bgSvg = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="silkGlow" cx="45%" cy="40%" r="70%">
          <stop offset="0%" stop-color="#FFFDF9" />
          <stop offset="50%" stop-color="#FAF4EA" />
          <stop offset="85%" stop-color="#F2E6D5" />
          <stop offset="100%" stop-color="#E8D5C0" />
        </radialGradient>
        <radialGradient id="jewelAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#EAD7B2" stop-opacity="0.55" />
          <stop offset="70%" stop-color="#E8CCA0" stop-opacity="0.15" />
          <stop offset="100%" stop-color="#FAF4EA" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#silkGlow)" />
      <!-- Soft aura behind crystal earrings on right -->
      <circle cx="${W - 380}" cy="${H/2}" r="260" fill="url(#jewelAura)" />
    </svg>
  `;
  const baseBg = await sharp(Buffer.from(bgSvg)).png().toBuffer();

  const accentsSvg = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(${W - 460}, 120) rotate(-25) scale(0.65)">
        <path d="M 0 0 C 25 -45 55 -55 75 -22 C 85 12 55 45 22 32 Z" fill="#E88B9E" fill-opacity="0.85" />
      </g>
      <g transform="translate(680, 480) rotate(-18) scale(0.7)">
        <path d="M 0 0 C 25 -45 55 -55 75 -22 C 85 12 55 45 22 32 Z" fill="#E88B9E" fill-opacity="0.85" />
      </g>
    </svg>
  `;
  const accentsBuf = await sharp(Buffer.from(accentsSvg)).png().toBuffer();

  const finalBanner = await sharp(baseBg)
    .composite([
      { input: decs.leftLotus, left: 0, top: 0 },
      { input: resizedCrystal, left: W - 580, top: 70 },
      { input: accentsBuf, left: 0, top: 0 },
      { input: decs.bottomBorder, left: 0, top: H - 64 }
    ])
    .jpeg({ quality: 95, mozjpeg: true })
    .toBuffer();

  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-bangles.jpg'), finalBanner);
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-minimal-chains.jpg'), finalBanner);

  // Mobile
  const mobile = await sharp(finalBanner).resize(1000, 600, { fit: 'cover', position: 'center' }).jpeg({ quality: 90 }).toBuffer();
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-bangles-mobile.jpg'), mobile);
  console.log('✅ Generated hero-bangles.jpg with user crystal drop earring image!');
}

async function main() {
  const decs = await extractMoharDecorations();
  await createNecklaceBanner(decs);
  await createPeacockBanner(decs);
  await createCrystalBanner(decs);
  console.log('\n🎉 ALL 3 BANNERS CREATED WITH USER IMAGES IN BACKGROUND!');
}

main().catch(console.error);
