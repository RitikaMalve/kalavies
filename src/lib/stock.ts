import { PrismaClient } from '@prisma/client'

/**
 * Restores product inventory stock for an order when it is cancelled, rejected, or failed.
 * Safe to call inside an existing transaction or standalone.
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

  // Check if stock was already marked as returned in audit logs to prevent double restoration
  const existingRestoration = await prismaClient.stockMovement.findFirst({
    where: {
      reason: { contains: order.orderNumber },
      type: 'RETURN',
    },
  })

  if (existingRestoration) {
    return { success: true, message: 'Stock already previously restored' }
  }

  for (const item of order.items) {
    const product = await prismaClient.product.findUnique({
      where: { id: item.productId },
    })

    if (product) {
      await prismaClient.product.update({
        where: { id: item.productId },
        data: {
          totalStock: { increment: item.quantity },
          soldCount: { decrement: item.quantity },
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
          // Variant might not exist, ignore
        }
      }

      await prismaClient.stockMovement.create({
        data: {
          productId: item.productId,
          variantId: item.variantId || null,
          type: 'RETURN',
          quantity: item.quantity,
          reason: `Order ${order.orderNumber} Stock Restored: ${reason}`,
          adminId: userId || null,
          previousQty: product.totalStock,
          newQty: product.totalStock + item.quantity,
        },
      })
    }
  }

  return { success: true, message: `Stock restored for order ${order.orderNumber}` }
}
