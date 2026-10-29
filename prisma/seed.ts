import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'

const prisma = new PrismaClient()

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

async function main() {
  console.log('🌱 Seeding KALAVIES database...\n')

  // ==========================================
  // 1. ADMIN USER
  // ==========================================
  console.log('👤 Creating admin user...')
  const adminPasswordHash = await bcrypt.hash('Admin@123', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@kalavies.com' },
    update: {},
    create: {
      id: uuid(),
      email: 'admin@kalavies.com',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'Kalavies',
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
    },
  })
  console.log(`  ✅ Admin user created: ${adminUser.email}`)

  // ==========================================
  // 2. CATEGORIES (Hierarchical)
  // ==========================================
  console.log('\n📂 Creating categories...')

  const categoryTree: Record<string, string[]> = {
    'Oxidised Jewellery': [
      'Earrings',
      'Necklaces and Necklace Sets',
      'Bangles and Bracelets',
      'Rings',
      'Anklets',
      'Maang Tikka',
      'Jewellery Sets',
      'Other Accessories',
    ],
    'Artificial Jewellery': ['Earrings', 'Necklaces', 'Bangles', 'Rings'],
    'Traditional Jewellery': ['Necklaces', 'Earrings', 'Bangles'],
    'Daily Wear Jewellery': ['Studs', 'Chains', 'Simple Rings'],
    'Festive and Party Wear': [
      'Statement Necklaces',
      'Chandbali Earrings',
      'Bridal Sets',
    ],
  }

  const categoryMap: Record<string, string> = {}
  let sortOrder = 0

  for (const [parentName, children] of Object.entries(categoryTree)) {
    const parentId = uuid()
    const parentSlug = slugify(parentName)
    sortOrder++

    await prisma.category.upsert({
      where: { slug: parentSlug },
      update: {},
      create: {
        id: parentId,
        name: parentName,
        slug: parentSlug,
        description: `Explore our exquisite collection of ${parentName.toLowerCase()} crafted with precision and love.`,
        sortOrder,
        isActive: true,
      },
    })
    categoryMap[parentName] = parentId
    console.log(`  📁 ${parentName}`)

    for (let i = 0; i < children.length; i++) {
      const childName = children[i]
      const childId = uuid()
      const childSlug = slugify(`${parentName} ${childName}`)

      await prisma.category.upsert({
        where: { slug: childSlug },
        update: {},
        create: {
          id: childId,
          name: childName,
          slug: childSlug,
          description: `Browse our ${childName.toLowerCase()} from the ${parentName.toLowerCase()} collection.`,
          parentId,
          sortOrder: i + 1,
          isActive: true,
        },
      })
      categoryMap[`${parentName}:${childName}`] = childId
      console.log(`    └─ ${childName}`)
    }
  }

  // ==========================================
  // 3. SAMPLE PRODUCTS (25 products)
  // ==========================================
  console.log('\n🛍️ Creating products...')

  const products = [
    // --- Oxidised Jewellery ---
    {
      name: 'Antique Silver Oxidised Jhumka Earrings',
      sku: 'KLV-OXD-001',
      categoryKey: 'Oxidised Jewellery:Earrings',
      mrp: 599,
      sellingPrice: 449,
      costPrice: 180,
      material: 'Oxidised Silver',
      colour: 'Silver',
      style: 'Traditional',
      description:
        'Beautifully handcrafted antique silver oxidised jhumka earrings with intricate floral detailing. Perfect for ethnic wear and festive occasions. Lightweight and comfortable for all-day wear. Care: Wipe with a soft dry cloth after use. Avoid contact with perfumes and water.',
      totalStock: 50,
      isFeatured: true,
      isBestseller: true,
      weight: '18g',
    },
    {
      name: 'Oxidised Silver Choker Necklace Set',
      sku: 'KLV-OXD-002',
      categoryKey: 'Oxidised Jewellery:Necklaces and Necklace Sets',
      mrp: 999,
      sellingPrice: 749,
      costPrice: 320,
      material: 'Oxidised Silver',
      colour: 'Antique Silver',
      style: 'Bohemian',
      description:
        'Stunning oxidised silver choker necklace set featuring bold tribal motifs. Comes with matching earrings. Ideal for bohemian and ethnic styling. Adjustable thread closure ensures a perfect fit. Care: Store in a dry place, avoid moisture.',
      totalStock: 35,
      isFeatured: true,
      isNewArrival: true,
      weight: '45g',
    },
    {
      name: 'Oxidised German Silver Bangle Set',
      sku: 'KLV-OXD-003',
      categoryKey: 'Oxidised Jewellery:Bangles and Bracelets',
      mrp: 799,
      sellingPrice: 549,
      costPrice: 220,
      material: 'German Silver',
      colour: 'Silver',
      style: 'Ethnic',
      description:
        'Set of 4 oxidised German silver bangles with mirror work and geometric patterns. Stack them together or wear individually. Suitable for both casual and festive wear. Care: Avoid exposure to chemicals and perfumes.',
      totalStock: 40,
      isTrending: true,
      weight: '60g',
    },
    {
      name: 'Vintage Oxidised Finger Ring',
      sku: 'KLV-OXD-004',
      categoryKey: 'Oxidised Jewellery:Rings',
      mrp: 299,
      sellingPrice: 199,
      costPrice: 70,
      material: 'Oxidised Silver',
      colour: 'Silver',
      style: 'Bohemian',
      description:
        'Elegant vintage oxidised finger ring with peacock design. Adjustable size fits most fingers. A perfect everyday accessory with traditional charm. Care: Wipe with soft cloth after use.',
      totalStock: 80,
      weight: '8g',
    },
    {
      name: 'Oxidised Silver Anklet Pair',
      sku: 'KLV-OXD-005',
      categoryKey: 'Oxidised Jewellery:Anklets',
      mrp: 499,
      sellingPrice: 349,
      costPrice: 140,
      material: 'German Silver',
      colour: 'Antique Silver',
      style: 'Traditional',
      description:
        'Delicate pair of oxidised silver anklets with tiny ghungroo bells. Traditional design with a modern twist. The gentle jingling sound adds charm to your every step. Care: Keep in an airtight box when not in use.',
      totalStock: 25,
      isNewArrival: true,
      weight: '30g',
    },
    {
      name: 'Traditional Kundan Maang Tikka',
      sku: 'KLV-OXD-006',
      categoryKey: 'Oxidised Jewellery:Maang Tikka',
      mrp: 699,
      sellingPrice: 499,
      costPrice: 200,
      material: 'Alloy',
      colour: 'Gold',
      style: 'Traditional',
      description:
        'Exquisite Kundan-studded maang tikka with pearl drop detailing. A bridal essential that adds royalty to your look. Comes with an adjustable hook for secure wear. Care: Handle with care, store separately in a pouch.',
      totalStock: 30,
      isFeatured: true,
      isTrending: true,
      weight: '15g',
    },
    {
      name: 'Complete Oxidised Jewellery Set',
      sku: 'KLV-OXD-007',
      categoryKey: 'Oxidised Jewellery:Jewellery Sets',
      mrp: 1999,
      sellingPrice: 1499,
      costPrice: 600,
      material: 'Oxidised Silver',
      colour: 'Antique Silver',
      style: 'Ethnic',
      description:
        'Complete oxidised jewellery set including necklace, earrings, bangles, and maang tikka. Beautifully coordinated pieces with tribal motifs. A perfect gift for festivals and special occasions. Care: Store each piece separately in soft pouches.',
      totalStock: 15,
      isBestseller: true,
      isFeatured: true,
      weight: '120g',
    },
    {
      name: 'Oxidised Silver Nose Pin',
      sku: 'KLV-OXD-008',
      categoryKey: 'Oxidised Jewellery:Other Accessories',
      mrp: 199,
      sellingPrice: 149,
      costPrice: 40,
      material: 'Oxidised Silver',
      colour: 'Silver',
      style: 'Traditional',
      description:
        'Dainty oxidised silver nose pin with a delicate floral design. Clip-on style for easy wear — no piercing required. Lightweight and comfortable. Care: Store in a small zip pouch to avoid scratches.',
      totalStock: 60,
      weight: '3g',
    },

    // --- Artificial Jewellery ---
    {
      name: 'Rose Gold Layered Necklace Set',
      sku: 'KLV-ART-001',
      categoryKey: 'Artificial Jewellery:Necklaces',
      mrp: 899,
      sellingPrice: 649,
      costPrice: 260,
      material: 'Alloy',
      colour: 'Rose Gold',
      style: 'Contemporary',
      description:
        'Chic rose gold triple-layered necklace set with delicate chain links and tiny crystal pendants. Elevate your western or fusion outfits with this statement piece. Hypoallergenic and skin-safe. Care: Avoid contact with water and perfume.',
      totalStock: 45,
      isFeatured: true,
      isNewArrival: true,
      isTrending: true,
      weight: '25g',
    },
    {
      name: 'Crystal Drop Stud Earrings',
      sku: 'KLV-ART-002',
      categoryKey: 'Artificial Jewellery:Earrings',
      mrp: 399,
      sellingPrice: 299,
      costPrice: 100,
      material: 'Alloy',
      colour: 'Gold',
      style: 'Contemporary',
      description:
        'Sparkling crystal drop stud earrings with a gold-plated finish. Versatile design suitable for office wear, parties, and casual outings. Secure push-back closure. Care: Keep away from moisture and chemicals.',
      totalStock: 70,
      isBestseller: true,
      weight: '10g',
    },
    {
      name: 'Gold Plated Bangle Set of 6',
      sku: 'KLV-ART-003',
      categoryKey: 'Artificial Jewellery:Bangles',
      mrp: 699,
      sellingPrice: 499,
      costPrice: 190,
      material: 'Brass',
      colour: 'Gold',
      style: 'Indo-Western',
      description:
        'Elegant set of 6 gold-plated bangles with alternating plain and stone-studded designs. Perfect for stacking. Suitable for weddings, festivals, and celebrations. Available in multiple sizes. Care: Avoid harsh chemicals.',
      totalStock: 30,
      isNewArrival: true,
      weight: '55g',
    },
    {
      name: 'Adjustable CZ Solitaire Ring',
      sku: 'KLV-ART-004',
      categoryKey: 'Artificial Jewellery:Rings',
      mrp: 349,
      sellingPrice: 249,
      costPrice: 80,
      material: 'Brass',
      colour: 'Rose Gold',
      style: 'Contemporary',
      description:
        'Minimalist rose gold adjustable ring featuring a brilliant cubic zirconia solitaire stone. Everyday luxury at its finest. One-size-fits-all with an adjustable open band. Care: Wipe gently with a microfiber cloth.',
      totalStock: 55,
      weight: '5g',
    },

    // --- Traditional Jewellery ---
    {
      name: 'Temple Design Gold Plated Necklace',
      sku: 'KLV-TRD-001',
      categoryKey: 'Traditional Jewellery:Necklaces',
      mrp: 1499,
      sellingPrice: 1099,
      costPrice: 450,
      material: 'Copper',
      colour: 'Antique Gold',
      style: 'Traditional',
      description:
        'Majestic temple design gold-plated necklace featuring Lakshmi motifs and red kemp stones. A timeless piece for South Indian weddings, pujas, and cultural celebrations. Comes with matching earrings. Care: Store in a velvet box.',
      totalStock: 20,
      isFeatured: true,
      isBestseller: true,
      isTrending: true,
      weight: '80g',
    },
    {
      name: 'Kundan Chandbali Earrings',
      sku: 'KLV-TRD-002',
      categoryKey: 'Traditional Jewellery:Earrings',
      mrp: 799,
      sellingPrice: 599,
      costPrice: 240,
      material: 'Alloy',
      colour: 'Gold',
      style: 'Traditional',
      description:
        'Regal Kundan chandbali earrings with pearl drops and meenakari work. These statement earrings complement lehengas, sarees, and anarkalis perfectly. Lightweight despite their grand appearance. Care: Handle with care, avoid pulling.',
      totalStock: 35,
      isBestseller: true,
      weight: '22g',
    },
    {
      name: 'Pearl and Gold Traditional Bangles',
      sku: 'KLV-TRD-003',
      categoryKey: 'Traditional Jewellery:Bangles',
      mrp: 899,
      sellingPrice: 699,
      costPrice: 280,
      material: 'Brass',
      colour: 'Gold',
      style: 'Traditional',
      description:
        'Set of 4 pearl-embedded gold-toned traditional bangles. The delicate pearl accents add elegance and grace. Perfect for weddings and engagement ceremonies. Available in standard sizes. Care: Avoid water and perfume contact.',
      totalStock: 25,
      isNewArrival: true,
      weight: '50g',
    },

    // --- Daily Wear Jewellery ---
    {
      name: 'Minimalist Gold Stud Earrings',
      sku: 'KLV-DLY-001',
      categoryKey: 'Daily Wear Jewellery:Studs',
      mrp: 249,
      sellingPrice: 179,
      costPrice: 60,
      material: 'Alloy',
      colour: 'Gold',
      style: 'Contemporary',
      description:
        'Simple yet elegant gold-plated stud earrings with a brushed finish. Ideal for everyday wear — office, college, or casual outings. Hypoallergenic push-back closure. Care: Wipe with a dry cloth after use.',
      totalStock: 100,
      isBestseller: true,
      weight: '4g',
    },
    {
      name: 'Dainty Rose Gold Chain Necklace',
      sku: 'KLV-DLY-002',
      categoryKey: 'Daily Wear Jewellery:Chains',
      mrp: 399,
      sellingPrice: 299,
      costPrice: 120,
      material: 'Alloy',
      colour: 'Rose Gold',
      style: 'Contemporary',
      description:
        'Ultra-thin dainty rose gold chain necklace with a tiny heart pendant. Minimal, chic, and perfect for layering. Length: 18 inches with 2-inch extender. Lobster clasp closure. Care: Avoid sleeping or bathing while wearing.',
      totalStock: 65,
      isNewArrival: true,
      isTrending: true,
      weight: '6g',
    },
    {
      name: 'Simple Silver Tone Daily Ring',
      sku: 'KLV-DLY-003',
      categoryKey: 'Daily Wear Jewellery:Simple Rings',
      mrp: 199,
      sellingPrice: 149,
      costPrice: 50,
      material: 'Alloy',
      colour: 'Silver',
      style: 'Contemporary',
      description:
        'Sleek silver-toned band ring with a subtle twisted design. Comfortable for all-day, everyday wear. Adjustable size. A perfect stackable ring for a modern look. Care: Keep in a dry pouch.',
      totalStock: 90,
      weight: '5g',
    },

    // --- Festive and Party Wear ---
    {
      name: 'Grand Kundan Statement Necklace',
      sku: 'KLV-FST-001',
      categoryKey: 'Festive and Party Wear:Statement Necklaces',
      mrp: 2499,
      sellingPrice: 1899,
      costPrice: 750,
      material: 'Copper',
      colour: 'Gold',
      style: 'Traditional',
      description:
        'Breathtaking grand Kundan statement necklace with emerald green drops and pearl clusters. Show-stopping piece for weddings, receptions, and sangeet nights. Comes with matching chandbali earrings. Care: Store flat in a jewellery box.',
      totalStock: 10,
      isFeatured: true,
      isTrending: true,
      weight: '95g',
    },
    {
      name: 'Meenakari Chandbali Earrings',
      sku: 'KLV-FST-002',
      categoryKey: 'Festive and Party Wear:Chandbali Earrings',
      mrp: 999,
      sellingPrice: 749,
      costPrice: 300,
      material: 'Alloy',
      colour: 'Multi-color',
      style: 'Traditional',
      description:
        'Vibrant meenakari chandbali earrings with hand-painted floral motifs in pink, green, and blue. Pearl fringes add a touch of royalty. Ideal for Navratri, Diwali, and festive celebrations. Care: Handle delicately, avoid water.',
      totalStock: 40,
      isBestseller: true,
      isNewArrival: true,
      weight: '20g',
    },
    {
      name: 'Royal Bridal Jewellery Set',
      sku: 'KLV-FST-003',
      categoryKey: 'Festive and Party Wear:Bridal Sets',
      mrp: 3999,
      sellingPrice: 2999,
      costPrice: 1200,
      material: 'Copper',
      colour: 'Gold',
      style: 'Traditional',
      description:
        'Complete royal bridal jewellery set including rani haar necklace, choker, chandbali earrings, maang tikka, and nose ring. Kundan and pearl work with red meenakari. The ultimate bridal statement. Care: Store each piece in individual velvet pouches.',
      totalStock: 8,
      isFeatured: true,
      isBestseller: true,
      weight: '200g',
    },

    // Additional products for variety
    {
      name: 'Bohemian Oxidised Cuff Bracelet',
      sku: 'KLV-OXD-009',
      categoryKey: 'Oxidised Jewellery:Bangles and Bracelets',
      mrp: 499,
      sellingPrice: 349,
      costPrice: 130,
      material: 'German Silver',
      colour: 'Antique Silver',
      style: 'Bohemian',
      description:
        'Bold bohemian-style oxidised cuff bracelet with engraved paisley patterns. Adjustable to fit most wrist sizes. Makes a strong style statement with Indo-western outfits. Care: Avoid exposure to water and chemicals.',
      totalStock: 45,
      isTrending: true,
      weight: '35g',
    },
    {
      name: 'Pearl Cluster Stud Earrings',
      sku: 'KLV-ART-005',
      categoryKey: 'Artificial Jewellery:Earrings',
      mrp: 449,
      sellingPrice: 329,
      costPrice: 120,
      material: 'Alloy',
      colour: 'Gold',
      style: 'Indo-Western',
      description:
        'Charming pearl cluster stud earrings set in a gold-plated floral base. Elegant enough for weddings yet subtle enough for daily wear. Secure push-back closure ensures comfort. Care: Wipe with soft cloth after each use.',
      totalStock: 55,
      isNewArrival: true,
      weight: '12g',
    },
    {
      name: 'Oxidised Silver Coin Necklace',
      sku: 'KLV-OXD-010',
      categoryKey: 'Oxidised Jewellery:Necklaces and Necklace Sets',
      mrp: 699,
      sellingPrice: 499,
      costPrice: 200,
      material: 'German Silver',
      colour: 'Antique Silver',
      style: 'Bohemian',
      description:
        'Trendy oxidised silver coin necklace inspired by tribal artistry. Features miniature coin pendants dangling from a rope chain. Perfect for boho-chic and fusion looks. Adjustable length with lobster clasp. Care: Keep away from moisture.',
      totalStock: 30,
      isTrending: true,
      weight: '28g',
    },
    {
      name: 'Antique Gold Kamarband Waist Chain',
      sku: 'KLV-OXD-011',
      categoryKey: 'Oxidised Jewellery:Other Accessories',
      mrp: 1299,
      sellingPrice: 999,
      costPrice: 400,
      material: 'Alloy',
      colour: 'Antique Gold',
      style: 'Traditional',
      description:
        'Gorgeous antique gold waist chain (kamarband) with intricate temple design and pearl drops. A stunning accessory for sarees and lehengas. Adjustable hook-and-chain closure. Care: Store carefully to avoid tangling.',
      totalStock: 12,
      isFeatured: true,
      weight: '70g',
    },
  ]

  const productIds: string[] = []

  for (let i = 0; i < products.length; i++) {
    const p = products[i]
    const productId = uuid()
    const categoryId = categoryMap[p.categoryKey]

    if (!categoryId) {
      console.log(`  ⚠️ Category not found for: ${p.categoryKey}`)
      continue
    }

    const discountPercent = Math.round(((p.mrp - p.sellingPrice) / p.mrp) * 100)

    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        id: productId,
        name: p.name,
        slug: slugify(p.name),
        sku: p.sku,
        description: p.description,
        categoryId,
        brandName: 'KALAVIES',
        material: p.material,
        colour: p.colour,
        style: p.style,
        weight: p.weight,
        mrp: p.mrp,
        sellingPrice: p.sellingPrice,
        costPrice: p.costPrice,
        discountPercent,
        status: 'PUBLISHED',
        isFeatured: p.isFeatured ?? false,
        isNewArrival: p.isNewArrival ?? false,
        isBestseller: p.isBestseller ?? false,
        isTrending: p.isTrending ?? false,
        searchTags: `${p.material}, ${p.colour}, ${p.style}, ${p.name}`.toLowerCase(),
        totalStock: p.totalStock,
        lowStockThreshold: 5,
        viewCount: Math.floor(Math.random() * 500) + 50,
        soldCount: Math.floor(Math.random() * 100),
      },
    })

    productIds.push(productId)

    // Create product image
    await prisma.productImage.create({
      data: {
        id: uuid(),
        productId,
        url: `/images/products/placeholder-${i + 1}.jpg`,
        altText: p.name,
        sortOrder: 0,
        isPrimary: true,
      },
    })

    // Create a secondary image for some products
    if (i % 3 === 0) {
      await prisma.productImage.create({
        data: {
          id: uuid(),
          productId,
          url: `/images/products/placeholder-${i + 1}-alt.jpg`,
          altText: `${p.name} - alternate view`,
          sortOrder: 1,
          isPrimary: false,
        },
      })
    }

    // Create stock movement for opening stock
    await prisma.stockMovement.create({
      data: {
        id: uuid(),
        productId,
        type: 'OPENING',
        quantity: p.totalStock,
        reason: 'Initial stock from seed',
        previousQty: 0,
        newQty: p.totalStock,
      },
    })

    console.log(`  ✅ ${p.sku} - ${p.name}`)
  }

  // ==========================================
  // 4. PRODUCT VARIANTS
  // ==========================================
  console.log('\n🎨 Creating product variants...')

  // Variants for Oxidised Bangle Set (KLV-OXD-003)
  const bangleProduct = await prisma.product.findUnique({ where: { sku: 'KLV-OXD-003' } })
  if (bangleProduct) {
    const sizes = ['2.4', '2.6', '2.8']
    for (const size of sizes) {
      await prisma.productVariant.create({
        data: {
          id: uuid(),
          productId: bangleProduct.id,
          name: `Size ${size}`,
          sku: `KLV-OXD-003-${size.replace('.', '')}`,
          size,
          stock: 12,
          isActive: true,
        },
      })
    }
    console.log('  ✅ Bangle Set variants (sizes 2.4, 2.6, 2.8)')
  }

  // Variants for Gold Plated Bangle Set (KLV-ART-003)
  const goldBangleProduct = await prisma.product.findUnique({ where: { sku: 'KLV-ART-003' } })
  if (goldBangleProduct) {
    const sizes = ['2.4', '2.6', '2.8', '2.10']
    for (const size of sizes) {
      await prisma.productVariant.create({
        data: {
          id: uuid(),
          productId: goldBangleProduct.id,
          name: `Size ${size}`,
          sku: `KLV-ART-003-${size.replace('.', '')}`,
          size,
          stock: 8,
          isActive: true,
        },
      })
    }
    console.log('  ✅ Gold Plated Bangle variants (sizes 2.4, 2.6, 2.8, 2.10)')
  }

  // Color variants for Pearl Cluster Studs (KLV-ART-005)
  const pearlStudProduct = await prisma.product.findUnique({ where: { sku: 'KLV-ART-005' } })
  if (pearlStudProduct) {
    const colors = [
      { color: 'Gold', price: null },
      { color: 'Rose Gold', price: 349 },
      { color: 'Silver', price: null },
    ]
    for (const v of colors) {
      await prisma.productVariant.create({
        data: {
          id: uuid(),
          productId: pearlStudProduct.id,
          name: `${v.color}`,
          sku: `KLV-ART-005-${slugify(v.color).toUpperCase()}`,
          color: v.color,
          price: v.price,
          stock: 18,
          isActive: true,
        },
      })
    }
    console.log('  ✅ Pearl Cluster Stud variants (Gold, Rose Gold, Silver)')
  }

  // Variants for Traditional Bangles (KLV-TRD-003)
  const tradBangleProduct = await prisma.product.findUnique({ where: { sku: 'KLV-TRD-003' } })
  if (tradBangleProduct) {
    const sizes = ['2.4', '2.6', '2.8']
    for (const size of sizes) {
      await prisma.productVariant.create({
        data: {
          id: uuid(),
          productId: tradBangleProduct.id,
          name: `Size ${size}`,
          sku: `KLV-TRD-003-${size.replace('.', '')}`,
          size,
          stock: 8,
          isActive: true,
        },
      })
    }
    console.log('  ✅ Traditional Bangle variants (sizes 2.4, 2.6, 2.8)')
  }

  // ==========================================
  // 5. SAMPLE COUPONS
  // ==========================================
  console.log('\n🎟️ Creating coupons...')

  const coupons = [
    {
      code: 'WELCOME10',
      description: 'Welcome offer! Get 10% off on your first order.',
      type: 'PERCENTAGE',
      value: 10,
      maxDiscount: 100,
      minOrderValue: null,
      usageLimit: 1000,
      perUserLimit: 1,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
    {
      code: 'FLAT50',
      description: 'Flat ₹50 off on orders above ₹499!',
      type: 'FIXED',
      value: 50,
      maxDiscount: null,
      minOrderValue: 499,
      usageLimit: 500,
      perUserLimit: 2,
      startDate: new Date(),
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
    },
    {
      code: 'FESTIVE20',
      description: 'Festive season special! Get 20% off on orders above ₹999.',
      type: 'PERCENTAGE',
      value: 20,
      maxDiscount: 200,
      minOrderValue: 999,
      usageLimit: 300,
      perUserLimit: 1,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
    },
  ]

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: {
        id: uuid(),
        ...coupon,
        isActive: true,
      },
    })
    console.log(`  ✅ ${coupon.code} - ${coupon.description}`)
  }

  // ==========================================
  // 6. SHIPPING SETTINGS
  // ==========================================
  console.log('\n🚚 Creating shipping settings...')

  const existingShipping = await prisma.shippingSetting.findFirst()
  if (!existingShipping) {
    await prisma.shippingSetting.create({
      data: {
        id: uuid(),
        freeShippingAbove: 499,
        flatShippingRate: 49,
        estimatedDaysMin: 3,
        estimatedDaysMax: 7,
        codEnabled: true,
        codExtraCharge: 0,
        returnWindowDays: 7,
        cancellationWindowHours: 24,
        returnPolicy:
          'Items can be returned within 7 days of delivery. Products must be unused and in original packaging with all tags intact. Oxidised jewellery showing natural patina changes is not eligible for return.',
        cancellationPolicy:
          'Orders can be cancelled within 24 hours of placement. Once shipped, cancellation is not possible. Refunds are processed within 5-7 business days.',
      },
    })
    console.log('  ✅ Shipping settings configured (Free above ₹499, Flat rate ₹49)')
  }

  // ==========================================
  // 7. BUSINESS SETTINGS
  // ==========================================
  console.log('\n🏢 Creating business settings...')

  const existingBusiness = await prisma.businessSetting.findFirst()
  if (!existingBusiness) {
    await prisma.businessSetting.create({
      data: {
        id: uuid(),
        businessName: 'KALAVIES Jewellery',
        tagline: 'Elegance in Every Detail',
        email: 'support@kalavies.com',
        phone: '+91-9876543210',
        whatsapp: '+91-9876543210',
        addressLine1: 'Shop No. 12, Jewellery Market',
        addressLine2: 'Near Main Bazaar',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302001',
        socialInstagram: 'https://instagram.com/kalavies',
        socialFacebook: 'https://facebook.com/kalavies',
        aboutUs:
          'KALAVIES is a premium jewellery brand offering exquisite handcrafted oxidised, artificial, and traditional jewellery. Our collections are designed to celebrate the beauty of Indian craftsmanship with a modern touch. Every piece tells a story of elegance, tradition, and artistry.',
        privacyPolicy: 'We respect your privacy and are committed to protecting your personal data.',
        termsConditions:
          'By using our website, you agree to our terms and conditions. All products are subject to availability.',
      },
    })
    console.log('  ✅ Business settings configured')
  }

  // ==========================================
  // 8. TRENDING SETTINGS
  // ==========================================
  console.log('\n📈 Creating trending settings...')

  const existingTrending = await prisma.trendingSettings.findFirst()
  if (!existingTrending) {
    await prisma.trendingSettings.create({
      data: {
        id: uuid(),
        mode: 'HYBRID',
        autoWindowDays: 30,
        maxDisplayCount: 12,
        excludeOutOfStock: true,
      },
    })
    console.log('  ✅ Trending settings: Hybrid mode, 30-day window, max 12')
  }

  // ==========================================
  // 9. HOMEPAGE BANNERS
  // ==========================================
  console.log('\n🖼️ Creating homepage banners...')

  const banners = [
    {
      title: 'New Arrivals',
      subtitle: 'Discover Our Latest Collection',
      description:
        'Explore handcrafted jewellery pieces designed for every occasion. From traditional to contemporary — find your perfect adornment.',
      imageUrl: '/images/banners/banner-1.jpg',
      mobileImageUrl: '/images/banners/banner-1-mobile.jpg',
      linkUrl: '/collections/new-arrivals',
      buttonText: 'Shop Now',
      sortOrder: 1,
    },
    {
      title: 'Oxidised Collection',
      subtitle: 'Timeless Silver Artistry',
      description:
        'Our signature oxidised jewellery collection — where tradition meets modern elegance. Handcrafted with love.',
      imageUrl: '/images/banners/banner-2.jpg',
      mobileImageUrl: '/images/banners/banner-2-mobile.jpg',
      linkUrl: '/categories/oxidised-jewellery',
      buttonText: 'Explore Collection',
      sortOrder: 2,
    },
    {
      title: 'Festive Sale — Up to 30% Off',
      subtitle: 'Celebrate in Style',
      description:
        'Make every festival special with our stunning bridal and festive jewellery. Limited period offer — shop before it ends!',
      imageUrl: '/images/banners/banner-3.jpg',
      mobileImageUrl: '/images/banners/banner-3-mobile.jpg',
      linkUrl: '/categories/festive-and-party-wear',
      buttonText: 'Shop the Sale',
      sortOrder: 3,
    },
  ]

  for (const banner of banners) {
    await prisma.homepageBanner.create({
      data: {
        id: uuid(),
        ...banner,
        isActive: true,
      },
    })
    console.log(`  ✅ Banner: ${banner.title}`)
  }

  // ==========================================
  // 10. HOMEPAGE SECTIONS
  // ==========================================
  console.log('\n📑 Creating homepage sections...')

  const sections = [
    {
      title: 'Hero Banner',
      type: 'BANNER',
      subtitle: null,
      sortOrder: 1,
      config: JSON.stringify({ autoplay: true, interval: 5000 }),
    },
    {
      title: 'Shop by Category',
      type: 'CATEGORY',
      subtitle: 'Find Your Perfect Style',
      sortOrder: 2,
      config: JSON.stringify({ showParentOnly: true, maxDisplay: 6 }),
    },
    {
      title: 'Trending Now',
      type: 'TRENDING',
      subtitle: "What Everyone's Loving",
      sortOrder: 3,
      config: JSON.stringify({ maxDisplay: 8 }),
    },
    {
      title: 'Bestsellers',
      type: 'BESTSELLER',
      subtitle: 'Our Most Loved Pieces',
      sortOrder: 4,
      config: JSON.stringify({ maxDisplay: 8 }),
    },
    {
      title: 'New Arrivals',
      type: 'NEW_ARRIVAL',
      subtitle: 'Fresh from the Workshop',
      sortOrder: 5,
      config: JSON.stringify({ maxDisplay: 8 }),
    },
    {
      title: 'Featured Collection',
      type: 'FEATURED',
      subtitle: 'Handpicked Just for You',
      sortOrder: 6,
      config: JSON.stringify({ maxDisplay: 8 }),
    },
    {
      title: 'What Our Customers Say',
      type: 'TESTIMONIAL',
      subtitle: 'Real Reviews from Real People',
      sortOrder: 7,
      config: JSON.stringify({ maxDisplay: 5 }),
    },
  ]

  for (const section of sections) {
    await prisma.homepageSection.create({
      data: {
        id: uuid(),
        title: section.title,
        type: section.type,
        subtitle: section.subtitle,
        sortOrder: section.sortOrder,
        config: section.config,
        isActive: true,
      },
    })
    console.log(`  ✅ Section: ${section.title} (${section.type})`)
  }

  // ==========================================
  // 11. SAMPLE TESTIMONIALS
  // ==========================================
  console.log('\n💬 Creating testimonials...')

  const testimonials = [
    {
      name: 'Priya Sharma',
      location: 'Mumbai, Maharashtra',
      rating: 5,
      comment:
        'Absolutely love my oxidised jhumka earrings! The craftsmanship is incredible and they look even better in person. Fast delivery and beautiful packaging. Will definitely order again!',
      sortOrder: 1,
    },
    {
      name: 'Ananya Reddy',
      location: 'Hyderabad, Telangana',
      rating: 5,
      comment:
        "The temple design necklace is a masterpiece! I wore it to my sister's wedding and received so many compliments. KALAVIES has become my go-to for traditional jewellery.",
      sortOrder: 2,
    },
    {
      name: 'Sneha Patel',
      location: 'Ahmedabad, Gujarat',
      rating: 4,
      comment:
        'Great quality at affordable prices. The rose gold layered necklace looks premium and goes with everything. Slightly delayed delivery but the product made up for it.',
      sortOrder: 3,
    },
    {
      name: 'Kavita Joshi',
      location: 'Jaipur, Rajasthan',
      rating: 5,
      comment:
        "I've ordered multiple times from KALAVIES and I'm always impressed by their quality. The bridal set I purchased for my engagement was stunning. Highly recommend!",
      sortOrder: 4,
    },
    {
      name: 'Meera Nair',
      location: 'Kochi, Kerala',
      rating: 5,
      comment:
        'The daily wear studs are my favourite! So lightweight and elegant. I wear them every day and they still look brand new. Excellent value for money.',
      sortOrder: 5,
    },
  ]

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({
      data: {
        id: uuid(),
        ...testimonial,
        isActive: true,
      },
    })
    console.log(`  ✅ Testimonial: ${testimonial.name}`)
  }

  // ==========================================
  // 12. TRENDING PRODUCTS CONFIG
  // ==========================================
  console.log('\n🔥 Configuring trending/bestseller products...')

  const trendingSkus = [
    { sku: 'KLV-ART-001', section: 'TRENDING', priority: 1 },
    { sku: 'KLV-TRD-001', section: 'TRENDING', priority: 2 },
    { sku: 'KLV-OXD-003', section: 'TRENDING', priority: 3 },
    { sku: 'KLV-DLY-002', section: 'TRENDING', priority: 4 },
    { sku: 'KLV-FST-001', section: 'TRENDING', priority: 5 },
    { sku: 'KLV-OXD-009', section: 'TRENDING', priority: 6 },
    { sku: 'KLV-OXD-001', section: 'BESTSELLER', priority: 1 },
    { sku: 'KLV-ART-002', section: 'BESTSELLER', priority: 2 },
    { sku: 'KLV-TRD-002', section: 'BESTSELLER', priority: 3 },
    { sku: 'KLV-DLY-001', section: 'BESTSELLER', priority: 4 },
    { sku: 'KLV-FST-003', section: 'BESTSELLER', priority: 5 },
    { sku: 'KLV-FST-002', section: 'BESTSELLER', priority: 6 },
  ]

  for (const t of trendingSkus) {
    const product = await prisma.product.findUnique({ where: { sku: t.sku } })
    if (product) {
      await prisma.trendingProduct.upsert({
        where: { productId: product.id },
        update: {},
        create: {
          id: uuid(),
          productId: product.id,
          mode: 'MANUAL',
          priority: t.priority,
          section: t.section,
          isVisible: true,
        },
      })
      console.log(`  ✅ ${t.sku} → ${t.section} (priority: ${t.priority})`)
    }
  }

  console.log('\n✨ Seed completed successfully!')
  console.log(`
  Summary:
  ────────────────────────────
  Admin User:     admin@kalavies.com / Admin@123
  Categories:     ${Object.keys(categoryTree).length} parent + ${Object.values(categoryTree).flat().length} children
  Products:       ${products.length}
  Coupons:        ${coupons.length}
  Banners:        ${banners.length}
  Sections:       ${sections.length}
  Testimonials:   ${testimonials.length}
  ────────────────────────────
  `)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
