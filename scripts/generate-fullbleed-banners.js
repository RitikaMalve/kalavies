const sharp = require('sharp');
const path = require('path');

const BANNERS_DIR = path.join(__dirname, '../public/images/banners');
const PRODUCTS_DIR = path.join(__dirname, '../public/images/products');

async function createFourPanelBanner(imgPaths, outputPath) {
  const width = 1920;
  const height = 800;
  const colWidth = 480;

  const panels = await Promise.all(
    imgPaths.map(p =>
      sharp(p)
        .resize(colWidth, height, { fit: 'cover', position: 'center' })
        .toBuffer()
    )
  );

  // Soft dividing hairlines for luxury feel
  const dividersSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <line x1="480" y1="0" x2="480" y2="${height}" stroke="#FFFFFF" stroke-width="1.5" stroke-opacity="0.3" />
      <line x1="960" y1="0" x2="960" y2="${height}" stroke="#FFFFFF" stroke-width="1.5" stroke-opacity="0.3" />
      <line x1="1440" y1="0" x2="1440" y2="${height}" stroke="#FFFFFF" stroke-width="1.5" stroke-opacity="0.3" />
    </svg>
  `);

  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 24, g: 20, b: 18 }
    }
  })
    .composite([
      { input: panels[0], left: 0, top: 0 },
      { input: panels[1], left: colWidth, top: 0 },
      { input: panels[2], left: colWidth * 2, top: 0 },
      { input: panels[3], left: colWidth * 3, top: 0 },
      { input: dividersSvg, left: 0, top: 0 }
    ])
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(outputPath);

  console.log(`✅ Generated full-bleed banner: ${outputPath}`);
}

async function run() {
  // Banner 1: Everyday Elegance (Hoops, Necklace, Silver Earrings, Wire Bangle)
  await createFourPanelBanner(
    [
      path.join(PRODUCTS_DIR, 'gold-lightweight-huggie-hoops.jpg'),
      path.join(PRODUCTS_DIR, 'gold-solitaire-pendant-necklace.jpg'),
      path.join(PRODUCTS_DIR, 'silver-daily-minimal-earrings.jpg'),
      path.join(PRODUCTS_DIR, 'gold-minimal-wire-bangle.jpg')
    ],
    path.join(BANNERS_DIR, 'hero-everyday-elegance.jpg')
  );

  // Banner 2: Dainty Studs & Everyday Hoops (Jhumkas, Floral Studs, Filigree Danglers, Huggies)
  await createFourPanelBanner(
    [
      path.join(PRODUCTS_DIR, 'gold-pearl-drop-jhumkas.jpg'),
      path.join(PRODUCTS_DIR, 'gold-lightweight-floral-studs.jpg'),
      path.join(PRODUCTS_DIR, 'gold-filigree-leaf-danglers.jpg'),
      path.join(PRODUCTS_DIR, 'gold-lightweight-huggie-hoops.jpg')
    ],
    path.join(BANNERS_DIR, 'hero-dainty-hoops.jpg')
  );

  // Banner 3: Delicate Chains & Pendants (Necklace, Stacking Rings, Silver Earrings, Bangle)
  await createFourPanelBanner(
    [
      path.join(PRODUCTS_DIR, 'gold-solitaire-pendant-necklace.jpg'),
      path.join(PRODUCTS_DIR, 'minimal-gold-stacking-rings.jpg'),
      path.join(PRODUCTS_DIR, 'silver-daily-minimal-earrings.jpg'),
      path.join(PRODUCTS_DIR, 'gold-minimal-wire-bangle.jpg')
    ],
    path.join(BANNERS_DIR, 'hero-minimal-chains.jpg')
  );

  console.log('All 3 full-bleed banners created successfully!');
}

run().catch(console.error);
