import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface StockCheckItem {
  productId: string
  variantId?: string | null
  quantity: number
}

/**
 * Validates stock availability for an array of items.
 * Used by "Buy Now", Cart page, and Checkout page prior to order submission.
 */
export async function POST(req: NextRequest) {
  try {
    const { items } = (await req.json()) as { items: StockCheckItem[] }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided for stock verification' }, { status: 400 })
    }

    const itemResults = []
    let allAvailable = true

    for (const item of items) {
      const requestedQty = Math.max(1, Number(item.quantity) || 1)
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          name: true,
          sku: true,
          totalStock: true,
          status: true,
        },
      })

      if (!product) {
        allAvailable = false
        itemResults.push({
          productId: item.productId,
          variantId: item.variantId || null,
          name: 'Unknown Jewellery Item',
          availableStock: 0,
          requestedQuantity: requestedQty,
          isAvailable: false,
          status: 'Sold Out',
          message: 'Product not found or has been removed.',
        })
        continue
      }

      let availableStock = Math.max(0, product.totalStock ?? 0)
      let variantName = null

      if (item.variantId) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
          select: { id: true, name: true, stock: true },
        })
        if (variant) {
          variantName = variant.name
          availableStock = Math.min(availableStock, Math.max(0, variant.stock ?? 0))
        }
      }

      const isAvailable = availableStock >= requestedQty && product.status !== 'ARCHIVED'
      if (!isAvailable) {
        allAvailable = false
      }

      const stockStatus =
        availableStock <= 0
          ? 'Sold Out'
          : availableStock < requestedQty
          ? 'Insufficient Stock'
          : 'In Stock'

      itemResults.push({
        productId: product.id,
        variantId: item.variantId || null,
        name: product.name,
        variantName,
        availableStock,
        requestedQuantity: requestedQty,
        isAvailable,
        status: stockStatus,
        message:
          availableStock <= 0
            ? `"${product.name}" is currently Sold Out.`
            : availableStock < requestedQty
            ? `Only ${availableStock} unit(s) of "${product.name}" available in stock.`
            : 'In Stock',
      })
    }

    return NextResponse.json({
      success: true,
      allAvailable,
      items: itemResults,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Stock check failed' }, { status: 500 })
  }
}
