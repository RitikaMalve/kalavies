'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tag, Plus, Edit2, Trash2, X, Percent, IndianRupee, Save, Truck } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'

interface Coupon {
  id: string
  code: string
  description?: string | null
  type: string
  value: number
  minOrderValue?: number | null
  maxDiscount?: number | null
  usageLimit?: number | null
  usedCount: number
  isActive: boolean
  endDate?: Date | string | null
}

export default function DiscountsManager({
  initialCoupons,
  shippingSetting,
}: {
  initialCoupons: Coupon[]
  shippingSetting: any
}) {
  const router = useRouter()
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [loading, setLoading] = useState(false)

  // Form State
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE')
  const [value, setValue] = useState<number>(10)
  const [minOrderValue, setMinOrderValue] = useState<number>(499)
  const [maxDiscount, setMaxDiscount] = useState<number>(150)
  const [isActive, setIsActive] = useState(true)

  // Shipping form state
  const [freeShippingAbove, setFreeShippingAbove] = useState(shippingSetting.freeShippingAbove || 499)
  const [flatShippingRate, setFlatShippingRate] = useState(shippingSetting.flatShippingRate || 49)
  const [shippingLoading, setShippingLoading] = useState(false)
  const [shippingMsg, setShippingMsg] = useState('')

  const openCreateModal = () => {
    setEditingCoupon(null)
    setCode('')
    setDescription('')
    setType('PERCENTAGE')
    setValue(15)
    setMinOrderValue(499)
    setMaxDiscount(200)
    setIsActive(true)
    setModalOpen(true)
  }

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        code: code.toUpperCase().trim(),
        description,
        type,
        value: Number(value),
        minOrderValue: Number(minOrderValue),
        maxDiscount: type === 'PERCENTAGE' ? Number(maxDiscount) : null,
        isActive,
      }

      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save coupon')

      setModalOpen(false)
      router.refresh()
      window.location.reload()
    } catch (err: any) {
      alert(err.message || 'Action failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate or remove this coupon?')) return
    try {
      await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
      router.refresh()
      window.location.reload()
    } catch (err: any) {
      alert(err.message || 'Failed')
    }
  }

  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault()
    setShippingLoading(true)
    setShippingMsg('')

    try {
      const res = await fetch('/api/admin/settings/shipping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freeShippingAbove: Number(freeShippingAbove),
          flatShippingRate: Number(flatShippingRate),
        }),
      })

      if (!res.ok) throw new Error('Failed to update shipping rule')
      setShippingMsg('Shipping thresholds updated successfully!')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setShippingLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2D2D2D]">
            Discounts & Coupons
          </h1>
          <p className="text-sm text-[#6B6B6B]">
            Configure promotional coupon codes, cart discounts, and delivery shipping rules.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#B8963B] transition"
        >
          <Plus size={18} /> Create Coupon Code
        </button>
      </div>

      {/* Shipping rules configuration card */}
      <div className="rounded-xl border border-[#E8E3DC] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Truck className="text-[#C9A84C]" size={20} />
          <h3 className="font-semibold text-lg text-[#2D2D2D]">Free Shipping & Delivery Rules</h3>
        </div>

        {shippingMsg && (
          <div className="mb-4 rounded-lg bg-green-50 p-2.5 text-xs text-green-700 font-medium">
            {shippingMsg}
          </div>
        )}

        <form onSubmit={handleSaveShipping} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
              Free Shipping Above Cart Value (₹)
            </label>
            <input
              type="number"
              min="0"
              value={freeShippingAbove}
              onChange={(e) => setFreeShippingAbove(Number(e.target.value))}
              className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
              Standard Flat Shipping Rate (₹)
            </label>
            <input
              type="number"
              min="0"
              value={flatShippingRate}
              onChange={(e) => setFlatShippingRate(Number(e.target.value))}
              className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={shippingLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2D2D2D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black transition disabled:opacity-50"
            >
              <Save size={16} /> Save Shipping Policy
            </button>
          </div>
        </form>
      </div>

      {/* Coupons Table */}
      <div className="overflow-hidden rounded-xl border border-[#E8E3DC] bg-white shadow-sm">
        <div className="border-b border-[#E8E3DC] bg-[#FAF8F5] px-6 py-3.5 text-xs font-semibold uppercase text-[#6B6B6B]">
          Active & Scheduled Promotional Coupons ({coupons.length})
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-[#E8E3DC] bg-[#FAF8F5] text-xs font-semibold uppercase text-[#6B6B6B]">
              <tr>
                <th className="px-6 py-3.5">Promo Code</th>
                <th className="px-4 py-3.5">Discount Offer</th>
                <th className="px-4 py-3.5">Conditions</th>
                <th className="px-4 py-3.5">Times Used</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3DC]">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAF8F5]/80 transition">
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#C9A84C]/40 bg-amber-50/50 px-2.5 py-1 font-mono font-bold text-[#C9A84C]">
                      <Tag size={13} /> {c.code}
                    </div>
                    {c.description && (
                      <p className="mt-1 text-xs text-[#6B6B6B]">{c.description}</p>
                    )}
                  </td>

                  <td className="px-4 py-4 font-semibold text-[#2D2D2D]">
                    {c.type === 'PERCENTAGE' ? `${c.value}% OFF` : `Flat ${formatPrice(c.value)} OFF`}
                  </td>

                  <td className="px-4 py-4 text-xs text-[#6B6B6B]">
                    {c.minOrderValue ? `Min order: ${formatPrice(c.minOrderValue)}` : 'No minimum'}
                    {c.maxDiscount ? ` • Max cap: ${formatPrice(c.maxDiscount)}` : ''}
                  </td>

                  <td className="px-4 py-4 text-xs font-medium text-[#2D2D2D]">
                    {c.usedCount} times
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteCoupon(c.id)}
                      className="rounded p-1.5 text-[#6B6B6B] hover:text-red-600 transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Creating Coupon */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#E8E3DC]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E3DC]">
              <h3 className="text-lg font-bold text-[#2D2D2D]">Create Coupon Code</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-[#6B6B6B] hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCouponSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DIWALI25, FESTIVE50"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 font-mono font-bold uppercase text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Description / Offer Highlight
                </label>
                <input
                  type="text"
                  placeholder="Special 15% discount for first time shoppers"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                    Discount Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat Cash (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                    Value *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                    Min Cart Order (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="coupon-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-[#C9A84C] focus:ring-[#C9A84C]"
                />
                <label htmlFor="coupon-active" className="text-sm font-medium text-[#2D2D2D]">
                  Active Immediately
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E3DC]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-[#6B6B6B] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-[#C9A84C] px-5 py-2 text-sm font-semibold text-white shadow hover:bg-[#B8963B] transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
