import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

async function run() {
  console.log('Extracting logo PNG from SVG...')

  const svgPath = path.join(process.cwd(), 'public/KALAVIES_Jewellery_Logo.svg')
  const svgContent = fs.readFileSync(svgPath, 'utf8')

  // Extract base64 png
  const match = svgContent.match(/href="data:image\/png;base64,([^"]+)"/)
  if (match && match[1]) {
    const pngBuffer = Buffer.from(match[1], 'base64')
    fs.writeFileSync(path.join(process.cwd(), 'public/logo.png'), pngBuffer)
    console.log('✅ Extracted public/logo.png (size:', pngBuffer.length, 'bytes)')

    // Also optimize with sharp into a crisp 512x512 logo and a 128x128 header logo
    await sharp(pngBuffer)
      .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(process.cwd(), 'public/logo-512.png'))

    await sharp(pngBuffer)
      .resize(256, 256, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .webp({ quality: 95 })
      .toFile(path.join(process.cwd(), 'public/logo.webp'))

    console.log('✅ Created public/logo-512.png and public/logo.webp')
  }

  // Generate 25 real, genuine JPEG product images with exquisite jewellery graphics
  const productsDir = path.join(process.cwd(), 'public/images/products')
  fs.mkdirSync(productsDir, { recursive: true })

  const jewelleryTypes = [
    { title: 'ANTIQUE JHUMKA', sub: 'Oxidised Silver', color1: '#EAE6E1', color2: '#D6CFC7', accent: '#C9A84C' },
    { title: 'CHOKER NECKLACE', sub: 'Kundan and Pearls', color1: '#F7F3EE', color2: '#EFE8DE', accent: '#B76E79' },
    { title: 'SILVER BANGLES', sub: 'German Silver Set', color1: '#EDEDED', color2: '#DBDBDB', accent: '#71717A' },
    { title: 'VINTAGE RING', sub: 'Carved Motif', color1: '#FAF5EE', color2: '#EFE5D5', accent: '#C9A84C' },
    { title: 'SILVER ANKLET', sub: 'Ghungroo Detailing', color1: '#F5F5F5', color2: '#E3E3E3', accent: '#9CA3AF' },
    { title: 'MAANG TIKKA', sub: 'Temple Kundan', color1: '#F9F4EB', color2: '#EFE1CD', accent: '#C9A84C' },
    { title: 'BRIDAL SET', sub: 'Grand Rajputana', color1: '#26221E', color2: '#181512', accent: '#D4AF37', dark: true },
    { title: 'SILVER NOSE PIN', sub: 'Clip-on Floral', color1: '#FAF7F2', color2: '#EFE9DE', accent: '#A1A1AA' },
    { title: 'ROSE GOLD SET', sub: 'Contemporary Layered', color1: '#FAF0F0', color2: '#EEDCDC', accent: '#B76E79' },
    { title: 'CRYSTAL DROPS', sub: 'CZ Solitaire', color1: '#F3F4F6', color2: '#E5E7EB', accent: '#38BDF8' },
    { title: 'GOLD PLATED BANGLES', sub: 'Traditional 6-Piece', color1: '#FAF4E8', color2: '#EDE0C5', accent: '#C9A84C' },
    { title: 'SOLITAIRE RING', sub: 'Adjustable Band', color1: '#F9FAFB', color2: '#E5E7EB', accent: '#C9A84C' },
    { title: 'TEMPLE NECKLACE', sub: 'Lakshmi Coins', color1: '#26221E', color2: '#1A1816', accent: '#D4AF37', dark: true },
    { title: 'KUNDAN CHANDBALI', sub: 'Enamel and Pearls', color1: '#FAF3EA', color2: '#EFE2CE', accent: '#B76E79' },
    { title: 'PEARL BANGLES', sub: 'Kada Style Pair', color1: '#FAF8F5', color2: '#EFE9E0', accent: '#C9A84C' },
    { title: 'MINIMALIST STUDS', sub: 'Daily Geometry', color1: '#FFFFFF', color2: '#F3F4F6', accent: '#C9A84C' },
    { title: 'DAINTY CHAIN', sub: 'Rose Gold Pendant', color1: '#FAF1F1', color2: '#EEDFDF', accent: '#B76E79' },
    { title: 'SIMPLE DAILY RING', sub: 'Sterling Silver', color1: '#F4F4F5', color2: '#E4E4E7', accent: '#71717A' },
    { title: 'STATEMENT CHOKER', sub: 'Royal Kundan', color1: '#1F1B18', color2: '#141210', accent: '#EAB308', dark: true },
    { title: 'MEENAKARI EARRINGS', sub: 'Peacock Enamel', color1: '#F0FDF4', color2: '#DCFCE7', accent: '#059669' },
    { title: 'ROYAL BRIDAL SET', sub: 'Heritage Choker', color1: '#241E19', color2: '#171310', accent: '#C9A84C', dark: true },
    { title: 'CUFF BRACELET', sub: 'Bohemian Tribal', color1: '#ECE8E3', color2: '#D9D3CB', accent: '#52525B' },
    { title: 'PEARL CLUSTER', sub: 'Classic Drop', color1: '#FAF7F2', color2: '#EDE5D8', accent: '#C9A84C' },
    { title: 'COIN NECKLACE', sub: 'Antique German Silver', color1: '#E8E5E1', color2: '#D5CFC9', accent: '#71717A' },
    { title: 'KAMARBAND CHAIN', sub: 'Waist Jewellery', color1: '#FDFBF7', color2: '#EDE4D2', accent: '#C9A84C' },
  ]

  for (let i = 1; i <= 25; i++) {
    const meta = jewelleryTypes[i - 1] || jewelleryTypes[0]
    const textColor = meta.dark ? '#FFFFFF' : '#1A1A1A'
    const mutedColor = meta.dark ? '#D4AF37' : '#C9A84C'

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="${meta.color1}"/>
      <stop offset="100%" stop-color="${meta.color2}"/>
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="800" height="800" fill="url(#bg)"/>
  
  <!-- Outer decorative filigree border -->
  <circle cx="400" cy="400" r="280" fill="none" stroke="${meta.accent}" stroke-width="1.5" stroke-dasharray="6 8" opacity="0.6"/>
  <circle cx="400" cy="400" r="260" fill="none" stroke="${meta.accent}" stroke-width="0.8" opacity="0.4"/>
  <circle cx="400" cy="400" r="210" fill="none" stroke="${meta.accent}" stroke-width="2" opacity="0.8"/>
  
  <!-- Central Jewellery Mandala / Ornament -->
  <g filter="url(#shadow)">
    <circle cx="400" cy="380" r="130" fill="${meta.dark ? '#2E2721' : '#FFFFFF'}" stroke="${meta.accent}" stroke-width="3"/>
    
    <!-- Central Gem Motif -->
    <circle cx="400" cy="380" r="80" fill="none" stroke="${meta.accent}" stroke-width="1.5" stroke-dasharray="4 4"/>
    <polygon points="400,310 435,355 480,380 435,405 400,450 365,405 320,380 365,355" fill="${meta.accent}" opacity="0.9"/>
    <circle cx="400" cy="380" r="30" fill="${meta.dark ? '#1A1816' : '#FAF8F5'}" stroke="${textColor}" stroke-width="2"/>
    <circle cx="400" cy="380" r="14" fill="${meta.accent}"/>

    <!-- Droplet charms hanging -->
    <path d="M 400 520 C 390 535, 385 550, 400 565 C 415 550, 410 535, 400 520 Z" fill="${meta.accent}"/>
    <path d="M 340 500 C 330 515, 325 528, 340 540 C 355 528, 350 515, 340 500 Z" fill="${meta.accent}" opacity="0.8"/>
    <path d="M 460 500 C 450 515, 445 528, 460 540 C 475 528, 470 515, 460 500 Z" fill="${meta.accent}" opacity="0.8"/>
  </g>

  <!-- Brand Typography -->
  <text x="400" y="160" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif" font-size="28" font-weight="bold" fill="${textColor}" text-anchor="middle" letter-spacing="4">KALAVIES</text>
  <text x="400" y="190" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="${mutedColor}" text-anchor="middle" letter-spacing="6">FINE JEWELLERY</text>

  <!-- Product Caption -->
  <text x="400" y="650" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif" font-size="22" font-weight="700" fill="${textColor}" text-anchor="middle" letter-spacing="2">${meta.title}</text>
  <text x="400" y="680" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500" fill="${meta.dark ? '#B8963B' : '#6B6B6B'}" text-anchor="middle" letter-spacing="1">${meta.sub}</text>
</svg>`

    // Render directly to a real binary JPEG using sharp
    await sharp(Buffer.from(svg))
      .jpeg({ quality: 90 })
      .toFile(path.join(productsDir, `placeholder-${i}.jpg`))
  }
  console.log('✅ Generated 25 real, valid binary JPEG product images!')

  // Generate 3 real binary JPEG banner images
  const bannersDir = path.join(process.cwd(), 'public/images/banners')
  fs.mkdirSync(bannersDir, { recursive: true })

  const bannerData = [
    {
      title: 'ROYAL HERITAGE OXIDISED',
      subtitle: 'HANDCRAFTED SILVER JEWELLERY',
      tag: 'NEW FESTIVE COLLECTION • UP TO 30% OFF',
      c1: '#1F1B18',
      c2: '#12100E',
      accent: '#C9A84C',
    },
    {
      title: 'ANTIQUE FESTIVE GLOW',
      subtitle: 'TEMPLE KUNDAN AND POLKI DESIGNS',
      tag: 'CELEBRATING INDIAN ROYALTY AND TRADITION',
      c1: '#2A181A',
      c2: '#140B0C',
      accent: '#B76E79',
    },
    {
      title: 'DAILY MINIMALIST SPARKLE',
      subtitle: 'TIMELESS LIGHTWEIGHT ELEGANCE',
      tag: 'STARTING AT JUST ₹499 • FREE SHIPPING',
      c1: '#1A2328',
      c2: '#0D1418',
      accent: '#38BDF8',
    },
  ]

  for (let i = 1; i <= 3; i++) {
    const b = bannerData[i - 1]
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="800" viewBox="0 0 1600 800">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${b.c1}"/>
      <stop offset="60%" stop-color="${b.c2}"/>
      <stop offset="100%" stop-color="#0A0908"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="30" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <rect width="1600" height="800" fill="url(#bg)"/>

  <!-- Background decorative rings -->
  <circle cx="1250" cy="400" r="320" fill="none" stroke="${b.accent}" stroke-width="2" opacity="0.2" stroke-dasharray="10 12"/>
  <circle cx="1250" cy="400" r="240" fill="none" stroke="${b.accent}" stroke-width="1.5" opacity="0.3"/>
  <circle cx="1250" cy="400" r="160" fill="${b.accent}" opacity="0.08"/>

  <!-- Right side Glowing Jewellery Icon -->
  <g transform="translate(1250, 400)">
    <circle cx="0" cy="0" r="110" fill="#1C1815" stroke="${b.accent}" stroke-width="3" filter="url(#glow)"/>
    <polygon points="0,-70 50,0 0,70 -50,0" fill="${b.accent}" opacity="0.9"/>
    <circle cx="0" cy="0" r="20" fill="#FAF8F5"/>
    <circle cx="0" cy="0" r="10" fill="${b.accent}"/>
  </g>

  <!-- Left Content -->
  <g transform="translate(120, 260)">
    <rect x="0" y="0" width="340" height="34" rx="17" fill="${b.accent}" opacity="0.2" stroke="${b.accent}" stroke-width="1"/>
    <text x="170" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="${b.accent}" text-anchor="middle" letter-spacing="3">${b.subtitle}</text>

    <text x="0" y="105" font-family="Georgia, serif" font-size="54" font-weight="bold" fill="#FFFFFF" letter-spacing="2">${b.title}</text>
    
    <text x="0" y="160" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" fill="#E5E0DA" letter-spacing="2">${b.tag}</text>

    <text x="0" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" fill="#A89F95">100% Certified Purity • Free Express Delivery • 7-Day Hassle-Free Returns</text>

    <!-- Button graphic -->
    <rect x="0" y="250" width="220" height="52" rx="26" fill="${b.accent}"/>
    <text x="110" y="282" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">Shop Collection →</text>
  </g>
</svg>`

    await sharp(Buffer.from(svg))
      .jpeg({ quality: 90 })
      .toFile(path.join(bannersDir, `banner-${i}.jpg`))
  }

  console.log('✅ Generated 3 real, valid binary JPEG banner images!')
}

run().catch((err) => {
  console.error('Error generating images:', err)
  process.exit(1)
})
