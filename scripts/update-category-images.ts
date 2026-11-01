import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CATEGORY_IMAGE_MAPPING: Record<string, string> = {
  'oxidised-jewellery': '/images/categories/oxidised-jewellery.jpg?v=20261101',
  'earrings': '/images/categories/earrings.jpg?v=20261101',
  'nose-pins': '/images/categories/nose-pins.jpg?v=20261101',
  'necklaces': '/images/categories/necklaces.jpg?v=20261101',
  'bangles': '/images/categories/bangles.jpg?v=20261101',
  'rings': '/images/categories/rings.jpg?v=20261101',
}

async function updateCategoryImages() {
  console.log('Updating category images in Neon PostgreSQL...')
  for (const [slug, imageUrl] of Object.entries(CATEGORY_IMAGE_MAPPING)) {
    const res = await prisma.category.updateMany({
      where: { slug },
      data: { image: imageUrl },
    })
    console.log(`Updated slug "${slug}" -> ${imageUrl} (count: ${res.count})`)
  }
  console.log('All category images successfully updated!')
}

updateCategoryImages()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
