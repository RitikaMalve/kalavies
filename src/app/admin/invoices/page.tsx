import { prisma } from '@/lib/prisma'
import InvoicesManager from '@/components/admin/InvoicesManager'

export const dynamic = 'force-dynamic'

export default async function AdminInvoicesPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      invoices: {
        include: {
          items: true,
          orderAddress: true,
        },
      },
      items: true,
      shipments: true,
    },
  })

  const auditLogs = await prisma.invoiceAuditLog.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
  })

  // Serialize dates for Client Component
  const serializedOrders = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    totalAmount: o.totalAmount,
    subtotal: o.subtotal,
    shippingName: o.shippingName,
    shippingPhone: o.shippingPhone,
    shippingCity: o.shippingCity,
    shippingAddress: o.shippingAddress,
    createdAt: o.createdAt.toISOString(),
    user: o.user,
    invoices: o.invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      type: inv.type,
      status: inv.status,
      total: inv.total,
      issuedAt: inv.issuedAt.toISOString(),
      orderAddress: inv.orderAddress
        ? {
            recipientName: inv.orderAddress.recipientName,
            city: inv.orderAddress.city,
            label: inv.orderAddress.label,
          }
        : null,
    })),
    shipments: o.shipments.map((shp) => ({
      id: shp.id,
      shipmentNumber: shp.shipmentNumber,
      status: shp.status,
    })),
    items: o.items.map((it) => ({
      id: it.id,
      productName: it.productName,
      quantity: it.quantity,
    })),
  }))

  const serializedLogs = auditLogs.map((log) => ({
    id: log.id,
    invoiceId: log.invoiceId,
    action: log.action,
    performedBy: log.performedBy,
    reason: log.reason,
    createdAt: log.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2D2D2D]">
            Tax Invoices & Multi-Address Billing
          </h1>
          <p className="text-sm text-[#6B6B6B]">
            Generate bulk PDF invoices, export downloadable ZIP archives, and manage multi-destination split shipments.
          </p>
        </div>
      </div>

      <InvoicesManager initialOrders={serializedOrders} initialAuditLogs={serializedLogs} />
    </div>
  )
}
