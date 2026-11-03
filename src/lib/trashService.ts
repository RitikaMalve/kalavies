import { prisma } from '@/lib/prisma'

/**
 * Automatically purges products in trash that have been deleted for more than 24 hours (1 day).
 * Respects order history by keeping order records safe if an item has sales history.
 */
export async function purgeExpiredDeletedProducts(): Promise<number> {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const expiredProducts = await prisma.product.findMany({
      where: {
        isDeleted: true,
        deletedAt: {
          lte: oneDayAgo,
        },
      },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    })

    if (expiredProducts.length === 0) return 0

    let purgedCount = 0

    for (const product of expiredProducts) {
      if (product._count.orderItems > 0) {
        // Product has historical orders: preserve order records while removing auxiliary data
        await prisma.$transaction([
          prisma.productImage.deleteMany({ where: { productId: product.id } }),
          prisma.cartItem.deleteMany({ where: { productId: product.id } }),
          prisma.wishlistItem.deleteMany({ where: { productId: product.id } }),
          prisma.trendingProduct.deleteMany({ where: { productId: product.id } }),
          prisma.discountRule.deleteMany({ where: { targetId: product.id } }),
          prisma.product.update({
            where: { id: product.id },
            data: {
              status: 'ARCHIVED',
              isDeleted: true,
              totalStock: 0,
            },
          }),
        ])
      } else {
        // No orders: safe to permanently delete all records
        await prisma.$transaction([
          prisma.productImage.deleteMany({ where: { productId: product.id } }),
          prisma.productVariant.deleteMany({ where: { productId: product.id } }),
          prisma.cartItem.deleteMany({ where: { productId: product.id } }),
          prisma.wishlistItem.deleteMany({ where: { productId: product.id } }),
          prisma.review.deleteMany({ where: { productId: product.id } }),
          prisma.stockMovement.deleteMany({ where: { productId: product.id } }),
          prisma.trendingProduct.deleteMany({ where: { productId: product.id } }),
          prisma.discountRule.deleteMany({ where: { targetId: product.id } }),
          prisma.product.delete({ where: { id: product.id } }),
        ])
      }
      purgedCount++
    }

    return purgedCount
  } catch (error) {
    console.error('Error during purgeExpiredDeletedProducts:', error)
    return 0
  }
}

/**
 * Move one or more products to Trash folder.
 * Starts the 24-hour countdown until permanent deletion.
 */
export async function moveProductsToTrash(productIds: string[]) {
  if (!productIds || productIds.length === 0) return { count: 0 }

  return prisma.product.updateMany({
    where: { id: { in: productIds } },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      status: 'ARCHIVED',
    },
  })
}

/**
 * Restore one or more products from Trash back to active catalogue.
 */
export async function restoreProductsFromTrash(productIds: string[]) {
  if (!productIds || productIds.length === 0) return { count: 0 }

  return prisma.product.updateMany({
    where: { id: { in: productIds } },
    data: {
      isDeleted: false,
      deletedAt: null,
      status: 'DRAFT', // restored as DRAFT so admin can review before re-publishing
    },
  })
}

/**
 * Permanently delete products immediately from Trash.
 */
export async function permanentlyDeleteProducts(productIds: string[]) {
  if (!productIds || productIds.length === 0) return { count: 0 }

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: {
      _count: {
        select: { orderItems: true },
      },
    },
  })

  let count = 0
  for (const product of products) {
    if (product._count.orderItems > 0) {
      await prisma.$transaction([
        prisma.productImage.deleteMany({ where: { productId: product.id } }),
        prisma.cartItem.deleteMany({ where: { productId: product.id } }),
        prisma.wishlistItem.deleteMany({ where: { productId: product.id } }),
        prisma.trendingProduct.deleteMany({ where: { productId: product.id } }),
        prisma.discountRule.deleteMany({ where: { targetId: product.id } }),
        prisma.product.update({
          where: { id: product.id },
          data: {
            status: 'ARCHIVED',
            isDeleted: true,
            totalStock: 0,
          },
        }),
      ])
    } else {
      await prisma.$transaction([
        prisma.productImage.deleteMany({ where: { productId: product.id } }),
        prisma.productVariant.deleteMany({ where: { productId: product.id } }),
        prisma.cartItem.deleteMany({ where: { productId: product.id } }),
        prisma.wishlistItem.deleteMany({ where: { productId: product.id } }),
        prisma.review.deleteMany({ where: { productId: product.id } }),
        prisma.stockMovement.deleteMany({ where: { productId: product.id } }),
        prisma.trendingProduct.deleteMany({ where: { productId: product.id } }),
        prisma.discountRule.deleteMany({ where: { targetId: product.id } }),
        prisma.product.delete({ where: { id: product.id } }),
      ])
    }
    count++
  }

  return { count }
}
