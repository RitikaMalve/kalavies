'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  FileText,
  RotateCcw,
  Eye,
  X,
  Loader2,
  ShieldCheck,
  QrCode,
  DollarSign,
  ArrowRight,
} from 'lucide-react'
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils'
import StatusBadge from '@/components/ui/StatusBadge'

interface Props {
  payments: any[]
  pendingCount: number
  refundPendingCount: number
  currentTab: string
  initialSearch: string
}

export default function PaymentsManagerClient({
  payments,
  pendingCount,
  refundPendingCount,
  currentTab,
  initialSearch,
}: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch)
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null)
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null)

  // Action modals
  const [verifyModalPayment, setVerifyModalPayment] = useState<any | null>(null)
  const [rejectModalPayment, setRejectModalPayment] = useState<any | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [refundModalPayment, setRefundModalPayment] = useState<any | null>(null)
  const [refundUtr, setRefundUtr] = useState('')

  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const handleCopy = (utr: string) => {
    navigator.clipboard.writeText(utr)
    setCopiedUtr(utr)
    setTimeout(() => setCopiedUtr(null), 2000)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const url = new URL(window.location.href)
    if (search.trim()) {
      url.searchParams.set('search', search.trim())
    } else {
      url.searchParams.delete('search')
    }
    router.push(url.toString())
  }

  const handleTabChange = (tab: string) => {
    const url = new URL(window.location.href)
    if (tab === 'ALL') {
      url.searchParams.delete('tab')
    } else {
      url.searchParams.set('tab', tab)
    }
    router.push(url.toString())
  }

  const handleVerify = async (paymentId: string) => {
    setLoading(true)
    setError('')
    setMsg('')

    try {
      const res = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'VERIFY' }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to verify payment')

      setMsg(data.message || 'Payment verified and order confirmed!')
      setVerifyModalPayment(null)
      setSelectedPayment(null)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (paymentId: string) => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejecting the payment')
      return
    }

    setLoading(true)
    setError('')
    setMsg('')

    try {
      const res = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REJECT',
          rejectionReason,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to reject payment')

      setMsg('Payment rejected and customer notified.')
      setRejectModalPayment(null)
      setSelectedPayment(null)
      setRejectionReason('')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Rejection failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRefund = async (paymentId: string) => {
    if (!refundUtr.trim()) {
      setError('Please provide the Bank Refund UTR / Reference number')
      return
    }

    setLoading(true)
    setError('')
    setMsg('')

    try {
      const res = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REFUND',
          refundUtr,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to complete refund')

      setMsg('Refund recorded and customer notified.')
      setRefundModalPayment(null)
      setSelectedPayment(null)
      setRefundUtr('')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Refund processing failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2D2D2D]">
            UPI Payment Verification & Audits
          </h1>
          <p className="text-sm text-[#6B6B6B]">
            Reconcile customer bank credits, verify UTR transaction references, confirm orders, and manage refunds.
          </p>
        </div>

        <Link
          href="/admin/settings?tab=payment"
          className="inline-flex items-center gap-2 rounded-xl border border-[#C9A84C] bg-white px-4 py-2 text-xs font-bold text-[#C9A84C] hover:bg-amber-50 transition shadow-sm"
        >
          <QrCode size={16} /> Configure UPI QR Code
        </Link>
      </div>

      {/* Messages */}
      {msg && (
        <div className="rounded-xl bg-green-50 p-4 text-xs font-semibold text-green-800 border border-green-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-600" /> {msg}
          </div>
          <button onClick={() => setMsg('')} className="text-green-600 hover:text-green-900">
            <X size={14} />
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-800 border border-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-600" /> {error}
          </div>
          <button onClick={() => setError('')} className="text-red-600 hover:text-red-900">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Quick Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => handleTabChange('VERIFICATION_PENDING')}
          className={`rounded-xl border p-4 text-left transition ${
            currentTab === 'VERIFICATION_PENDING'
              ? 'border-blue-500 bg-blue-50/70 shadow-sm ring-1 ring-blue-500'
              : 'border-[#E8E3DC] bg-white hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
            <span>Pending Review</span>
            <Clock size={16} className="text-blue-600 animate-pulse" />
          </div>
          <p className="mt-2 text-2xl font-black text-blue-900">{pendingCount}</p>
          <p className="text-[11px] text-blue-700 mt-0.5">Awaiting Bank Verification</p>
        </button>

        <button
          onClick={() => handleTabChange('PAID')}
          className={`rounded-xl border p-4 text-left transition ${
            currentTab === 'PAID'
              ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500'
              : 'border-[#E8E3DC] bg-white hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
            <span>Verified & Confirmed</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-900">
            {payments.filter((p) => p.status === 'PAID').length}
          </p>
          <p className="text-[11px] text-emerald-700 mt-0.5">Credited in Bank</p>
        </button>

        <button
          onClick={() => handleTabChange('REJECTED')}
          className={`rounded-xl border p-4 text-left transition ${
            currentTab === 'REJECTED'
              ? 'border-red-500 bg-red-50/70 shadow-sm ring-1 ring-red-500'
              : 'border-[#E8E3DC] bg-white hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-red-900">
            <span>Rejected Payments</span>
            <XCircle size={16} className="text-red-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-red-900">
            {payments.filter((p) => p.status === 'REJECTED').length}
          </p>
          <p className="text-[11px] text-red-700 mt-0.5">Uncredited or Mismatched</p>
        </button>

        <button
          onClick={() => handleTabChange('REFUNDS')}
          className={`rounded-xl border p-4 text-left transition ${
            currentTab === 'REFUNDS'
              ? 'border-orange-500 bg-orange-50/70 shadow-sm ring-1 ring-orange-500'
              : 'border-[#E8E3DC] bg-white hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-orange-900">
            <span>Refunds</span>
            <RotateCcw size={16} className="text-orange-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-orange-900">{refundPendingCount}</p>
          <p className="text-[11px] text-orange-700 mt-0.5">
            {refundPendingCount > 0 ? 'Pending Bank Refund' : 'All Settled'}
          </p>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="rounded-2xl border border-[#E8E3DC] bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {[
            { key: 'ALL', label: 'All Payments' },
            { key: 'VERIFICATION_PENDING', label: `Pending (${pendingCount})` },
            { key: 'PAID', label: 'Verified (PAID)' },
            { key: 'REJECTED', label: 'Rejected' },
            { key: 'REFUNDS', label: `Refunds (${refundPendingCount})` },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => handleTabChange(t.key)}
              className={`rounded-lg px-3 py-1.5 transition ${
                currentTab === t.key || (t.key === 'ALL' && !currentTab)
                  ? 'bg-[#2D2D2D] text-white'
                  : 'bg-[#FAF8F5] text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order #, UTR, or Customer..."
            className="w-full rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] py-2 pl-9 pr-3 text-xs focus:border-[#C9A84C] focus:bg-white focus:outline-none"
          />
          <Search className="absolute left-3 top-2.5 text-[#6B6B6B]" size={15} />
        </form>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#E8E3DC] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="border-b border-[#E8E3DC] bg-[#FAF8F5] font-bold uppercase text-[#6B6B6B] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Order Ref</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Amount</th>
                <th className="px-4 py-3.5">Submitted UTR</th>
                <th className="px-4 py-3.5">Screenshot</th>
                <th className="px-4 py-3.5">Payment Status</th>
                <th className="px-4 py-3.5">Order Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3DC]">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-[#6B6B6B]">
                    No payment records match the selected filter.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const { order } = p
                  return (
                    <tr key={p.id} className="hover:bg-[#FAF8F5]/60 transition">
                      {/* Order Number */}
                      <td className="px-5 py-4 font-mono font-bold text-[#2D2D2D]">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-[#C9A84C] hover:underline flex items-center gap-1"
                        >
                          {order.orderNumber}
                        </Link>
                        <span className="text-[10px] text-gray-500 font-normal block mt-0.5">
                          {formatDateTime(p.createdAt)}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[#2D2D2D]">
                          {order.shippingName || `${order.user?.firstName} ${order.user?.lastName || ''}`}
                        </p>
                        <p className="text-[11px] text-[#6B6B6B]">
                          {order.shippingPhone || order.user?.phone || order.user?.email}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-4 font-bold text-[#1A1A1A]">
                        {formatPrice(p.amount)}
                      </td>

                      {/* UTR */}
                      <td className="px-4 py-4">
                        {p.utrNumber ? (
                          <div className="flex items-center gap-1.5 font-mono font-bold text-[#1A1A1A] tracking-wider bg-amber-50/80 border border-[#C9A84C]/30 px-2 py-1 rounded-md inline-flex">
                            <span>{p.utrNumber}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(p.utrNumber)}
                              className="text-gray-400 hover:text-gray-700"
                              title="Copy UTR"
                            >
                              {copiedUtr === p.utrNumber ? (
                                <Check size={12} className="text-green-600" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Not submitted</span>
                        )}
                      </td>

                      {/* Screenshot */}
                      <td className="px-4 py-4">
                        {p.paymentScreenshotUrl ? (
                          <button
                            type="button"
                            onClick={() => setSelectedPayment(p)}
                            className="group relative h-10 w-10 rounded-lg border border-[#E8E3DC] overflow-hidden bg-gray-50 flex items-center justify-center shrink-0"
                            title="Click to view screenshot"
                          >
                            <img
                              src={p.paymentScreenshotUrl}
                              alt="Receipt"
                              className="h-full w-full object-cover group-hover:scale-110 transition"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                              <Eye size={12} />
                            </div>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-[11px]">No image</span>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="px-4 py-4">
                        <StatusBadge status={p.status} type="payment" />
                        {p.rejectionReason && (
                          <p className="text-[10px] text-red-700 mt-1 line-clamp-1" title={p.rejectionReason}>
                            Reason: {p.rejectionReason}
                          </p>
                        )}
                        {p.refundUtr && (
                          <p className="text-[10px] text-gray-600 mt-1 font-mono">
                            Refund Ref: {p.refundUtr}
                          </p>
                        )}
                      </td>

                      {/* Order Status */}
                      <td className="px-4 py-4">
                        <StatusBadge status={order.status} type="order" />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right space-x-2">
                        {p.status === 'VERIFICATION_PENDING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => setVerifyModalPayment(p)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
                            >
                              <CheckCircle2 size={13} /> Verify & Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRejectModalPayment(p)
                                setRejectionReason('')
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                            >
                              <XCircle size={13} /> Reject
                            </button>
                          </>
                        )}

                        {p.status === 'REFUND_PENDING' && (
                          <button
                            type="button"
                            onClick={() => {
                              setRefundModalPayment(p)
                              setRefundUtr('')
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-700 transition shadow-sm"
                          >
                            <RotateCcw size={13} /> Process Refund
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedPayment(p)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#E8E3DC] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#2D2D2D] hover:bg-gray-50 transition"
                        >
                          <Eye size={13} /> Details
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details / Inspection Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E3DC]">
              <div>
                <h3 className="font-bold text-lg text-[#2D2D2D]">
                  Payment Audit for Order #{selectedPayment.order.orderNumber}
                </h3>
                <p className="text-xs text-[#6B6B6B]">
                  Placed on {formatDateTime(selectedPayment.order.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl bg-[#FAF8F5] p-3.5 space-y-1.5 border border-[#E8E3DC]">
                <span className="font-bold uppercase text-[10px] text-gray-500 block">
                  Customer & Shipping
                </span>
                <p className="font-bold text-[#2D2D2D] text-sm">
                  {selectedPayment.order.shippingName}
                </p>
                <p className="text-[#6B6B6B]">{selectedPayment.order.shippingPhone}</p>
                <p className="text-[#6B6B6B]">{selectedPayment.order.shippingAddress}</p>
                <p className="text-[#6B6B6B]">
                  {selectedPayment.order.shippingCity}, {selectedPayment.order.shippingState} - {selectedPayment.order.shippingPincode}
                </p>
              </div>

              <div className="rounded-xl bg-[#FAF8F5] p-3.5 space-y-2 border border-[#E8E3DC]">
                <span className="font-bold uppercase text-[10px] text-gray-500 block">
                  Payment Verification Metrics
                </span>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payable Amount:</span>
                  <span className="font-bold text-[#C9A84C] text-sm">
                    {formatPrice(selectedPayment.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Submitted UTR:</span>
                  <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 rounded border border-[#E8E3DC]">
                    {selectedPayment.utrNumber || 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Status:</span>
                  <StatusBadge status={selectedPayment.status} type="payment" />
                </div>
                {selectedPayment.customerRefundUpi && (
                  <div className="flex justify-between pt-1 border-t border-gray-200">
                    <span className="text-orange-700 font-semibold">Refund UPI:</span>
                    <span className="font-mono font-bold text-orange-900">
                      {selectedPayment.customerRefundUpi}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Screenshot Preview */}
            {selectedPayment.paymentScreenshotUrl && (
              <div className="space-y-2">
                <span className="font-bold uppercase text-xs text-[#2D2D2D] block">
                  Customer Uploaded Payment Receipt:
                </span>
                <div className="p-2 rounded-xl border border-[#E8E3DC] bg-[#FAF8F5] flex justify-center max-h-80 overflow-hidden">
                  <img
                    src={selectedPayment.paymentScreenshotUrl}
                    alt="Customer Payment Receipt"
                    className="max-h-72 object-contain rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="space-y-2">
              <span className="font-bold uppercase text-xs text-[#2D2D2D] block">
                Ordered Items ({selectedPayment.order.items.length})
              </span>
              <div className="divide-y divide-[#E8E3DC] rounded-xl border border-[#E8E3DC] bg-white p-3 max-h-48 overflow-y-auto">
                {selectedPayment.order.items.map((it: any) => (
                  <div key={it.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-[#2D2D2D]">{it.productName}</p>
                      <p className="text-[11px] text-gray-500">Qty: {it.quantity} × {formatPrice(it.price)}</p>
                    </div>
                    <span className="font-bold text-[#2D2D2D]">{formatPrice(it.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions inside modal */}
            <div className="pt-3 border-t border-[#E8E3DC] flex items-center justify-between gap-3">
              <Link
                href={`/admin/orders/${selectedPayment.order.id}`}
                className="text-xs text-[#C9A84C] hover:underline font-semibold flex items-center gap-1"
              >
                Go to Order Management →
              </Link>

              <div className="flex items-center gap-2">
                {selectedPayment.status === 'VERIFICATION_PENDING' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectModalPayment(selectedPayment)
                        setRejectionReason('')
                      }}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerifyModalPayment(selectedPayment)}
                      className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                    >
                      Verify Bank Credit & Confirm Order
                    </button>
                  </>
                )}
                {selectedPayment.status === 'REFUND_PENDING' && (
                  <button
                    type="button"
                    onClick={() => {
                      setRefundModalPayment(selectedPayment)
                      setRefundUtr('')
                    }}
                    className="rounded-lg bg-orange-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-orange-700 shadow-sm"
                  >
                    Process Refund
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Verify & Confirm Order */}
      {verifyModalPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1A1A1A]">
                  Verify Payment & Confirm Order
                </h3>
                <p className="text-xs text-gray-500">
                  Order #{verifyModalPayment.order.orderNumber}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-emerald-50/70 p-3.5 border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <p>
                <strong>UTR Reference:</strong>{' '}
                <span className="font-mono font-bold">{verifyModalPayment.utrNumber}</span>
              </p>
              <p>
                <strong>Credited Amount:</strong> {formatPrice(verifyModalPayment.amount)}
              </p>
              <p className="text-[11px] text-emerald-800 pt-1">
                ✓ Have you confirmed that the funds of {formatPrice(verifyModalPayment.amount)} have reached your bank account with UTR {verifyModalPayment.utrNumber}?
              </p>
            </div>

            <p className="text-[11px] text-gray-600 leading-relaxed">
              Confirming this payment will immediately update the order to <strong>CONFIRMED</strong>, generate an official <strong>Tax Invoice</strong>, and notify the customer.
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setVerifyModalPayment(null)}
                className="rounded-lg border border-[#E8E3DC] px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleVerify(verifyModalPayment.id)}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 shadow"
              >
                {loading ? 'Confirming...' : 'Yes, Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Reject Payment */}
      {rejectModalPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <XCircle size={28} />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1A1A1A]">Reject Payment Details</h3>
                <p className="text-xs text-gray-500">
                  Order #{rejectModalPayment.order.orderNumber}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
                Rejection Reason (Sent to Customer) *
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. UTR number not found in bank statement, or payment was not credited, or wrong amount sent."
                className="w-full rounded-lg border border-red-200 bg-red-50/30 p-2.5 text-xs focus:border-red-500 focus:outline-none"
              />
            </div>

            <p className="text-[11px] text-gray-600">
              The customer will be notified with this reason and can resubmit the correct UTR or payment proof on their order payment screen.
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModalPayment(null)}
                className="rounded-lg border border-[#E8E3DC] px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleReject(rejectModalPayment.id)}
                className="rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 shadow"
              >
                {loading ? 'Rejecting...' : 'Reject Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Process Refund */}
      {refundModalPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <RotateCcw size={28} />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1A1A1A]">
                  Process Refund Settlement
                </h3>
                <p className="text-xs text-gray-500">
                  Order #{refundModalPayment.order.orderNumber}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-orange-50 p-3 border border-orange-200 text-xs text-orange-950 space-y-1">
              <p>
                <strong>Refund Amount:</strong> {formatPrice(refundModalPayment.amount)}
              </p>
              {refundModalPayment.customerRefundUpi && (
                <p>
                  <strong>Customer UPI ID:</strong>{' '}
                  <span className="font-mono font-bold">
                    {refundModalPayment.customerRefundUpi}
                  </span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
                Bank Refund Transaction UTR / Ref No *
              </label>
              <input
                type="text"
                required
                value={refundUtr}
                onChange={(e) => setRefundUtr(e.target.value.toUpperCase())}
                placeholder="e.g. 520938472910"
                className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-xs font-mono focus:border-[#C9A84C] focus:outline-none"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Transfer the funds to the customer's UPI ID, then paste the bank UTR here for record.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRefundModalPayment(null)}
                className="rounded-lg border border-[#E8E3DC] px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleRefund(refundModalPayment.id)}
                className="rounded-lg bg-orange-600 px-5 py-2 text-xs font-bold text-white hover:bg-orange-700 disabled:opacity-50 shadow"
              >
                {loading ? 'Recording...' : 'Mark as Refunded'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
