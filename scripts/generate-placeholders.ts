import fs from 'fs'
import path from 'path'

const productsDir = path.join(process.cwd(), 'public/images/products')
const bannersDir = path.join(process.cwd(), 'public/images/banners')

fs.mkdirSync(productsDir, { recursive: true })
fs.mkdirSync(bannersDir, { recursive: true })

// Product placeholder SVG generator
for (let i = 1; i <= 25; i++) {
  const filePath = path.join(productsDir, `placeholder-${i}.jpg`)
  if (!fs.existsSync(filePath)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <radialGradient id="g" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#FAF5EE"/>
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="url(#g)"/>
  <circle cx="300" cy="300" r="180" fill="none" stroke="#C9A84C" stroke-width="2" stroke-dasharray="4 8" opacity="0.6"/>
  <circle cx="300" cy="300" r="140" fill="none" stroke="#C9A84C" stroke-width="1.5" opacity="0.4"/>
  <circle cx="300" cy="300" r="100" fill="#FDFBF7" stroke="#E8E3DC" stroke-width="1"/>
  <path d="M 300 230 L 325 280 L 380 288 L 340 327 L 350 382 L 300 355 L 250 382 L 260 327 L 220 288 L 275 280 Z" fill="#C9A84C" opacity="0.85"/>
  <text x="300" y="440" font-family="serif" font-size="20" font-weight="bold" fill="#1A1A1A" text-anchor="middle" letter-spacing="3">KALAVIES</text>
  <text x="300" y="465" font-family="sans-serif" font-size="11" fill="#C9A84C" text-anchor="middle" letter-spacing="4">HANDCRAFTED JEWELLERY</text>
  <text x="300" y="490" font-family="sans-serif" font-size="10" fill="#8C827A" text-anchor="middle">DESIGN #${i}</text>
</svg>`
    fs.writeFileSync(filePath, svg)
  }
}

// Banner placeholders
for (let i = 1; i <= 3; i++) {
  const filePath = path.join(bannersDir, `banner-${i}.jpg`)
  if (!fs.existsSync(filePath)) {
    const bannerTitles = ['ROYAL HERITAGE OXIDISED', 'ANTIQUE FESTIVE GLOW', 'DAILY MINIMALIST SPARKLE']
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A1A1A"/>
      <stop offset="50%" stop-color="#26221E"/>
      <stop offset="100%" stop-color="#141414"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="600" fill="url(#bg)"/>
  <circle cx="950" cy="300" r="220" fill="none" stroke="#C9A84C" stroke-width="2" opacity="0.25"/>
  <circle cx="950" cy="300" r="160" fill="none" stroke="#C9A84C" stroke-width="1.5" stroke-dasharray="8 8" opacity="0.3"/>
  <circle cx="950" cy="300" r="100" fill="#2A241D" stroke="#C9A84C" stroke-width="1"/>
  <path d="M 950 240 L 970 280 L 1015 286 L 982 318 L 990 362 L 950 340 L 910 362 L 918 318 L 885 286 L 930 280 Z" fill="#C9A84C"/>
  <text x="120" y="270" font-family="serif" font-size="44" font-weight="bold" fill="#FFFFFF" letter-spacing="2">${bannerTitles[i - 1]}</text>
  <text x="120" y="325" font-family="sans-serif" font-size="16" fill="#C9A84C" letter-spacing="4">HANDCRAFTED INDIAN JEWELLERY</text>
  <text x="120" y="365" font-family="sans-serif" font-size="14" fill="#B3ABA2">100% Certified Purity • Free Express Shipping • Exclusive Festive Edition</text>
</svg>`
    fs.writeFileSync(filePath, svg)
  }
}

console.log('✅ Generated placeholder images!')
