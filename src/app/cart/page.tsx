'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Trash2, ArrowRight, Tag, ShieldCheck, Truck, ChevronRight } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import StoreLayoutClient from '@/components/store/StoreLayoutClient'

export default function CartPage() {
  const router = useRouter()
  const { items, subtotal, removeItem, updateQuantity, clearCart } = useCart()

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  const freeShippingThreshold = 499
  const isFreeShipping = subtotal >= freeShippingThreshold
  const shippingCharge = isFreeShipping ? 0 : 49

  // Calculate discount
  let couponDiscount = 0
  if (appliedCoupon) {
    if (appliedCoupon.type === 'PERCENTAGE') {
      couponDiscount = Math.round((subtotal * appliedCoupon.value) / 100)
      if (appliedCoupon.maxDiscount && couponDiscount > appliedCoupon.maxDiscount) {
        couponDiscount = appliedCoupon.maxDiscount
      }
    } else {
      couponDiscount = appliedCoupon.value
    }
  }

  const finalTotal = Math.max(0, subtotal - couponDiscount + shippingCharge)

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')

    try {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), cartTotal: subtotal }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Invalid coupon code')

      setAppliedCoupon(data.coupon)
    } catch (err: any) {
      setCouponError(err.message)
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  return (
    <StoreLayoutClient>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B6B6B] mb-6">
          <Link href="/" className="hover:text-[#C9A84C]">Home</Link>
          <ChevronRight size={12} />
          <span className="font-semibold text-[#2D2D2D]">Shopping Bag</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)} Items)
          </h1>
          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8E3DC] bg-white px-4 py-2 text-xs font-semibold text-[#2D2D2D] hover:bg-gray-50 transition"
              >
                ← Continue Shopping
              </Link>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear your entire bag?')) {
                    clearCart()
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
              >
                <Trash2 size={13} /> Clear Entire Bag
              </button>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-[#E8E3DC] bg-white p-16 text-center shadow-sm">
            <div className="h-20 w-20 rounded-full bg-amber-50 text-[#C9A84C] flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={32} />
            </div>
            <h2 className="text-xl font-bold text-[#2D2D2D]">Your shopping bag is empty</h2>
            <p className="text-xs text-[#6B6B6B] mt-1 mb-6 max-w-sm mx-auto">
              You haven't added any jewellery pieces yet. Browse our oxidised and traditional collections to start styling.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] px-6 py-3 text-xs font-bold text-white shadow hover:bg-[#B8963B] transition"
            >
              Explore Catalogue <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Items Table */}
            <div className="lg:col-span-2 space-y-4">
              {/* Free Shipping Alert Banner */}
              <div className="rounded-xl border border-[#E8E3DC] bg-amber-50/50 p-4 flex items-center gap-3">
                <Truck className="text-[#C9A84C] shrink-0" size={20} />
                <div className="text-xs">
                  {isFreeShipping ? (
                    <span className="font-bold text-green-700">
                      ✓ You are eligible for FREE Express Delivery!
                    </span>
                  ) : (
                    <span>
                      Add items worth <strong className="text-[#C9A84C]">{formatPrice(freeShippingThreshold - subtotal)}</strong> more to get <strong>FREE Shipping</strong>!
                    </span>
                  )}
                </div>
              </div>

              {/* Items Card */}
              <div className="rounded-xl border border-[#E8E3DC] bg-white shadow-sm divide-y divide-[#E8E3DC]">
                {items.map((item) => (
                  <div key={item.id} className="p-5 flex gap-4">
                    <div className="h-24 w-24 shrink-0 rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] overflow-hidden flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-[#C9A84C]">KLV</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-sm text-[#2D2D2D]">{item.name}</h3>
                            {item.variantName && (
                              <p className="text-xs text-[#6B6B6B]">Size: {item.variantName}</p>
                            )}
                            <p className="text-xs text-[#6B6B6B]">SKU: {item.sku}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId, item.variantId)}
                            className="text-[#6B6B6B] hover:text-red-600 transition p-1"
                            title="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="font-bold text-base text-[#2D2D2D]">
                            {formatPrice(item.price)}
                          </span>
                          {item.mrp > item.price && (
                            <span className="text-xs text-[#6B6B6B] line-through">
                              {formatPrice(item.mrp)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <div className="flex items-center border border-[#E8E3DC] rounded-lg bg-white">
                          <button
                            onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-3 py-1 text-xs font-bold text-[#6B6B6B] hover:text-black disabled:opacity-30"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-semibold text-[#2D2D2D]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="px-3 py-1 text-xs font-bold text-[#6B6B6B] hover:text-black disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-sm font-bold text-[#2D2D2D]">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Summary Card */}
            <div className="space-y-4">
              {/* Promo Code Box */}
              <div className="rounded-xl border border-[#E8E3DC] bg-white p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D2D2D] flex items-center gap-1.5">
                  <Tag size={14} className="text-[#C9A84C]" /> Have a Coupon Code?
                </h3>

                {appliedCoupon ? (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-xs text-emerald-800">
                        {appliedCoupon.code}
                      </span>
                      <p className="text-[11px] text-emerald-700">Coupon discount applied!</p>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. WELCOME10"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 rounded-lg border border-[#E8E3DC] px-3 py-2 text-xs font-mono uppercase focus:border-[#C9A84C] focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={couponLoading}
                        className="rounded-lg bg-[#2D2D2D] px-4 py-2 text-xs font-semibold text-white hover:bg-black transition disabled:opacity-50"
                      >
                        {couponLoading ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-red-600 font-medium">{couponError}</p>
                    )}
                  </form>
                )}
              </div>

              {/* Order Total Breakdown */}
              <div className="rounded-xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-3">
                <h3 className="font-bold text-base text-[#2D2D2D] pb-3 border-b border-[#E8E3DC]">
                  Order Summary
                </h3>

                <div className="space-y-2 text-xs text-[#6B6B6B]">
                  <div className="flex justify-between">
                    <span>Bag Subtotal</span>
                    <span className="font-semibold text-[#2D2D2D]">{formatPrice(subtotal)}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Coupon Savings</span>
                      <span>- {formatPrice(couponDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping Charges</span>
                    <span>{isFreeShipping ? <strong className="text-green-700">FREE</strong> : formatPrice(shippingCharge)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Applicable Taxes</span>
                    <span className="text-green-700">Included (GST)</span>
                  </div>
                </div>

                <div className="border-t border-[#E8E3DC] pt-3 flex justify-between items-baseline">
                  <span className="font-bold text-base text-[#2D2D2D]">Final Payable</span>
                  <span className="font-extrabold text-2xl text-[#C9A84C]">
                    {formatPrice(finalTotal)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#C9A84C] py-3.5 text-sm font-bold text-white shadow hover:bg-[#B8963B] transition"
                >
                  Proceed to Checkout <ArrowRight size={16} />
                </Link>

                <Link
                  href="/products"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8E3DC] bg-white py-2.5 text-xs font-semibold text-[#2D2D2D] hover:bg-gray-50 transition"
                >
                  Continue Shopping
                </Link>

                <p className="text-[11px] text-[#6B6B6B] text-center pt-2 flex items-center justify-center gap-1">
                  <ShieldCheck size={14} className="text-green-600" />
                  Guaranteed Safe & Encrypted Checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </StoreLayoutClient>
  )
}
