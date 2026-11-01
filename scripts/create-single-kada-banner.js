const sharp = require('sharp');
const path = require('path');

async function createSingleKadaBanner() {
  const width = 1400;
  const height = 788;

  // 1. Pure dark charcoal slate texture from the negative space of hero-1 (left 450px)
  const slateTexture = await sharp(path.join(__dirname, '../public/images/banners/hero-jewellery-1.jpg'))
    .extract({ left: 0, top: 0, width: 450, height: 781 })
    .resize(width, height, { fit: 'cover' })
    .toBuffer();

  // 2. Extract full complete gold kada (including the full bottom flower medallion)
  const kadaCropped = await sharp('/tmp/gold_jewellery/gold_kada.jpg')
    .extract({ left: 70, top: 300, width: 895, height: 408 })
    .toBuffer();

  const kadaRaw = await sharp(kadaCropped)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = kadaRaw;
  const numPixels = info.width * info.height;
  const rgba = Buffer.alloc(numPixels * 4);

  for (let i = 0; i < numPixels; i++) {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];

    // Background threshold (pure white to off-white studio table)
    if (r > 225 && g > 225 && b > 225) {
      rgba[i * 4] = 0;
      rgba[i * 4 + 1] = 0;
      rgba[i * 4 + 2] = 0;
      rgba[i * 4 + 3] = 0; // Transparent
    } else {
      let alpha = 255;
      const brightness = (r + g + b) / 3;
      if (brightness > 200) {
        alpha = Math.max(0, Math.min(255, Math.round((225 - brightness) * 10)));
      }
      rgba[i * 4] = r;
      rgba[i * 4 + 1] = g;
      rgba[i * 4 + 2] = b;
      rgba[i * 4 + 3] = alpha;
    }
  }

  // Create isolated kada (sized 670px wide)
  const isolatedKada = await sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 }
  })
    .resize(670, null, { fit: 'inside' })
    .png()
    .toBuffer();

  const kadaMeta = await sharp(isolatedKada).metadata();

  // 3. Realistic lighting, contact shadow, and ambient spotlight
  const lightingSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Warm golden ambient spotlight on the piece -->
        <radialGradient id="goldSpot" cx="74%" cy="50%" r="48%">
          <stop offset="0%" stop-color="#E2B857" stop-opacity="0.30" />
          <stop offset="45%" stop-color="#C9A84C" stop-opacity="0.12" />
          <stop offset="85%" stop-color="#000000" stop-opacity="0.0" />
        </radialGradient>

        <!-- Deep soft contact shadow directly under the kada -->
        <radialGradient id="contactShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#020202" stop-opacity="0.95" />
          <stop offset="50%" stop-color="#050505" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.0" />
        </radialGradient>

        <!-- Left moody dark vignette for crystal clear text readability -->
        <linearGradient id="leftFade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#08080A" stop-opacity="0.96" />
          <stop offset="35%" stop-color="#0C0C0E" stop-opacity="0.88" />
          <stop offset="55%" stop-color="#101014" stop-opacity="0.35" />
          <stop offset="75%" stop-color="#000000" stop-opacity="0.0" />
        </linearGradient>
      </defs>

      <!-- Ambient dark slate base with left shadow -->
      <rect width="${width}" height="${height}" fill="url(#leftFade)" />
      
      <!-- Contact shadow under the piece -->
      <ellipse cx="1025" cy="555" rx="310" ry="42" fill="url(#contactShadow)" />
      
      <!-- Warm golden spotlight -->
      <rect width="${width}" height="${height}" fill="url(#goldSpot)" />
    </svg>
  `);

  // Composite isolated kada onto dark slate with spotlight and shadows
  await sharp(slateTexture)
    .composite([
      { input: lightingSvg, blend: 'over' },
      { input: isolatedKada, left: 690, top: Math.round((height - kadaMeta.height) / 2) + 15 },
    ])
    .jpeg({ quality: 94, mozjpeg: true })
    .toFile(path.join(__dirname, '../public/images/banners/hero-single-kada.jpg'));

  // Also replace hero-gold-jewellery.jpg directly
  await sharp(path.join(__dirname, '../public/images/banners/hero-single-kada.jpg'))
    .toFile(path.join(__dirname, '../public/images/banners/hero-gold-jewellery.jpg'));

  console.log('Single Kada banner created and saved to hero-gold-jewellery.jpg');
}

createSingleKadaBanner().catch(console.error);
