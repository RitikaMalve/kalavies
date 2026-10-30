import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixBanners() {
  console.log('--- Updating Homepage Banners to point to valid store links ---')

  const banners = await prisma.homepageBanner.findMany({ orderBy: { sortOrder: 'asc' } })

  if (banners.length > 0) {
    // Banner 1: Hero Shop Now
    await prisma.homepageBanner.update({
      where: { id: banners[0].id },
      data: {
        title: 'Royal Indian Handcrafted Jewellery',
        subtitle: 'Antique Oxidised Silver & Traditional Grandeur',
        description: 'Intricately carved oxidised silver, jhumkas, chokers and rings crafted for the modern Indian connoisseur.',
        linkUrl: '/products',
        buttonText: 'Shop Now',
        isActive: true,
      },
    })
    console.log('Updated Banner 1 (Shop Now -> /products)')
  }

  if (banners.length > 1) {
    // Banner 2: Oxidised Collection
    await prisma.homepageBanner.update({
      where: { id: banners[1].id },
      data: {
        linkUrl: '/products?category=oxidised-jewellery',
        buttonText: 'Explore Collection',
        isActive: true,
      },
    })
    console.log('Updated Banner 2 (Explore Collection -> /products?category=oxidised-jewellery)')
  }

  if (banners.length > 2) {
    // Banner 3
    await prisma.homepageBanner.update({
      where: { id: banners[2].id },
      data: {
        linkUrl: '/products',
        buttonText: 'Shop All Jewellery',
        isActive: true,
      },
    })
    console.log('Updated Banner 3 (Shop All Jewellery -> /products)')
  }

  console.log('--- Banners updated successfully ---')
}

fixBanners()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error fixing banners:', err)
    process.exit(1)
  })
