import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function checkSkuAvailability(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const rawSku = searchParams.get('sku') || ''
    const excludeId = searchParams.get('excludeId') || undefined
    const sku = rawSku.trim().toUpperCase()

    if (!sku) {
      return NextResponse.json({ available: true, sku: '' })
    }

    // Check products table
    const existingProduct = await prisma.product.findFirst({
      where: {
        sku: { equals: sku, mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true, name: true, sku: true },
    })

    if (existingProduct) {
      // Suggest next available variant suffix
      let suggestedSku = `${sku}-02`
      for (let i = 2; i <= 20; i++) {
        const testSku = `${sku.replace(/-\d+$/, '')}-${String(i).padStart(2, '0')}`
        const taken = await prisma.product.findFirst({
          where: { sku: { equals: testSku, mode: 'insensitive' } },
        })
        if (!taken) {
          suggestedSku = testSku
          break
        }
      }

      return NextResponse.json({
        available: false,
        sku,
        message: `SKU "${sku}" is already assigned to "${existingProduct.name}"`,
        existingProduct: existingProduct.name,
        suggestedSku,
      })
    }

    // Check variants table
    const existingVariant = await prisma.productVariant.findFirst({
      where: {
        sku: { equals: sku, mode: 'insensitive' },
      },
      select: { id: true, name: true, sku: true },
    })

    if (existingVariant) {
      return NextResponse.json({
        available: false,
        sku,
        message: `SKU "${sku}" is already assigned to variant "${existingVariant.name}"`,
        existingProduct: existingVariant.name,
      })
    }

    return NextResponse.json({
      available: true,
      sku,
      message: `SKU "${sku}" is available`,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to check SKU' },
      { status: 500 }
    )
  }
}
