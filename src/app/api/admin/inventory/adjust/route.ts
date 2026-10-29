import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { productId, type, quantity, reason } = await req.json()
    const product = await prisma.product.findUnique({ where: { id: productId } })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const previousQty = product.totalStock
    const diff = type === 'DAMAGED' ? -Math.abs(quantity) : Math.abs(quantity)
    const newQty = Math.max(0, previousQty + diff)

    // Transactional stock update + movement logging
    await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { totalStock: newQty },
      }),
      prisma.stockMovement.create({
        data: {
          productId,
          type,
          quantity: diff,
          reason,
          adminId: user.id,
          previousQty,
          newQty,
        },
      }),
    ])

    return NextResponse.json({ success: true, newStock: newQty })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
