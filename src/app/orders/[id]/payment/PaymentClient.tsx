'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  QrCode,
  Copy,
  Check,
  Upload,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Loader2,
  Trash2,
  FileText,
  X,
  AlertTriangle,
} from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import StatusBadge from '@/components/ui/StatusBadge'

interface PaymentClientProps {
  order: any
  payment: any
  settings: {
    qrImageUrl: string
    upiId: string
    payeeName: string
    paymentInstructions: string
  }
}

export default function PaymentClient({ order, payment, settings }: PaymentClientProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [utrNumber, setUtrNumber] = useState(payment?.utrNumber || '')
  const [screenshotUrl, setScreenshotUrl] = useState(payment?.paymentScreenshotUrl || '')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isEditing, setIsEditing] = useState(!payment?.utrNumber)

  // Cancel order modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [refundUpi, setRefundUpi] = useState('')
  const [cancelling, setCancelling] = useState(false)

  const isPendingVerification =
    order.status === 'PAYMENT_VERIFICATION' ||
    payment?.status === 'VERIFICATION_PENDING'
  const isRejected = payment?.status === 'REJECTED'
  const isCancelled = order.status === 'CANCELLED'

  // UPI deep link for mobile apps (Google Pay, PhonePe, Paytm, BHIM)
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(
    settings.upiId
  )}&pn=${encodeURIComponent(settings.payeeName)}&am=${
    order.totalAmount
  }&cu=INR&tn=${encodeURIComponent(`Order ${order.orderNumber}`)}`

  // Backup QR code generator URL if admin hasn't uploaded a custom QR image yet
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(
    upiDeepLink
  )}`
  const activeQrImage = settings.qrImageUrl || dynamicQrUrl

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(settings.upiId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG, PNG, WebP)')
      return
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('File size too large. Please upload an image under 8MB.')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'payment-proofs')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to upload screenshot')

      setScreenshotUrl(data.url)
    } catch (err: any) {
      setError(err.message || 'Screenshot upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    const cleanUtr = utrNumber.trim()
    if (!cleanUtr) {
      setError('Please enter the 12-digit UTR or Transaction Reference number')
      return
    }

    if (cleanUtr.length < 6) {
      setError('Please enter a valid Transaction / UTR number (usually 12 digits)')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/orders/${order.id}/payment-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utrNumber: cleanUtr,
          screenshotUrl,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit payment details')

      setSuccessMsg(data.message || 'Payment submitted successfully!')
      setIsEditing(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setCancelling(true)
    setError('')

    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: cancelReason,
          refundUpi,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to cancel order')

      setCancelModalOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Cancellation failed')
    } finally {
      setCancelling(false)
    }
  }

  if (isCancelled) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <XCircle size={36} />
        </div>
        <h1
          className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Order #{order.orderNumber} Cancelled
        </h1>
        <p className="text-sm text-[#6B6B6B] max-w-md mx-auto">
          {order.cancelReason || 'This order has been cancelled.'}
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Link
            href="/products"
            className="rounded-xl bg-[#C9A84C] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#B8963B] transition"
          >
            Explore Jewellery Collections
          </Link>
          <Link
            href="/account"
            className="rounded-xl border border-[#E8E3DC] bg-white px-6 py-2.5 text-xs font-semibold text-[#2D2D2D] hover:bg-gray-50 transition"
          >
            My Account
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
        <Link href="/" className="hover:text-[#C9A84C]">Home</Link>
        <ChevronRight size={12} />
        <Link href="/account" className="hover:text-[#C9A84C]">Orders</Link>
        <ChevronRight size={12} />
        <span className="font-semibold text-[#2D2D2D]">UPI QR Payment</span>
      </div>

      {/* Top Banner with Order Reference */}
      <div className="rounded-2xl border border-[#E8E3DC] bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-[#C9A84C]">
            Step 2 of 2 • Manual Payment Verification
          </span>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A] mt-1"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            UPI QR Payment for Order #{order.orderNumber}
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Order created on {formatDate(order.createdAt)} • Insured shipping to {order.shippingCity}, {order.shippingState}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs text-[#6B6B6B] uppercase font-semibold">Total Payable Amount</p>
          <p className="text-3xl font-extrabold text-[#C9A84C]">
            {formatPrice(order.totalAmount)}
          </p>
          <span className="inline-block mt-1">
            <StatusBadge status={order.status} type="order" />
          </span>
        </div>
      </div>

      {/* Error / Success Notifications */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
          <div>{error}</div>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-start gap-2">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
          <div>{successMsg}</div>
        </div>
      )}

      {/* Rejection Alert */}
      {isRejected && (
        <div className="rounded-xl border-2 border-red-300 bg-red-50/80 p-5 space-y-2">
          <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
            <AlertTriangle size={18} className="text-red-600 shrink-0" />
            Previous Payment Submission Could Not Be Verified
          </div>
          <p className="text-xs text-red-800">
            <strong>Reason provided by Administrator:</strong>{' '}
            {payment?.rejectionReason || 'UTR number or transaction proof could not be reconciled with bank statement.'}
          </p>
          <p className="text-xs text-red-700">
            Please check your bank app, ensure the exact amount ({formatPrice(order.totalAmount)}) was debited, and submit the corrected UTR reference number or screenshot below.
          </p>
        </div>
      )}

      {/* Verification In Progress Banner */}
      {isPendingVerification && !isEditing && (
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/40 p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Clock size={22} className="animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-blue-950">
                  Payment Details Submitted — Awaiting Verification
                </h3>
                <span className="rounded-full bg-blue-600 text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  Under Admin Review
                </span>
              </div>
              <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                Thank you! We have received your payment submission. Our accounts team will manually verify the bank credit against your transaction reference within <strong>1–4 business hours</strong>.
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/80 rounded-xl p-3.5 border border-blue-200/60">
                <div>
                  <span className="text-gray-500 font-medium block">Submitted UTR / Reference:</span>
                  <span className="font-mono font-bold text-[#1A1A1A] text-sm tracking-wider">
                    {payment?.utrNumber || utrNumber}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block">Payable Amount:</span>
                  <span className="font-bold text-[#C9A84C] text-sm">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
                {payment?.paymentScreenshotUrl && (
                  <div className="sm:col-span-2 pt-2 border-t border-gray-100 flex items-center gap-3">
                    <span className="text-gray-500">Screenshot Attached:</span>
                    <a
                      href={payment.paymentScreenshotUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      View Receipt Preview <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg border border-blue-300 bg-white px-4 py-2 text-xs font-semibold text-blue-900 hover:bg-blue-50 transition"
                >
                  Edit / Resubmit Details
                </button>
                <Link
                  href={`/orders/${order.id}`}
                  className="rounded-lg bg-[#2D2D2D] px-4 py-2 text-xs font-semibold text-white hover:bg-black transition"
                >
                  View Order Status
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left Payment Instructions & QR | Right Form & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: QR Code & UPI Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-[#E8E3DC] bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E3DC]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#C9A84C]/20 text-[#C9A84C] flex items-center justify-center font-bold">
                  <QrCode size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1A1A1A]">Official UPI QR Code</h3>
                  <p className="text-[11px] text-[#6B6B6B]">Scan with any BHIM UPI application</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5">
                ● Live & Active
              </span>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#FAF8F5] to-amber-50/30 rounded-2xl border border-[#C9A84C]/30 text-center space-y-4">
              <div className="relative p-3 bg-white rounded-2xl shadow-md border-2 border-[#C9A84C] overflow-hidden max-w-[260px] max-h-[260px]">
                <img
                  src={activeQrImage}
                  alt="KALAVIES UPI QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-[#6B6B6B]">Scan & Pay Exact Amount:</p>
                <p className="text-2xl font-black text-[#1A1A1A] tracking-tight">
                  {formatPrice(order.totalAmount)}
                </p>
                <p className="text-[11px] text-[#6B6B6B] mt-0.5 font-medium">
                  Payee: <strong className="text-[#2D2D2D]">{settings.payeeName}</strong>
                </p>
              </div>

              {/* Mobile Deep Link Button */}
              <div className="w-full max-w-sm pt-2">
                <a
                  href={upiDeepLink}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2D2D2D] py-2.5 px-4 text-xs font-bold text-white hover:bg-black transition shadow"
                >
                  <ExternalLink size={14} /> Open in UPI App (GPay / PhonePe / Paytm)
                </a>
              </div>
            </div>

            {/* UPI ID Copy Box */}
            <div className="rounded-xl border border-[#E8E3DC] bg-[#FAF8F5] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B6B6B] block">
                  Official Store UPI ID
                </span>
                <span className="font-mono font-bold text-sm text-[#1A1A1A]">
                  {settings.upiId}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#C9A84C] bg-white px-3.5 py-1.5 text-xs font-bold text-[#C9A84C] hover:bg-amber-50 transition shrink-0"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-600" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy UPI ID
                  </>
                )}
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D2D2D]">
                How to Complete Your Payment
              </h4>
              <ol className="space-y-2 text-xs text-[#6B6B6B] list-decimal list-inside">
                <li>
                  Open your preferred UPI app (<strong className="text-[#2D2D2D]">Google Pay, PhonePe, Paytm, BHIM, Cred</strong>).
                </li>
                <li>
                  Scan the QR code above or transfer to UPI ID <code className="font-mono text-[#C9A84C] bg-amber-50 px-1 py-0.5 rounded">{settings.upiId}</code>.
                </li>
                <li>
                  Confirm the payee name displays <strong>{settings.payeeName}</strong> and pay exactly <strong>{formatPrice(order.totalAmount)}</strong>.
                </li>
                <li>
                  Copy the <strong>12-digit UTR / UPI Reference Number</strong> from your payment success screen.
                </li>
                <li>
                  Enter the UTR number in the form on this page and upload the screenshot to request verification.
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Right Column: Submission Form & Order Details (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Payment Details Form */}
          <div className="rounded-2xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-5">
            <div className="pb-3 border-b border-[#E8E3DC]">
              <h3 className="font-bold text-base text-[#1A1A1A]">
                Submit Payment Verification
              </h3>
              <p className="text-xs text-[#6B6B6B]">
                Enter transaction reference to confirm your jewellery booking.
              </p>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-4">
              {/* UTR Input */}
              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  12-Digit UPI UTR / Reference ID *
                </label>
                <input
                  type="text"
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. 430129485721"
                  className="w-full rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] px-3.5 py-2.5 text-sm font-mono tracking-wider focus:border-[#C9A84C] focus:bg-white focus:outline-none"
                />
                <p className="text-[11px] text-[#6B6B6B] mt-1">
                  Found on your UPI receipt / bank SMS as "UPI Ref No" or "UTR".
                </p>
              </div>

              {/* Screenshot Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Payment Screenshot Receipt
                </label>

                {screenshotUrl ? (
                  <div className="relative rounded-xl border border-[#E8E3DC] bg-[#FAF8F5] p-3 flex items-center gap-3">
                    <img
                      src={screenshotUrl}
                      alt="Uploaded Payment Receipt"
                      className="h-16 w-16 object-cover rounded-lg border border-[#E8E3DC]"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-semibold text-emerald-800 flex items-center gap-1">
                        <Check size={14} /> Screenshot Attached
                      </p>
                      <a
                        href={screenshotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline text-[11px] mt-0.5 inline-block"
                      >
                        Preview full size →
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => setScreenshotUrl('')}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
                      title="Remove image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#E8E3DC] rounded-xl hover:border-[#C9A84C] bg-[#FAF8F5] cursor-pointer transition">
                    <Upload className="w-6 h-6 text-[#C9A84C] mb-1" />
                    <span className="text-xs font-semibold text-[#2D2D2D]">
                      {uploading ? 'Uploading...' : 'Upload Payment Screenshot'}
                    </span>
                    <span className="text-[10px] text-[#6B6B6B] mt-0.5">
                      PNG, JPG or WebP up to 8MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#C9A84C] py-3 text-sm font-bold text-white shadow hover:bg-[#B8963B] transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Submitting Details...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Submit Payment Details
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className="text-xs text-red-600 hover:text-red-700 hover:underline font-medium"
              >
                Need to cancel this order?
              </button>
            </div>
          </div>

          {/* Purchased Items Card */}
          <div className="rounded-2xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#6B6B6B]">
              Order Summary ({order.items.length} Items)
            </h4>

            <div className="divide-y divide-[#E8E3DC] max-h-60 overflow-y-auto">
              {order.items.map((item: any) => (
                <div key={item.id} className="py-2.5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] overflow-hidden flex items-center justify-center shrink-0">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-[#C9A84C]">KLV</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-semibold text-[#2D2D2D] truncate">{item.productName}</p>
                    <p className="text-[11px] text-[#6B6B6B]">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-[#2D2D2D]">
                    {formatPrice(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E8E3DC] space-y-1.5 text-xs text-[#6B6B6B]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Express Insured Shipping:</span>
                <span className="text-emerald-700 font-semibold">
                  {order.shippingCharge === 0 ? 'FREE' : formatPrice(order.shippingCharge)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-[#1A1A1A] text-sm pt-2 border-t border-[#E8E3DC]">
                <span>Total Amount:</span>
                <span className="text-[#C9A84C]">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Secure Trust Seal */}
          <div className="rounded-xl border border-dashed border-[#E8E3DC] bg-[#FAF8F5] p-3 text-center text-xs text-[#6B6B6B] flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="text-[#C9A84C]" />
            Direct Bank Transfer • Verified by KALAVIES Accounts
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E3DC]">
              <div className="flex items-center gap-2 text-red-700 font-bold text-base">
                <AlertTriangle size={20} /> Cancel Order #{order.orderNumber}
              </div>
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#6B6B6B]">
              Are you sure you want to cancel this order? Reserved jewellery items will be released back to inventory.
            </p>

            <form onSubmit={handleCancelOrder} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Reason for Cancellation
                </label>
                <textarea
                  required
                  rows={2}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Changed my mind, Ordered incorrect size, etc."
                  className="w-full rounded-lg border border-[#E8E3DC] p-2.5 text-xs focus:border-red-500 focus:outline-none"
                />
              </div>

              {order.paymentStatus === 'PAID' && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                    Your UPI ID for Refund (₹{order.totalAmount}) *
                  </label>
                  <input
                    type="text"
                    required
                    value={refundUpi}
                    onChange={(e) => setRefundUpi(e.target.value)}
                    placeholder="e.g. yourname@oksbi / yourname@okaxis"
                    className="w-full rounded-lg border border-[#E8E3DC] px-3 py-2 text-xs focus:border-[#C9A84C] focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Your refund will be sent to this UPI address after admin approval.
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="rounded-lg border border-[#E8E3DC] px-4 py-2 text-xs font-semibold text-[#6B6B6B] hover:bg-gray-50"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
