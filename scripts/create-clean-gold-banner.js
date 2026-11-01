const sharp = require('sharp');
const path = require('path');

async function createSeamlessGoldBanner() {
  const original = sharp('/tmp/gold_jewellery/zohra_banner.jpg');
  const { width, height } = await original.metadata();

  // Create an elegant studio gradient overlay for the left side:
  // Solid 100% opacity from x=0% to x=28% so all old text is completely eliminated
  // Smoothly fades into the original amber/caramel studio background between x=30% and x=54%
  const overlaySvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="seamlessFade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#120E0A" stop-opacity="1.0" />
          <stop offset="28%" stop-color="#120E0A" stop-opacity="1.0" />
          <stop offset="35%" stop-color="#1A120D" stop-opacity="0.96" />
          <stop offset="42%" stop-color="#342015" stop-opacity="0.75" />
          <stop offset="48%" stop-color="#653F28" stop-opacity="0.35" />
          <stop offset="54%" stop-color="#885329" stop-opacity="0.0" />
        </linearGradient>

        <linearGradient id="warmBottomVignette" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#120E0A" stop-opacity="0.35" />
          <stop offset="25%" stop-color="#120E0A" stop-opacity="0.0" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#seamlessFade)" />
      <rect width="${width}" height="${height}" fill="url(#warmBottomVignette)" />
    </svg>
  `);

  await original
    .composite([{ input: overlaySvg, blend: 'over' }])
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(path.join(__dirname, '../public/images/banners/hero-gold-jewellery.jpg'));

  console.log('Clean seamless banner created successfully');
}

createSeamlessGoldBanner().catch(console.error);
