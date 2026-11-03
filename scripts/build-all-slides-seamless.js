const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const BANNERS_DIR = path.join(__dirname, '../public/images/banners');
const W = 1920;
const H = 720;

function makeFeatherMaskSvg(w, h, fadeWidth = 460) {
  return Buffer.from(`
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="smoothFade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0" />
          <stop offset="20%" stop-color="#FFFFFF" stop-opacity="0.12" />
          <stop offset="45%" stop-color="#FFFFFF" stop-opacity="0.45" />
          <stop offset="70%" stop-color="#FFFFFF" stop-opacity="0.8" />
          <stop offset="90%" stop-color="#FFFFFF" stop-opacity="0.96" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="1" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#smoothFade)" />
    </svg>
  `);
}

// ========================================================
// 1. SLIDE 1: GOLD HEART BOW PENDANT NECKLACE
// ========================================================
async function createSlide1() {
  const modelPath = path.join(BANNERS_DIR, 'user-gold-heart-necklace.jpg');
  const photoW = 1100;
  const photoH = H;

  const cropped = await sharp(modelPath)
    .extract({ left: 100, top: 120, width: 850, height: 720 })
    .resize(photoW, photoH, { fit: 'cover', position: 'center' })
    .toBuffer();

  const maskBuf = makeFeatherMaskSvg(photoW, photoH, 420);
  const maskImg = await sharp(maskBuf).png().toBuffer();

  const feathered = await sharp(cropped)
    .composite([{ input: maskImg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const bgSvg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGlow1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FAF8F5" />
          <stop offset="45%" stop-color="#F5ECE0" />
          <stop offset="70%" stop-color="#EEDAC5" />
          <stop offset="100%" stop-color="#E2C4A8" />
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#skinGlow1)" />
    </svg>
  `);
  const bgBuf = await sharp(bgSvg).png().toBuffer();

  const finalBanner = await sharp(bgBuf)
    .composite([{ input: feathered, left: W - photoW, top: 0 }])
    .jpeg({ quality: 96, mozjpeg: true })
    .toBuffer();

  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-everyday-elegance.jpg'), finalBanner);
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-necklace.jpg'), finalBanner);
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-kalavies-royal.jpg'), finalBanner);

  const mobile = await sharp(finalBanner).resize(1000, 600, { fit: 'cover', position: 'center' }).jpeg({ quality: 90 }).toBuffer();
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-necklace-mobile.jpg'), mobile);
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-kalavies-royal-mobile.jpg'), mobile);
}

// ========================================================
// 2. SLIDE 2: OXIDISED PEACOCK TURQUOISE EARRINGS
// ========================================================
async function createSlide2() {
  const modelPath = path.join(BANNERS_DIR, 'user-peacock-earrings.jpg');
  const photoW = 1100;
  const photoH = H;

  const cropped = await sharp(modelPath)
    .extract({ left: 60, top: 20, width: 840, height: 750 })
    .resize(photoW, photoH, { fit: 'cover', position: 'center' })
    .flop()
    .toBuffer();

  const maskBuf = makeFeatherMaskSvg(photoW, photoH, 420);
  const maskImg = await sharp(maskBuf).png().toBuffer();

  const feathered = await sharp(cropped)
    .composite([{ input: maskImg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const bgSvg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGlow2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FAF8F5" />
          <stop offset="45%" stop-color="#F5ECE0" />
          <stop offset="70%" stop-color="#EEDAC5" />
          <stop offset="100%" stop-color="#E2C4A8" />
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#skinGlow2)" />
    </svg>
  `);
  const bgBuf = await sharp(bgSvg).png().toBuffer();

  const finalBanner = await sharp(bgBuf)
    .composite([{ input: feathered, left: W - photoW, top: 0 }])
    .jpeg({ quality: 96, mozjpeg: true })
    .toBuffer();

  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-dainty-hoops.jpg'), finalBanner);
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-earrings.jpg'), finalBanner);

  const mobile = await sharp(finalBanner).resize(1000, 600, { fit: 'cover', position: 'center' }).jpeg({ quality: 90 }).toBuffer();
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-earrings-mobile.jpg'), mobile);
}

// ========================================================
// 3. SLIDE 3: DIAMOND CRYSTAL FLORAL DROP EARRINGS (SEAMLESS FEATHERED BLEND)
// ========================================================
async function createSlide3() {
  const crystalPath = path.join(BANNERS_DIR, 'user-crystal-earrings.png');
  const photoW = 1050;
  const photoH = H;

  const resizedEarrings = await sharp(crystalPath)
    .resize(720, 720, { fit: 'contain', background: { r: 254, g: 254, b: 254 } })
    .toBuffer();

  const photoSlice = await sharp({
    create: {
      width: photoW,
      height: photoH,
      channels: 3,
      background: { r: 254, g: 254, b: 254 }
    }
  })
    .composite([
      { input: resizedEarrings, left: photoW - 740, top: 0 }
    ])
    .png()
    .toBuffer();

  const maskBuf = makeFeatherMaskSvg(photoW, photoH, 460);
  const maskImg = await sharp(maskBuf).png().toBuffer();

  const featheredSlice = await sharp(photoSlice)
    .composite([{ input: maskImg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const bgSvg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="seamlessWhiteIvory" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FAF8F5" />
          <stop offset="40%" stop-color="#FAF7F4" />
          <stop offset="65%" stop-color="#FBFBFB" />
          <stop offset="85%" stop-color="#FEFEFE" />
          <stop offset="100%" stop-color="#FEFEFE" />
        </linearGradient>
        <radialGradient id="luxWarmth" cx="75%" cy="45%" r="55%">
          <stop offset="0%" stop-color="#FDFBF7" stop-opacity="0.8" />
          <stop offset="60%" stop-color="#FEFEFE" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#FEFEFE" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#seamlessWhiteIvory)" />
      <rect width="${W}" height="${H}" fill="url(#luxWarmth)" />
    </svg>
  `);
  const bgBuf = await sharp(bgSvg).png().toBuffer();

  const finalBanner = await sharp(bgBuf)
    .composite([{ input: featheredSlice, left: W - photoW, top: 0 }])
    .jpeg({ quality: 96, mozjpeg: true })
    .toBuffer();

  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-minimal-chains.jpg'), finalBanner);
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-bangles.jpg'), finalBanner);

  const mobile = await sharp(finalBanner).resize(1000, 600, { fit: 'cover', position: 'center' }).jpeg({ quality: 90 }).toBuffer();
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-bangles-mobile.jpg'), mobile);
}

// ========================================================
// 4. SLIDE 4: FESTIVE ROYAL FLORAL CHOKER & STUD EARRINGS
// ========================================================
async function createSlideFestiveRoyal() {
  const modelPath = path.join(BANNERS_DIR, 'user-festive-choker-model.jpg');
  const photoW = 960;
  const photoH = H; // 720

  // 1024x768 -> 960x720 (exact 4:3 downscale, 100% full height uncropped)
  const resized = await sharp(modelPath)
    .resize(photoW, photoH, { fit: 'fill' })
    .toBuffer();

  const maskBuf = makeFeatherMaskSvg(photoW, photoH, 320);
  const maskImg = await sharp(maskBuf).png().toBuffer();

  const feathered = await sharp(resized)
    .composite([{ input: maskImg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Background matching the warm studio tone on the left edge of the photo
  const bgSvg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="royalStudioGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FAF8F5" />
          <stop offset="25%" stop-color="#F6ECE1" />
          <stop offset="45%" stop-color="#EADBCA" />
          <stop offset="65%" stop-color="#D1B79F" />
          <stop offset="85%" stop-color="#AE866E" />
          <stop offset="100%" stop-color="#966A51" />
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#royalStudioGlow)" />
    </svg>
  `);
  const bgBuf = await sharp(bgSvg).png().toBuffer();

  const finalBanner = await sharp(bgBuf)
    .composite([{ input: feathered, left: W - photoW, top: 0 }])
    .jpeg({ quality: 96, mozjpeg: true })
    .toBuffer();

  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-festive-royal.jpg'), finalBanner);

  // Mobile version
  const mobile = await sharp(modelPath)
    .resize(1000, 600, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-festive-royal-mobile.jpg'), mobile);
}

async function main() {
  await createSlideFestiveRoyal();
  await createSlide1();
  await createSlide2();
  await createSlide3();
  console.log('✅ All 4 slides created with seamless feathered blend!');
}

main().catch(console.error);
