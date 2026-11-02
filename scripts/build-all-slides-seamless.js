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

// 1. Slide 1 (Necklace)
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

// 2. Slide 2 (Peacock Earrings)
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

// 3. Slide 3 (Crystal Drops with Seamless Flood-fill Background Isolation)
async function createSlide3() {
  const crystalPath = path.join(BANNERS_DIR, 'user-crystal-earrings.png');
  const { data, info } = await sharp(crystalPath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const c = info.channels;
  const buf = Buffer.from(data);

  const visited = new Uint8Array(w * h);
  const queue = [];

  const pushCorner = (x, y) => {
    const idx = y * w + x;
    visited[idx] = 1;
    queue.push(x, y);
  };

  for (let x = 0; x < w; x++) {
    pushCorner(x, 0);
    pushCorner(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    pushCorner(0, y);
    pushCorner(w - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];

    const pIdx = (y * w + x) * c;
    buf[pIdx + 3] = 0;

    const neighbors = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const nIdx = ny * w + nx;
        if (!visited[nIdx]) {
          visited[nIdx] = 1;
          const npIdx = (ny * w + nx) * c;
          const r = buf[npIdx];
          const g = buf[npIdx + 1];
          const b = buf[npIdx + 2];
          if (r >= 248 && g >= 248 && b >= 248) {
            queue.push(nx, ny);
          } else if (r >= 240 && g >= 240 && b >= 240) {
            const alpha = Math.round(((248 - Math.max(r, g, b)) / 8) * 255);
            buf[npIdx + 3] = alpha;
          }
        }
      }
    }
  }

  const crystalImg = await sharp(buf, { raw: { width: w, height: h, channels: c } })
    .resize(null, 630, { fit: 'contain' })
    .png()
    .toBuffer();

  const crystalMeta = await sharp(crystalImg).metadata();

  const bgSvg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="warmStudioGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FAF8F5" />
          <stop offset="45%" stop-color="#F5ECE0" />
          <stop offset="70%" stop-color="#EEDAC5" />
          <stop offset="100%" stop-color="#E2C4A8" />
        </linearGradient>
        <radialGradient id="softSpotlight" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9" />
          <stop offset="50%" stop-color="#FAF4EB" stop-opacity="0.5" />
          <stop offset="100%" stop-color="#EEDAC5" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#warmStudioGlow)" />
      <circle cx="${W - 440}" cy="${H/2}" r="340" fill="url(#softSpotlight)" />
    </svg>
  `);
  const bgBuf = await sharp(bgSvg).png().toBuffer();

  const finalBanner = await sharp(bgBuf)
    .composite([
      { input: crystalImg, left: W - crystalMeta.width - 200, top: Math.round((H - 630) / 2) }
    ])
    .jpeg({ quality: 96, mozjpeg: true })
    .toBuffer();

  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-minimal-chains.jpg'), finalBanner);
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-bangles.jpg'), finalBanner);

  const mobile = await sharp(finalBanner).resize(1000, 600, { fit: 'cover', position: 'center' }).jpeg({ quality: 90 }).toBuffer();
  fs.writeFileSync(path.join(BANNERS_DIR, 'hero-bangles-mobile.jpg'), mobile);
}

async function main() {
  await createSlide1();
  await createSlide2();
  await createSlide3();
  console.log('✅ All 3 slides generated with flawless seamless blend!');
}

main().catch(console.error);
