import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteAllProducts() {
  console.log('--- Truncating Product table with CASCADE ---')

  const totalBefore = await prisma.product.count()
  console.log(`Current total products: ${totalBefore}`)

  await prisma.$executeRawUnsafe('TRUNCATE TABLE "ProductImage", "ProductVariant", "StockMovement", "CartItem", "WishlistItem", "TrendingProduct", "Review", "OrderItem", "Product" CASCADE;')

  const totalAfter = await prisma.product.count()
  console.log(`Remaining products in database: ${totalAfter}`)

  console.log('--- ALL PRODUCTS DELETED CLEANLY! ---')
}

deleteAllProducts()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Delete error:', err)
    process.exit(1)
  })
