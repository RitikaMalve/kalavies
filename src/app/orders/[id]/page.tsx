import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import StoreLayout from '@/components/store/StoreLayout'
import { CheckCircle2, FileText, ArrowRight, Package, Truck, Check, Home } from 'lucide-react'
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils'
import StatusBadge from '@/components/ui/StatusBadge'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      invoices: true,
    },
  })

  if (!order) notFound()

  const steps = [
    { key: 'CONFIRMED', label: 'Order Confirmed', done: true },
    {
      key: 'PROCESSING',
      label: 'Crafting & Packing',
      done: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status),
    },
    {
      key: 'SHIPPED',
      label: 'Shipped with Courier',
      done: ['SHIPPED', 'DELIVERED'].includes(order.status),
    },
    { key: 'DELIVERED', label: 'Delivered', done: order.status === 'DELIVERED' },
  ]

  return (
    <StoreLayout>
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Success Header */}
        <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm space-y-3">
          <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Thank You! Your Order is Placed.
          </h1>
          <p className="text-sm text-[#6B6B6B]">
            Order confirmation & updates have been sent. Order Reference:{' '}
            <strong className="text-[#C9A84C] font-mono">{order.orderNumber}</strong>
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href={`/api/orders/${order.id}/invoice`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8E3DC] bg-white px-4 py-2 text-xs font-semibold text-[#2D2D2D] hover:bg-[#FAF8F5] transition"
            >
              <FileText size={15} className="text-[#C9A84C]" /> Download Tax Invoice
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#C9A84C] px-4 py-2 text-xs font-semibold text-white shadow hover:bg-[#B8963B] transition"
            >
              Continue Shopping <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Live Tracking Progress Bar */}
        <div className="rounded-2xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E3DC]">
            <h3 className="font-bold text-sm text-[#2D2D2D]">Order Fulfillment Tracker</h3>
            <StatusBadge status={order.status} type="order" />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {steps.map((st, i) => (
              <div key={st.key} className="flex flex-col items-center text-center">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition ${
                    st.done
                      ? 'bg-[#C9A84C] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {st.done ? <Check size={16} /> : i + 1}
                </div>
                <span
                  className={`text-[11px] font-semibold ${
                    st.done ? 'text-[#2D2D2D]' : 'text-[#6B6B6B]'
                  }`}
                >
                  {st.label}
                </span>
              </div>
            ))}
          </div>

          {order.trackingNumber && (
            <div className="rounded-xl bg-[#FAF8F5] p-3 text-xs text-[#2D2D2D] flex items-center justify-between">
              <span>
                Courier Tracking: <strong className="font-mono">{order.trackingNumber}</strong>
              </span>
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#C9A84C] hover:underline"
                >
                  Track Package →
                </a>
              )}
            </div>
          )}
        </div>

        {/* Order Details & Delivery info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Purchased Items */}
          <div className="rounded-2xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#2D2D2D] pb-2 border-b border-[#E8E3DC]">
              Purchased Jewellery Items
            </h3>
            <div className="divide-y divide-[#E8E3DC]">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] overflow-hidden flex items-center justify-center shrink-0">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-[#C9A84C]">KLV</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#2D2D2D] line-clamp-1">{item.productName}</p>
                    <p className="text-[10px] text-[#6B6B6B]">
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#2D2D2D]">
                    {formatPrice(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#E8E3DC] space-y-1.5 text-xs text-[#6B6B6B]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{order.shippingCharge === 0 ? 'FREE' : formatPrice(order.shippingCharge)}</span>
              </div>
              <div className="flex justify-between font-bold text-[#2D2D2D] text-sm pt-1 border-t border-[#E8E3DC]">
                <span>Total Amount:</span>
                <span className="text-[#C9A84C]">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address & Payment */}
          <div className="rounded-2xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#2D2D2D] pb-2 border-b border-[#E8E3DC]">
              Shipping & Payment Details
            </h3>

            <div className="space-y-1 text-xs">
              <span className="font-semibold text-[#6B6B6B] uppercase text-[10px]">
                Deliver To:
              </span>
              <p className="font-bold text-[#2D2D2D]">{order.shippingName}</p>
              <p className="text-[#6B6B6B]">{order.shippingAddress}</p>
              <p className="text-[#6B6B6B]">
                {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
              </p>
              <p className="text-[#6B6B6B] pt-1">Phone: {order.shippingPhone}</p>
            </div>

            <div className="pt-3 border-t border-[#E8E3DC] space-y-1 text-xs">
              <span className="font-semibold text-[#6B6B6B] uppercase text-[10px]">
                Payment Method:
              </span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2D2D2D] uppercase">{order.paymentMethod}</span>
                <StatusBadge status={order.paymentStatus} type="payment" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  )
}
