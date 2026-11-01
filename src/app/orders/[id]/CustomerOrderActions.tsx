'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, X, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface CustomerOrderActionsProps {
  orderId: string
  orderNumber: string
  totalAmount: number
  status: string
  paymentStatus: string
}

export default function CustomerOrderActions({
  orderId,
  orderNumber,
  totalAmount,
  status,
  paymentStatus,
}: CustomerOrderActionsProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [refundUpi, setRefundUpi] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Only allow cancellation if order has not been shipped
  const canCancel = ['PENDING_PAYMENT', 'PAYMENT_VERIFICATION', 'CONFIRMED'].includes(status)
  const isPaid = paymentStatus === 'PAID'

  if (!canCancel) return null

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason,
          refundUpi,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to cancel order')

      setModalOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Cancellation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="rounded-lg border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition"
      >
        Cancel Order
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E3DC]">
              <div className="flex items-center gap-2 text-red-700 font-bold text-base">
                <AlertTriangle size={20} /> Cancel Order #{orderNumber}
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-700 font-semibold border border-red-200">
                {error}
              </div>
            )}

            <p className="text-xs text-[#6B6B6B]">
              Are you sure you want to cancel this order? Jewellery items reserved for your order will be returned to store inventory.
            </p>

            <form onSubmit={handleCancel} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Reason for Cancellation *
                </label>
                <textarea
                  required
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Changed my mind, ordered duplicate item, etc."
                  className="w-full rounded-lg border border-[#E8E3DC] p-2.5 text-xs focus:border-red-500 focus:outline-none"
                />
              </div>

              {isPaid && (
                <div className="rounded-xl bg-amber-50/70 p-3 border border-[#C9A84C]/40 space-y-2">
                  <p className="text-xs font-bold text-[#2D2D2D]">
                    Refund of {formatPrice(totalAmount)}
                  </p>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                      Your UPI ID for Refund Credit *
                    </label>
                    <input
                      type="text"
                      required
                      value={refundUpi}
                      onChange={(e) => setRefundUpi(e.target.value)}
                      placeholder="e.g. yourname@okhdfcbank"
                      className="w-full rounded-lg border border-[#E8E3DC] bg-white px-3 py-2 text-xs focus:border-[#C9A84C] focus:outline-none"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      Our accounts team will verify and transfer the refund to this UPI ID.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-[#E8E3DC] px-4 py-2 text-xs font-semibold text-[#6B6B6B] hover:bg-gray-50"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 size={13} className="animate-spin" /> Cancelling...
                    </span>
                  ) : (
                    'Confirm Cancellation'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
