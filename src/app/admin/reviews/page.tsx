import { prisma } from '@/lib/prisma'
import ReviewsManagerClient from '@/components/admin/ReviewsManagerClient'

export const dynamic = 'force-dynamic'

export default async function AdminReviewsPage() {
  const [reviews, totalCount, pendingCount, approvedCount] = await Promise.all([
    prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            images: {
              take: 1,
              orderBy: { isPrimary: 'desc' },
              select: { url: true },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
    prisma.review.count(),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.review.count({ where: { isApproved: true } }),
  ])

  const serializedReviews = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    customerName: r.customerName,
    customerEmail: r.customerEmail,
    isVerified: r.isVerified,
    isApproved: r.isApproved,
    createdAt: r.createdAt.toISOString(),
    product: {
      id: r.product.id,
      name: r.product.name,
      slug: r.product.slug,
      sku: r.product.sku,
      images: r.product.images.map((img) => ({ url: img.url })),
    },
    user: r.user
      ? {
          id: r.user.id,
          firstName: r.user.firstName,
          lastName: r.user.lastName,
          email: r.user.email,
        }
      : null,
  }))

  return (
    <ReviewsManagerClient
      initialReviews={serializedReviews}
      initialSummary={{
        total: totalCount,
        pending: pendingCount,
        approved: approvedCount,
      }}
    />
  )
}
