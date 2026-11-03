import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

interface Params {
  params: Promise<{ slug: string }>
}

export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, name: true },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Only fetch APPROVED reviews for public storefront
    const reviews = await prisma.review.findMany({
      where: {
        productId: product.id,
        isApproved: true,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        rating: true,
        title: true,
        comment: true,
        customerName: true,
        isVerified: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Calculate rating breakdown
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    let totalScore = 0

    reviews.forEach((r) => {
      totalScore += r.rating
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating as 1 | 2 | 3 | 4 | 5]++
      }
    })

    const reviewCount = reviews.length
    const avgRating = reviewCount > 0 ? Math.round((totalScore / reviewCount) * 10) / 10 : 0

    return NextResponse.json({
      success: true,
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        customerName:
          r.customerName ||
          (r.user ? `${r.user.firstName} ${r.user.lastName}`.trim() : 'Verified Customer'),
        isVerified: r.isVerified,
        createdAt: r.createdAt,
      })),
      stats: {
        avgRating,
        reviewCount,
        distribution,
      },
    })
  } catch (error: any) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to load reviews' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const body = await req.json()
    const { rating, title, comment, customerName, customerEmail } = body

    const numRating = Number(rating)
    if (!numRating || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { error: 'Please provide a valid rating between 1 and 5 stars.' },
        { status: 400 }
      )
    }

    if (!comment || String(comment).trim().length < 3) {
      return NextResponse.json(
        { error: 'Please enter a review comment (minimum 3 characters).' },
        { status: 400 }
      )
    }

    // Check optional authenticated user
    const user = await getSession()
    let isVerified = false
    let finalCustomerName = customerName?.trim() || ''
    let finalCustomerEmail = customerEmail?.trim() || ''

    if (user) {
      finalCustomerName = finalCustomerName || `${user.firstName} ${user.lastName}`.trim()
      finalCustomerEmail = finalCustomerEmail || user.email

      // Check if user has bought this product in any confirmed/delivered order
      const purchaseCount = await prisma.orderItem.count({
        where: {
          productId: product.id,
          order: {
            userId: user.id,
            status: { in: ['CONFIRMED', 'DELIVERED', 'SHIPPED', 'PAID'] },
          },
        },
      })
      isVerified = purchaseCount > 0
    }

    if (!finalCustomerName) {
      finalCustomerName = 'Kalavies Customer'
    }

    // Create review in PENDING (isApproved: false) state awaiting admin review
    const newReview = await prisma.review.create({
      data: {
        productId: product.id,
        userId: user ? user.id : null,
        rating: numRating,
        title: title ? String(title).trim() : null,
        comment: String(comment).trim(),
        customerName: finalCustomerName,
        customerEmail: finalCustomerEmail || null,
        isVerified,
        isApproved: false, // Must be approved by admin before appearing on live storefront
      },
    })

    return NextResponse.json({
      success: true,
      message:
        'Thank you! Your review has been submitted successfully and will appear on the store once approved by our team.',
      reviewId: newReview.id,
    })
  } catch (error: any) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit review' },
      { status: 500 }
    )
  }
}
