import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CATEGORY_IMAGE_MAPPING: Record<string, string> = {
  'oxidised-jewellery': '/images/categories/oxidised-jewellery.jpg',
  'earrings': '/images/categories/earrings.jpg',
  'nose-pins': '/images/categories/nose-pins.jpg',
  'necklaces': '/images/categories/necklaces.jpg',
  'bangles': '/images/categories/bangles.jpg',
  'rings': '/images/categories/rings.jpg',
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
