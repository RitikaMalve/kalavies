import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import {
  moveProductsToTrash,
  restoreProductsFromTrash,
  permanentlyDeleteProducts,
  purgeExpiredDeletedProducts,
} from '@/lib/trashService'

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { action, productIds, categoryId, isTrending } = body

    // 1. Purge expired trash items (> 24 hours)
    if (action === 'purge_expired') {
      const purged = await purgeExpiredDeletedProducts()
      return NextResponse.json({
        success: true,
        message: `Successfully purged ${purged} expired products from Trash.`,
        purgedCount: purged,
      })
    }

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one product.' },
        { status: 400 }
      )
    }

    // 2. Move to Trash (Soft delete for 24 hours)
    if (action === 'delete') {
      const res = await moveProductsToTrash(productIds)
      return NextResponse.json({
        success: true,
        message: `Moved ${res.count} product(s) to Trash folder. They will be auto-deleted permanently after 24 hours.`,
        count: res.count,
      })
    }

    // 3. Restore from Trash
    if (action === 'restore') {
      const res = await restoreProductsFromTrash(productIds)
      return NextResponse.json({
        success: true,
        message: `Restored ${res.count} product(s) to active catalogue as Drafts.`,
        count: res.count,
      })
    }

    // 4. Permanent Delete
    if (action === 'permanent_delete') {
      const res = await permanentlyDeleteProducts(productIds)
      return NextResponse.json({
        success: true,
        message: `Permanently deleted ${res.count} product(s).`,
        count: res.count,
      })
    }

    // 5. Add / Remove Trending
    if (action === 'set_trending') {
      const trending = isTrending !== false

      await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { isTrending: trending },
      })

      for (const id of productIds) {
        if (trending) {
          await prisma.trendingProduct.upsert({
            where: { productId: id },
            update: { isVisible: true },
            create: {
              productId: id,
              section: 'TRENDING',
              isVisible: true,
              priority: 10,
            },
          })
        } else {
          await prisma.trendingProduct.deleteMany({
            where: { productId: id },
          })
        }
      }

      return NextResponse.json({
        success: true,
        message: `${trending ? 'Added' : 'Removed'} ${productIds.length} product(s) ${
          trending ? 'to' : 'from'
        } Trending collection.`,
      })
    }

    // 6. Bulk Move / Change Category
    if (action === 'set_category') {
      if (!categoryId) {
        return NextResponse.json(
          { error: 'Please select a destination category.' },
          { status: 400 }
        )
      }

      const targetCategory = await prisma.category.findUnique({
        where: { id: categoryId },
      })

      if (!targetCategory) {
        return NextResponse.json(
          { error: 'Selected category was not found.' },
          { status: 404 }
        )
      }

      const res = await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { categoryId },
      })

      return NextResponse.json({
        success: true,
        message: `Successfully moved ${res.count} product(s) to category "${targetCategory.name}".`,
        count: res.count,
      })
    }

    return NextResponse.json({ error: 'Invalid action provided.' }, { status: 400 })
  } catch (error: any) {
    console.error('Bulk products action error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to perform bulk action' },
      { status: 500 }
    )
  }
}
