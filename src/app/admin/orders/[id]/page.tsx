import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Printer, Truck, ShieldAlert } from 'lucide-react'
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils'
import StatusBadge from '@/components/ui/StatusBadge'
import OrderStatusUpdater from '@/components/admin/OrderStatusUpdater'
import MultiAddressSplitManager from '@/components/admin/MultiAddressSplitManager'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: {
        include: {
          product: { select: { slug: true, images: { take: 1 } } },
        },
      },
      invoices: true,
      payments: true,
      orderAddresses: true,
      shipments: {
        include: {
          orderAddress: true,
          items: { include: { orderItem: true } },
          invoices: true,
        },
      },
    },
  })

  if (!order) notFound()

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="rounded-lg border border-[#E8E3DC] bg-white p-2 text-[#6B6B6B] hover:bg-[#FAF8F5] transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#2D2D2D]">
                Order {order.orderNumber}
              </h1>
              <StatusBadge status={order.status} type="order" />
            </div>
            <p className="text-xs text-[#6B6B6B]">
              Placed on {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/api/orders/${order.id}/invoice`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg border border-[#E8E3DC] bg-white px-4 py-2 text-sm font-semibold text-[#2D2D2D] shadow-sm hover:bg-[#FAF8F5] transition"
          >
            <FileText size={16} className="text-[#C9A84C]" /> Download Invoice
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Line items and Order summary */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <div className="rounded-xl border border-[#E8E3DC] bg-white shadow-sm overflow-hidden">
            <div className="border-b border-[#E8E3DC] bg-[#FAF8F5] px-6 py-3.5 text-xs font-semibold uppercase text-[#6B6B6B]">
              Purchased Jewellery Items ({order.items.length})
            </div>

            <div className="divide-y divide-[#E8E3DC]">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-[#FAF8F5]/50 transition">
                  <div className="h-16 w-16 shrink-0 rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] overflow-hidden flex items-center justify-center">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-[#C9A84C]">KLV</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-[#2D2D2D]">{item.productName}</h4>
                    {item.variantName && (
                      <p className="text-xs text-[#6B6B6B]">Variant: {item.variantName}</p>
                    )}
                    <p className="text-xs text-[#6B6B6B]">SKU: {item.sku}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-[#6B6B6B]">
                      {item.quantity} × {formatPrice(item.price)}
                    </div>
                    <div className="font-bold text-[#2D2D2D]">
                      {formatPrice(item.totalPrice)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="border-t border-[#E8E3DC] bg-[#FAF8F5]/60 p-6 space-y-2">
              <div className="flex justify-between text-sm text-[#6B6B6B]">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>- {formatPrice(order.couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-[#6B6B6B]">
                <span>Shipping Charges</span>
                <span>{order.shippingCharge === 0 ? 'FREE' : formatPrice(order.shippingCharge)}</span>
              </div>
              {order.taxAmount > 0 && (
                <div className="flex justify-between text-sm text-[#6B6B6B]">
                  <span>Applicable GST / Taxes</span>
                  <span>{formatPrice(order.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-[#E8E3DC] pt-3 text-base font-bold text-[#2D2D2D]">
                <span>Total Amount Payable</span>
                <span className="text-[#C9A84C]">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Shipment Tracking Details */}
          <div className="rounded-xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#2D2D2D]">
              <Truck size={20} className="text-[#C9A84C]" />
              <h3 className="font-semibold">Courier & Shipment Information</h3>
            </div>
            {order.trackingNumber ? (
              <div className="space-y-1 text-sm text-[#2D2D2D]">
                <div>
                  Tracking Number: <strong className="font-mono">{order.trackingNumber}</strong>
                </div>
                {order.trackingUrl && (
                  <div>
                    Tracking URL:{' '}
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#C9A84C] underline"
                    >
                      {order.trackingUrl}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#6B6B6B]">
                No tracking details recorded yet. You can update tracking info using the status manager.
              </p>
            )}
          </div>

          {/* Mode B: Multi-Address Deliveries and Split Invoices */}
          <MultiAddressSplitManager
            orderId={order.id}
            orderNumber={order.orderNumber}
            items={order.items.map((i) => ({
              id: i.id,
              productName: i.productName,
              sku: i.sku,
              quantity: i.quantity,
              price: i.price,
            }))}
            existingShipments={order.shipments as any}
          />
        </div>

        {/* Right Column: Status Manager & Customer Details */}
        <div className="space-y-6">
          {/* Order Status & Payment Update Tool */}
          <OrderStatusUpdater
            orderId={order.id}
            initialStatus={order.status}
            initialPaymentStatus={order.paymentStatus}
            initialTrackingNumber={order.trackingNumber || ''}
            initialTrackingUrl={order.trackingUrl || ''}
          />

          {/* Customer & Address Details */}
          <div className="rounded-xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-[#2D2D2D]">Delivery Information</h3>

            <div className="text-sm space-y-1">
              <p className="font-bold text-[#2D2D2D]">
                {order.shippingName || (order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest')}
              </p>
              <p className="text-[#6B6B6B]">{order.shippingAddress || 'No street address'}</p>
              <p className="text-[#6B6B6B]">
                {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
              </p>
              <p className="pt-2 text-xs font-semibold text-[#2D2D2D]">
                Phone: <span className="font-normal text-[#6B6B6B]">{order.shippingPhone || order.user?.phone || 'N/A'}</span>
              </p>
              <p className="text-xs font-semibold text-[#2D2D2D]">
                Email: <span className="font-normal text-[#6B6B6B]">{order.user?.email || 'N/A'}</span>
              </p>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="rounded-xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-3">
            <h3 className="font-semibold text-[#2D2D2D]">Payment Method</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#2D2D2D] uppercase">{order.paymentMethod}</span>
              <StatusBadge status={order.paymentStatus} type="payment" />
            </div>
            {order.razorpayPaymentId && (
              <p className="text-xs text-[#6B6B6B] font-mono">
                Razorpay ID: {order.razorpayPaymentId}
              </p>
            )}
          </div>

          {/* Mode B: Multi-Address Deliveries and Split Invoices */}
          <MultiAddressSplitManager
            orderId={order.id}
            orderNumber={order.orderNumber}
            items={order.items.map((i) => ({
              id: i.id,
              productName: i.productName,
              sku: i.sku,
              quantity: i.quantity,
              price: i.price,
            }))}
            existingShipments={order.shipments as any}
          />
        </div>
      </div>
    </div>
  )
}
