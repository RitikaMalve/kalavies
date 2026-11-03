import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { syncProductRating } from '@/lib/reviewService'

export async function GET(req: NextRequest) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'ALL'
  const search = searchParams.get('search') || ''
  const page = Number(searchParams.get('page')) || 1
  const limit = 20

  const where: any = {}

  if (status === 'PENDING') {
    where.isApproved = false
  } else if (status === 'APPROVED') {
    where.isApproved = true
  }

  if (search) {
    where.OR = [
      { comment: { contains: search, mode: 'insensitive' } },
      { title: { contains: search, mode: 'insensitive' } },
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerEmail: { contains: search, mode: 'insensitive' } },
      { product: { name: { contains: search, mode: 'insensitive' } } },
    ]
  }

  try {
    const [reviews, totalCount, stats] = await Promise.all([
      prisma.review.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
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
      prisma.review.count({ where }),
      Promise.all([
        prisma.review.count(),
        prisma.review.count({ where: { isApproved: false } }),
        prisma.review.count({ where: { isApproved: true } }),
      ]),
    ])

    return NextResponse.json({
      reviews,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
      summary: {
        total: stats[0],
        pending: stats[1],
        approved: stats[2],
      },
    })
  } catch (error: any) {
    console.error('Error fetching admin reviews:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { productId, rating, title, comment, customerName, isApproved, isVerified } = body

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Product, rating, and comment are required.' },
        { status: 400 }
      )
    }

    const review = await prisma.review.create({
      data: {
        productId,
        rating: Number(rating),
        title: title || null,
        comment: String(comment).trim(),
        customerName: customerName || 'Verified Buyer',
        isApproved: Boolean(isApproved),
        isVerified: Boolean(isVerified),
      },
    })

    if (review.isApproved) {
      await syncProductRating(productId)
    }

    return NextResponse.json({ success: true, review })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
