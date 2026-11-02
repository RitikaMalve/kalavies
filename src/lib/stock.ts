import { PrismaClient } from '@prisma/client'

/**
 * Restores product inventory stock for an order when it is cancelled, rejected, or payment fails.
 * Fully IDEMPOTENT: Will only restore stock ONCE per order, preventing double restorations.
 * Safe to call inside an existing Prisma transaction or standalone.
 */
export async function restoreOrderInventoryStock(
  prismaClient: any,
  orderId: string,
  reason: string,
  userId?: string | null
) {
  const order = await prismaClient.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  if (!order || !order.items || order.items.length === 0) {
    return { success: false, message: 'Order or items not found' }
  }

  // Idempotency check: verify if stock was already returned for this order
  const existingRestoration = await prismaClient.stockMovement.findFirst({
    where: {
      OR: [
        { reference: order.id, type: 'RETURN' },
        { reference: order.orderNumber, type: 'RETURN' },
        { reason: { contains: order.orderNumber }, type: 'RETURN' },
      ],
    },
  })

  if (existingRestoration) {
    return {
      success: true,
      alreadyRestored: true,
      message: `Stock for order ${order.orderNumber} was already previously restored`,
    }
  }

  let restoredCount = 0

  for (const item of order.items) {
    const product = await prismaClient.product.findUnique({
      where: { id: item.productId },
    })

    if (product) {
      const currentStock = product.totalStock ?? 0
      const currentSoldCount = product.soldCount ?? 0
      const safeNewSoldCount = Math.max(0, currentSoldCount - item.quantity)

      // Restore product stock and adjust sold count
      await prismaClient.product.update({
        where: { id: item.productId },
        data: {
          totalStock: { increment: item.quantity },
          soldCount: safeNewSoldCount,
        },
      })

      // If variant exists, also restore variant stock
      if (item.variantId) {
        try {
          await prismaClient.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: { increment: item.quantity },
            },
          })
        } catch (e) {
          // Variant might have been deleted, ignore
        }
      }

      // Record audit stock movement log with explicit order reference for idempotency
      await prismaClient.stockMovement.create({
        data: {
          productId: item.productId,
          variantId: item.variantId || null,
          type: 'RETURN',
          quantity: item.quantity,
          reference: order.id,
          reason: `Order ${order.orderNumber} Stock Restored: ${reason}`,
          adminId: userId || null,
          previousQty: currentStock,
          newQty: currentStock + item.quantity,
        },
      })

      restoredCount += item.quantity
    }
  }

  return {
    success: true,
    alreadyRestored: false,
    restoredCount,
    message: `Restored ${restoredCount} item(s) stock for order ${order.orderNumber}`,
  }
}
