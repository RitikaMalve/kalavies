import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import StoreLayout from '@/components/store/StoreLayout'
import {
  CheckCircle2,
  FileText,
  ArrowRight,
  Package,
  Truck,
  Check,
  QrCode,
  Clock,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from 'lucide-react'
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils'
import StatusBadge from '@/components/ui/StatusBadge'
import CustomerOrderActions from './CustomerOrderActions'

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
      payments: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })

  if (!order) notFound()

  const latestPayment = order.payments[0] || null
  const isAwaitingPayment = order.status === 'PENDING_PAYMENT'
  const isUnderReview = order.status === 'PAYMENT_VERIFICATION' || latestPayment?.status === 'VERIFICATION_PENDING'
  const isPaymentRejected = latestPayment?.status === 'REJECTED'
  const isCancelled = order.status === 'CANCELLED'

  const steps = [
    {
      key: 'PAYMENT',
      label: isAwaitingPayment
        ? 'Awaiting Payment'
        : isUnderReview
        ? 'Payment Verification'
        : 'Payment Verified',
      done: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status),
      current: ['PENDING_PAYMENT', 'PAYMENT_VERIFICATION'].includes(order.status),
    },
    {
      key: 'CONFIRMED',
      label: 'Order Confirmed',
      done: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status),
      current: order.status === 'CONFIRMED',
    },
    {
      key: 'PROCESSING',
      label: 'Crafting & Packing',
      done: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status),
      current: order.status === 'PROCESSING',
    },
    {
      key: 'SHIPPED',
      label: 'Dispatched Courier',
      done: ['SHIPPED', 'DELIVERED'].includes(order.status),
      current: order.status === 'SHIPPED',
    },
    {
      key: 'DELIVERED',
      label: 'Delivered',
      done: order.status === 'DELIVERED',
      current: order.status === 'DELIVERED',
    },
  ]

  return (
    <StoreLayout>
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Payment Action Required Alert if payment is pending */}
        {isAwaitingPayment && (
          <div className="rounded-2xl border-2 border-[#C9A84C] bg-gradient-to-r from-amber-50 to-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C9A84C] text-white flex items-center justify-center shrink-0">
                <QrCode size={22} />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1A1A1A]">
                  Action Required: Complete UPI Payment
                </h3>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  Scan the KALAVIES UPI QR code, pay {formatPrice(order.totalAmount)}, and enter your 12-digit UTR reference number to confirm this order.
                </p>
              </div>
            </div>

            <Link
              href={`/orders/${order.id}/payment`}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#C9A84C] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#B8963B] transition shadow shrink-0"
            >
              Scan UPI QR & Pay <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Verification in progress alert */}
        {isUnderReview && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Clock size={22} className="animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-base text-blue-950">
                  Payment Submitted (UTR: {latestPayment?.utrNumber || 'Submitted'})
                </h3>
                <p className="text-xs text-blue-800 mt-0.5">
                  Our accounts team is manually reconciling the bank credit. Your order will be confirmed and Tax Invoice generated once verified.
                </p>
              </div>
            </div>

            <Link
              href={`/orders/${order.id}/payment`}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-300 bg-white px-4 py-2 text-xs font-semibold text-blue-900 hover:bg-blue-50 transition shrink-0"
            >
              View Payment Receipt <ExternalLink size={12} />
            </Link>
          </div>
        )}

        {/* Rejection alert */}
        {isPaymentRejected && (
          <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="font-bold text-base text-red-950">
                  Payment Verification Notice
                </h3>
                <p className="text-xs text-red-800 mt-0.5">
                  {latestPayment?.rejectionReason || 'UTR number or payment proof could not be verified in bank records.'}
                </p>
              </div>
            </div>

            <Link
              href={`/orders/${order.id}/payment`}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition shrink-0 shadow"
            >
              Resubmit Payment Details <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Cancelled notice */}
        {isCancelled && (
          <div className="rounded-2xl border border-red-200 bg-red-50/70 p-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <XCircle size={24} />
            </div>
            <h3 className="font-bold text-base text-red-950">This Order Has Been Cancelled</h3>
            <p className="text-xs text-red-800 max-w-md mx-auto">
              {order.cancelReason || 'Order was cancelled and inventory stock has been restored.'}
            </p>
            {order.paymentStatus === 'REFUND_PENDING' && (
              <span className="inline-block rounded-full bg-orange-100 text-orange-900 px-3 py-1 text-xs font-bold">
                Refund Pending Bank Credit (₹{order.totalAmount})
              </span>
            )}
            {order.paymentStatus === 'REFUNDED' && (
              <span className="inline-block rounded-full bg-green-100 text-green-900 px-3 py-1 text-xs font-bold">
                Refund Completed • Bank UTR: {latestPayment?.refundUtr}
              </span>
            )}
          </div>
        )}

        {/* Order Header */}
        {!isCancelled && (
          <div className="rounded-2xl border border-[#E8E3DC] bg-white p-8 text-center shadow-sm space-y-3">
            <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <h1
              className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {order.status === 'CONFIRMED'
                ? 'Thank You! Your Order is Confirmed.'
                : 'Order Placed Successfully'}
            </h1>
            <p className="text-sm text-[#6B6B6B]">
              Order Reference:{' '}
              <strong className="text-[#C9A84C] font-mono">{order.orderNumber}</strong>
            </p>
            <div className="pt-2 flex justify-center gap-3">
              {order.invoices.length > 0 && (
                <Link
                  href={`/api/orders/${order.id}/invoice`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8E3DC] bg-white px-4 py-2 text-xs font-semibold text-[#2D2D2D] hover:bg-[#FAF8F5] transition"
                >
                  <FileText size={15} className="text-[#C9A84C]" /> Download Tax Invoice
                </Link>
              )}
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#C9A84C] px-4 py-2 text-xs font-semibold text-white shadow hover:bg-[#B8963B] transition"
              >
                Continue Shopping <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* Live Tracking Progress Bar */}
        {!isCancelled && (
          <div className="rounded-2xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E3DC]">
              <h3 className="font-bold text-sm text-[#2D2D2D]">Order Fulfillment Tracker</h3>
              <div className="flex items-center gap-2">
                <StatusBadge status={order.paymentStatus} type="payment" />
                <StatusBadge status={order.status} type="order" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {steps.map((st, i) => (
                <div key={st.key} className="flex flex-col items-center text-center">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition ${
                      st.done
                        ? 'bg-[#C9A84C] text-white shadow-sm'
                        : st.current
                        ? 'bg-amber-100 text-[#C9A84C] border-2 border-[#C9A84C]'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {st.done ? <Check size={16} /> : i + 1}
                  </div>
                  <span
                    className={`text-[11px] font-semibold ${
                      st.done || st.current ? 'text-[#2D2D2D]' : 'text-[#6B6B6B]'
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
        )}

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
                <span>Insured Express Shipping:</span>
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
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E3DC]">
              <h3 className="font-bold text-sm text-[#2D2D2D]">
                Shipping & Payment Details
              </h3>
              <CustomerOrderActions
                orderId={order.id}
                orderNumber={order.orderNumber}
                totalAmount={order.totalAmount}
                status={order.status}
                paymentStatus={order.paymentStatus}
              />
            </div>

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
                <span className="font-bold text-[#2D2D2D] uppercase">
                  UPI QR Transfer (Prepaid)
                </span>
                <StatusBadge status={order.paymentStatus} type="payment" />
              </div>
              {latestPayment?.utrNumber && (
                <p className="text-[11px] text-[#6B6B6B] pt-1">
                  Submitted UTR: <strong className="font-mono text-[#2D2D2D]">{latestPayment.utrNumber}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  )
}
