'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, RefreshCw } from 'lucide-react'

interface Props {
  orderId: string
  initialStatus: string
  initialPaymentStatus: string
  initialTrackingNumber: string
  initialTrackingUrl: string
}

export default function OrderStatusUpdater({
  orderId,
  initialStatus,
  initialPaymentStatus,
  initialTrackingNumber,
  initialTrackingUrl,
}: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus)
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber)
  const [trackingUrl, setTrackingUrl] = useState(initialTrackingUrl)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          paymentStatus,
          trackingNumber,
          trackingUrl,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')

      setMsg('Order updated successfully!')
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to update order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-4">
      <h3 className="font-semibold text-[#2D2D2D]">Update Order Status</h3>

      {msg && (
        <div className="rounded-lg bg-green-50 p-2.5 text-xs text-green-700 font-medium">
          {msg}
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
            Fulfillment Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] px-3 py-2 text-sm font-medium focus:border-[#C9A84C] focus:outline-none"
          >
            <option value="PENDING">Pending (New)</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled (Restores Stock)</option>
            <option value="RETURNED">Returned</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
            Payment Status
          </label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="w-full rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] px-3 py-2 text-sm font-medium focus:border-[#C9A84C] focus:outline-none"
          >
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
            Tracking Number
          </label>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="e.g. DTDC98234812"
            className="w-full rounded-lg border border-[#E8E3DC] px-3 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
            Tracking URL
          </label>
          <input
            type="text"
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
            placeholder="https://track.courier.com/..."
            className="w-full rounded-lg border border-[#E8E3DC] px-3 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#C9A84C] py-2.5 text-sm font-semibold text-white shadow hover:bg-[#B8963B] transition disabled:opacity-50"
        >
          <Save size={16} /> {loading ? 'Saving...' : 'Update Order'}
        </button>
      </form>
    </div>
  )
}
