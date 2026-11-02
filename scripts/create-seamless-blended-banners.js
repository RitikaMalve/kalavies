const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const BANNERS_DIR = path.join(__dirname, '../public/images/banners');
const W = 1920;
const H = 720;

// Helper to create a smooth feathered mask for blending
function makeFeatherMaskSvg(w, h, fadeWidth = 450) {
  return Buffer.from(`
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="smoothFade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0" />
          <stop offset="${(fadeWidth * 0.25) / w * 100}%" stop-color="#FFFFFF" stop-opacity="0.15" />
          <stop offset="${(fadeWidth * 0.6) / w * 100}%" stop-color="#FFFFFF" stop-opacity="0.6" />
          <stop offset="${(fadeWidth * 0.85) / w * 100}%" stop-color="#FFFFFF" stop-opacity="0.9" />
          <stop offset="${fadeWidth / w * 100}%" stop-color="#FFFFFF" stop-opacity="1" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="1" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#smoothFade)" />
    </svg>
  `);
}

// ----------------------------------------------------------------------
// 1. SLIDER 1: GOLD HEART BOW PENDANT NECKLACE
// ----------------------------------------------------------------------
async function blendNecklaceBanner() {
  const modelPath = path.join(BANNERS_DIR, 'user-gold-heart-necklace.jpg');

  // The model image is 1000x1000.
  // We scale it so height is 720px (height matches full banner height 720)
  // Width will be 720px, or we can resize to width: 1100, height: 720 (covering right side x=820..1920)
  const photoW = 1100;
  const photoH = H;

  // Extract around the chest & heart pendant (x: 100..950, y: 150..850)
  const cropped = await sharp(modelPath)
    .extract({ left: 100, top: 120, width: 850, height: 720 })
    .resize(photoW, photoH, { fit: 'cover', position: 'center' })
    .toBuffer();

  const maskBuf = makeFeatherMaskSvg(photoW, photoH, 420);
  const maskImg = await sharp(maskBuf).png().toBuffer();

  const featheredPhoto = await sharp(cropped)
    .composite([{ input: maskImg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Background gradient: from clean ivory #FAF8F5 on left to warm skin glow on right
  const bgSvg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FAF8F5" />
          <stop offset="45%" stop-color="#F5ECE0" />
          <stop offset="70%" stop-color="#EEDAC5" />
          <stop offset="100%" stop-color="#E2C4A8" />
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#skinGlow)" />
    </svg>
  `);
  const bgBuf = await sharp(bgSvg).png().toBuffer();

  const finalBanner = await sharp(bgBuf)
    .composite([{ input: featheredPhoto, left: W - photoW, top: 0 }])
    .jpeg({ quality: 95, mozjpeg: true })
    .toBuffer();

  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-everyday-elegance.jpg'), finalBanner);
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-necklace.jpg'), finalBanner);
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-kalavies-royal.jpg'), finalBanner);

  // Mobile version (centered on pendant)
  const mobileBanner = await sharp(finalBanner)
    .resize(1000, 600, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 90 })
    .toBuffer();
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-necklace-mobile.jpg'), mobileBanner);
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-kalavies-royal-mobile.jpg'), mobileBanner);

  console.log('✅ Generated seamless blended Banner 1 (Gold Heart Necklace)');
}

// ----------------------------------------------------------------------
// 2. SLIDER 2: OXIDISED PEACOCK TURQUOISE EARRINGS
// ----------------------------------------------------------------------
async function blendPeacockBanner() {
  const modelPath = path.join(BANNERS_DIR, 'user-peacock-earrings.jpg');
  const photoW = 1100;
  const photoH = H;

  // In peacock image, ear & earring is around left-middle x: 100..850, y: 150..850
  const cropped = await sharp(modelPath)
    .extract({ left: 120, top: 100, width: 850, height: 720 })
    .resize(photoW, photoH, { fit: 'cover', position: 'left' })
    .toBuffer();

  const maskBuf = makeFeatherMaskSvg(photoW, photoH, 420);
  const maskImg = await sharp(maskBuf).png().toBuffer();

  const featheredPhoto = await sharp(cropped)
    .composite([{ input: maskImg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const bgSvg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="warmTone" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FAF8F5" />
          <stop offset="45%" stop-color="#F5EAE0" />
          <stop offset="70%" stop-color="#EED9C7" />
          <stop offset="100%" stop-color="#E5C5AF" />
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#warmTone)" />
    </svg>
  `);
  const bgBuf = await sharp(bgSvg).png().toBuffer();

  const finalBanner = await sharp(bgBuf)
    .composite([{ input: featheredPhoto, left: W - photoW, top: 0 }])
    .jpeg({ quality: 95, mozjpeg: true })
    .toBuffer();

  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-dainty-hoops.jpg'), finalBanner);
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-earrings.jpg'), finalBanner);

  // Mobile version
  const mobileBanner = await sharp(finalBanner)
    .resize(1000, 600, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 90 })
    .toBuffer();
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-earrings-mobile.jpg'), mobileBanner);

  console.log('✅ Generated seamless blended Banner 2 (Peacock Earrings)');
}

// ----------------------------------------------------------------------
// 3. SLIDER 3: CRYSTAL FLORAL DROP EARRINGS
// ----------------------------------------------------------------------
async function blendCrystalBanner() {
  const crystalPath = path.join(BANNERS_DIR, 'user-crystal-earrings.png');

  // Crystal earrings on clean background:
  // Resize to height 580, placed elegantly on right side
  const crystalImg = await sharp(crystalPath)
    .resize(null, 580, { fit: 'contain' })
    .toBuffer();
  const meta = await sharp(crystalImg).metadata();

  // Gentle radial glow behind the crystal earrings
  const bgSvg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pureIvory" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FAF8F5" />
          <stop offset="50%" stop-color="#F6F1E9" />
          <stop offset="80%" stop-color="#F0E8DC" />
          <stop offset="100%" stop-color="#EAE0D0" />
        </linearGradient>
        <radialGradient id="crystalGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9" />
          <stop offset="60%" stop-color="#F5EFE6" stop-opacity="0.5" />
          <stop offset="100%" stop-color="#FAF8F5" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#pureIvory)" />
      <!-- Luminous ambient spotlight behind the sparkling crystal drops -->
      <circle cx="${W - 480}" cy="${H/2}" r="340" fill="url(#crystalGlow)" />
    </svg>
  `);
  const bgBuf = await sharp(bgSvg).png().toBuffer();

  const finalBanner = await sharp(bgBuf)
    .composite([{ input: crystalImg, left: W - meta.width - 240, top: (H - 580) / 2 }])
    .jpeg({ quality: 95, mozjpeg: true })
    .toBuffer();

  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-minimal-chains.jpg'), finalBanner);
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-bangles.jpg'), finalBanner);

  // Mobile version
  const mobileBanner = await sharp(finalBanner)
    .resize(1000, 600, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 90 })
    .toBuffer();
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-bangles-mobile.jpg'), mobileBanner);

  console.log('✅ Generated seamless blended Banner 3 (Crystal Drops)');
}

async function main() {
  await blendNecklaceBanner();
  await blendPeacockBanner();
  await blendCrystalBanner();
  console.log('\n🎉 ALL 3 SEAMLESS BLENDED BANNERS READY!');
}

main().catch(console.error);
