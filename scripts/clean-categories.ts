import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanCategoriesAndProducts() {
  console.log('--- Cleaning Categories & Products to 6 core categories ---')

  // 1. Ensure Parent category: Oxidised Jewellery
  let oxidisedParent = await prisma.category.upsert({
    where: { slug: 'oxidised-jewellery' },
    update: {
      name: 'Oxidised Jewellery',
      sortOrder: 1,
      image: '/images/categories/oxidised.jpg',
    },
    create: {
      name: 'Oxidised Jewellery',
      slug: 'oxidised-jewellery',
      sortOrder: 1,
      image: '/images/categories/oxidised.jpg',
    },
  })

  // 2. The 5 Sub-categories requested by the user
  const subCats = [
    { name: 'Earrings', slug: 'earrings', sortOrder: 2 },
    { name: 'Nose Pins', slug: 'nose-pins', sortOrder: 3 },
    { name: 'Necklaces', slug: 'necklaces', sortOrder: 4 },
    { name: 'Bangles', slug: 'bangles', sortOrder: 5 },
    { name: 'Rings', slug: 'rings', sortOrder: 6 },
  ]

  const categoryMap: Record<string, string> = {
    'oxidised-jewellery': oxidisedParent.id,
  }

  for (const sc of subCats) {
    const cat = await prisma.category.upsert({
      where: { slug: sc.slug },
      update: {
        name: sc.name,
        sortOrder: sc.sortOrder,
        parent: { connect: { id: oxidisedParent.id } },
      },
      create: {
        name: sc.name,
        slug: sc.slug,
        sortOrder: sc.sortOrder,
        parent: { connect: { id: oxidisedParent.id } },
      },
    })
    categoryMap[sc.slug] = cat.id
  }

  const allowedCategoryIds = Object.values(categoryMap)

  // 3. Re-assign relevant products to the clean categories
  const allProducts = await prisma.product.findMany({
    include: { category: true },
  })

  for (const p of allProducts) {
    const nameLower = p.name.toLowerCase()

    if (nameLower.includes('nose') || nameLower.includes('nath')) {
      await prisma.product.update({
        where: { id: p.id },
        data: { categoryId: categoryMap['nose-pins'] },
      })
      console.log(`Assigned "${p.name}" -> Nose Pins`)
    } else if (nameLower.includes('earring') || nameLower.includes('jhumka') || nameLower.includes('chandbali') || nameLower.includes('stud')) {
      await prisma.product.update({
        where: { id: p.id },
        data: { categoryId: categoryMap['earrings'] },
      })
      console.log(`Assigned "${p.name}" -> Earrings`)
    } else if (nameLower.includes('necklace') || nameLower.includes('choker') || nameLower.includes('haar') || nameLower.includes('set')) {
      await prisma.product.update({
        where: { id: p.id },
        data: { categoryId: categoryMap['necklaces'] },
      })
      console.log(`Assigned "${p.name}" -> Necklaces`)
    } else if (nameLower.includes('bangle') || nameLower.includes('bracelet') || nameLower.includes('kada')) {
      await prisma.product.update({
        where: { id: p.id },
        data: { categoryId: categoryMap['bangles'] },
      })
      console.log(`Assigned "${p.name}" -> Bangles`)
    } else if (nameLower.includes('ring')) {
      await prisma.product.update({
        where: { id: p.id },
        data: { categoryId: categoryMap['rings'] },
      })
      console.log(`Assigned "${p.name}" -> Rings`)
    } else if (nameLower.includes('kamarband') || nameLower.includes('anklet') || nameLower.includes('maang') || nameLower.includes('tikka')) {
      // Non-jewellery item requested to be removed
      console.log(`Removing non-requested demo product: "${p.name}"`)
      try {
        await prisma.cartItem.deleteMany({ where: { productId: p.id } })
        await prisma.wishlistItem.deleteMany({ where: { productId: p.id } })
        await prisma.productImage.deleteMany({ where: { productId: p.id } })
        await prisma.productVariant.deleteMany({ where: { productId: p.id } })
        await prisma.stockMovement.deleteMany({ where: { productId: p.id } })
        await prisma.product.delete({ where: { id: p.id } })
      } catch (e: any) {
        console.error(`Could not delete ${p.name}:`, e.message)
      }
    } else {
      // Keep under general oxidised jewellery
      await prisma.product.update({
        where: { id: p.id },
        data: { categoryId: categoryMap['oxidised-jewellery'] },
      })
    }
  }

  // 4. Delete old/unwanted categories
  const otherCategories = await prisma.category.findMany({
    where: {
      id: { notIn: allowedCategoryIds },
    },
  })

  console.log(`Found ${otherCategories.length} unwanted demo categories to remove`)
  // First delete any children of other categories to avoid foreign key errors
  const childCategories = otherCategories.filter(c => c.parentId !== null)
  const parentCategories = otherCategories.filter(c => c.parentId === null)

  for (const cat of [...childCategories, ...parentCategories]) {
    try {
      // Re-link or remove any remaining products
      await prisma.product.updateMany({
        where: { categoryId: cat.id },
        data: { categoryId: categoryMap['oxidised-jewellery'] },
      })
      await prisma.homepageSection.deleteMany({ where: { categoryId: cat.id } })
      await prisma.category.delete({ where: { id: cat.id } })
      console.log(`Deleted category: ${cat.name} (${cat.slug})`)
    } catch (e: any) {
      console.log(`Could not delete ${cat.name}: ${e.message}`)
    }
  }

  console.log('--- Cleanup Finished Successfully ---')
}

cleanCategoriesAndProducts()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Cleanup error:', err)
    process.exit(1)
  })
