import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

async function generateCategoryImages() {
  const dir = path.join(process.cwd(), 'public/images/categories')
  fs.mkdirSync(dir, { recursive: true })

  const categories = [
    {
      file: 'cat-oxidised.jpg',
      title: 'OXIDISED',
      subtitle: 'JEWELLERY',
      tag: 'Antique Silver Finish',
      bg1: '#2b2a2a',
      bg2: '#1a1919',
      accent: '#C9A84C',
      subColor: '#D1D5DB'
    },
    {
      file: 'cat-artificial.jpg',
      title: 'ARTIFICIAL',
      subtitle: 'COLLECTION',
      tag: 'Fashion and CZ Glitz',
      bg1: '#3D1C28',
      bg2: '#231018',
      accent: '#F472B6',
      subColor: '#FCE7F3'
    },
    {
      file: 'cat-traditional.jpg',
      title: 'TRADITIONAL',
      subtitle: 'HERITAGE',
      tag: 'Kundan and Temple Motif',
      bg1: '#38220F',
      bg2: '#1F1206',
      accent: '#FBBF24',
      subColor: '#FEF3C7'
    },
    {
      file: 'cat-daily.jpg',
      title: 'DAILY WEAR',
      subtitle: 'ESSENTIALS',
      tag: 'Minimal and Lightweight',
      bg1: '#1F2937',
      bg2: '#111827',
      accent: '#60A5FA',
      subColor: '#E0E7FF'
    },
    {
      file: 'cat-festive.jpg',
      title: 'FESTIVE AND PARTY',
      subtitle: 'WEAR',
      tag: 'Royal Celebration Sets',
      bg1: '#1A332B',
      bg2: '#0D1D18',
      accent: '#34D399',
      subColor: '#D1FAE5'
    }
  ]

  for (const cat of categories) {
    const idSafe = cat.file.replace(/[^a-zA-Z0-9]/g, '_')
    const svg = `
      <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="catGrad_${idSafe}" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="${cat.bg1}"/>
            <stop offset="100%" stop-color="${cat.bg2}"/>
          </radialGradient>
        </defs>
        
        <rect width="400" height="400" fill="url(#catGrad_${idSafe})" rx="32"/>
        
        <!-- Outer ornate ring -->
        <circle cx="200" cy="200" r="160" fill="none" stroke="${cat.accent}" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.6"/>
        <circle cx="200" cy="200" r="145" fill="none" stroke="${cat.accent}" stroke-width="1" opacity="0.3"/>
        
        <!-- Diamond emblem -->
        <polygon points="200,90 230,130 200,170 170,130" fill="none" stroke="${cat.accent}" stroke-width="2"/>
        <circle cx="200" cy="130" r="8" fill="${cat.accent}"/>

        <text x="200" y="225" font-family="serif" font-size="22" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">${cat.title}</text>
        <text x="200" y="255" font-family="sans-serif" font-size="13" font-weight="600" fill="${cat.accent}" text-anchor="middle" letter-spacing="6">${cat.subtitle}</text>
        
        <rect x="110" y="278" width="180" height="26" rx="13" fill="${cat.accent}" fill-opacity="0.15" stroke="${cat.accent}" stroke-width="0.75"/>
        <text x="200" y="295" font-family="sans-serif" font-size="11" font-weight="500" fill="${cat.subColor}" text-anchor="middle">${cat.tag}</text>
      </svg>
    `

    const outputPath = path.join(dir, cat.file)
    await sharp(Buffer.from(svg))
      .jpeg({ quality: 92 })
      .toFile(outputPath)
    console.log('✅ Generated:', outputPath)
  }
}

generateCategoryImages()
