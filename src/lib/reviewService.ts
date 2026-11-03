import { prisma } from '@/lib/prisma'

/**
 * Recalculates and synchronizes avgRating and reviewCount for a product
 * based exclusively on approved reviews (isApproved: true).
 */
export async function syncProductRating(productId: string) {
  try {
    const approvedReviews = await prisma.review.findMany({
      where: {
        productId,
        isApproved: true,
      },
      select: {
        rating: true,
      },
    })

    const count = approvedReviews.length
    let avg = 0
    if (count > 0) {
      const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0)
      avg = Math.round((sum / count) * 10) / 10 // rounded to 1 decimal place, e.g. 4.8
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        avgRating: avg,
        reviewCount: count,
      },
    })

    return { avgRating: avg, reviewCount: count }
  } catch (error) {
    console.error(`Failed to sync ratings for product ${productId}:`, error)
    return null
  }
}
