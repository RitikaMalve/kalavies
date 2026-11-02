const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const BANNERS_DIR = path.join(__dirname, '../public/images/banners');
const W = 1920;
const H = 720;

function makeFeatherMaskSvg(w, h, fadeWidth = 420) {
  return Buffer.from(`
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="smoothFade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0" />
          <stop offset="25%" stop-color="#FFFFFF" stop-opacity="0.18" />
          <stop offset="60%" stop-color="#FFFFFF" stop-opacity="0.75" />
          <stop offset="85%" stop-color="#FFFFFF" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="1" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#smoothFade)" />
    </svg>
  `);
}

// ========================================================
// SLIDE 1: GOLD HEART BOW PENDANT NECKLACE
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
  console.log('✅ Generated Slide 1 (Gold Heart Necklace)');
}

// ========================================================
// SLIDE 2: OXIDISED PEACOCK TURQUOISE EARRINGS
// ========================================================
async function createSlide2() {
  const modelPath = path.join(BANNERS_DIR, 'user-peacock-earrings.jpg');
  const photoW = 1100;
  const photoH = H;

  // The ear with peacock earring is on the left side of original 1000x1000 image.
  // We extract a generous crop around the ear and turquoise stones, resize,
  // and flip horizontally so the ear is prominent on the right side, looking inward!
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
  console.log('✅ Generated Slide 2 (Peacock Earrings)');
}

// ========================================================
// SLIDE 3: CRYSTAL FLORAL DROP EARRINGS
// ========================================================
async function createSlide3() {
  const crystalPath = path.join(BANNERS_DIR, 'user-crystal-earrings.png');

  // Crystal earrings on transparent:
  // Resize to height 580, placed elegantly on right side matching Slide 1 scale
  const crystalImg = await sharp(crystalPath)
    .resize(null, 580, { fit: 'contain' })
    .toBuffer();
  const meta = await sharp(crystalImg).metadata();

  const bgSvg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGlow3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FAF8F5" />
          <stop offset="45%" stop-color="#F5ECE0" />
          <stop offset="70%" stop-color="#EEDAC5" />
          <stop offset="100%" stop-color="#E2C4A8" />
        </linearGradient>
        <radialGradient id="crystalSpotlight" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFFDF9" stop-opacity="0.95" />
          <stop offset="55%" stop-color="#F5ECE0" stop-opacity="0.5" />
          <stop offset="100%" stop-color="#FAF8F5" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#skinGlow3)" />
      <!-- Soft ambient spotlight circle on the right side -->
      <circle cx="${W - 480}" cy="${H/2}" r="340" fill="url(#crystalSpotlight)" />
    </svg>
  `);
  const bgBuf = await sharp(bgSvg).png().toBuffer();

  const finalBanner = await sharp(bgBuf)
    .composite([
      { input: crystalImg, left: W - meta.width - 240, top: Math.round((H - 580) / 2) }
    ])
    .jpeg({ quality: 96, mozjpeg: true })
    .toBuffer();

  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-minimal-chains.jpg'), finalBanner);
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-bangles.jpg'), finalBanner);

  const mobile = await sharp(finalBanner).resize(1000, 600, { fit: 'cover', position: 'center' }).jpeg({ quality: 90 }).toBuffer();
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-bangles-mobile.jpg'), mobile);
  console.log('✅ Generated Slide 3 (Crystal Drops)');
}

async function main() {
  await createSlide1();
  await createSlide2();
  await createSlide3();
  console.log('\n🎉 ALL 3 SLIDES GENERATED SEAMLESSLY AND IDENTICALLY!');
}

main().catch(console.error);
