import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { syncProductRating } from '@/lib/reviewService'

interface Params {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const { isApproved } = body

    if (typeof isApproved !== 'boolean') {
      return NextResponse.json(
        { error: 'isApproved boolean value is required.' },
        { status: 400 }
      )
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { isApproved },
    })

    // Synchronize product's avgRating & reviewCount on live store
    const newStats = await syncProductRating(updated.productId)

    return NextResponse.json({
      success: true,
      review: updated,
      message: isApproved
        ? 'Review approved and is now live on the main website!'
        : 'Review hidden from the main website.',
      productStats: newStats,
    })
  } catch (error: any) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update review status' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const existing = await prisma.review.findUnique({
      where: { id },
      select: { productId: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    await prisma.review.delete({
      where: { id },
    })

    // Synchronize product's avgRating & reviewCount
    await syncProductRating(existing.productId)

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully.',
    })
  } catch (error: any) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete review' },
      { status: 500 }
    )
  }
}
