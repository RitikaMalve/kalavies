'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle,
  Truck,
  ArrowLeft,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import StoreLayoutClient from '@/components/store/StoreLayoutClient'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form Fields
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('Karnataka')
  const [pincode, setPincode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD')

  // Autofill if logged in
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setFullName(`${data.user.firstName} ${data.user.lastName}`)
          setEmail(data.user.email)
          if (data.user.phone) setPhone(data.user.phone)
        }
      })
      .catch(() => {})
  }, [])

  const freeShippingThreshold = 499
  const isFreeShipping = subtotal >= freeShippingThreshold
  const shippingCharge = isFreeShipping ? 0 : 49
  const finalTotal = subtotal + shippingCharge

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      setError('Your shopping bag is empty')
      return
    }

    setLoading(true)
    setError('')

    try {
      const orderPayload = {
        customerDetails: {
          fullName,
          phone,
          email,
          addressLine1,
          addressLine2,
          city,
          state,
          pincode,
        },
        paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          productName: i.name,
          variantName: i.variantName,
          sku: i.sku,
          quantity: i.quantity,
          mrp: i.mrp,
          price: i.price,
          totalPrice: i.price * i.quantity,
          productImage: i.image,
        })),
        subtotal,
        shippingCharge,
        totalAmount: finalTotal,
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to place order')

      // Clear cart
      await clearCart()

      // Redirect to confirmation
      router.push(`/orders/${data.order.id}?success=true`)
    } catch (err: any) {
      setError(err.message || 'Payment processing failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <StoreLayoutClient>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B6B6B] mb-6">
          <Link href="/" className="hover:text-[#C9A84C]">Home</Link>
          <ChevronRight size={12} />
          <Link href="/cart" className="hover:text-[#C9A84C]">Cart</Link>
          <ChevronRight size={12} />
          <span className="font-semibold text-[#2D2D2D]">Secure Checkout</span>
        </div>

        <h1
          className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A] mb-8"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Secure Order Checkout
        </h1>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Form: Shipping Address & Payment Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="rounded-xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-[#2D2D2D] pb-3 border-b border-[#E8E3DC]">
                1. Delivery Shipping Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Email Address (for invoice & tracking) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="priya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Flat, House no., Building, Apartment *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 302, Royal Residency"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Area, Street, Sector, Village
                </label>
                <input
                  type="text"
                  placeholder="e.g. Indiranagar, 100ft Road"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Bangalore"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="560001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="rounded-xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-[#2D2D2D] pb-3 border-b border-[#E8E3DC]">
                2. Payment Method
              </h2>

              <div className="space-y-3">
                <label
                  className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition ${
                    paymentMethod === 'COD'
                      ? 'border-[#C9A84C] bg-amber-50/40 ring-1 ring-[#C9A84C]'
                      : 'border-[#E8E3DC] hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 text-[#C9A84C]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Banknote className="text-[#C9A84C]" size={20} />
                      <span className="font-bold text-[#2D2D2D]">Cash on Delivery (COD)</span>
                    </div>
                    <p className="text-xs text-[#6B6B6B] mt-1">
                      Pay in cash or through UPI upon receiving the parcel at your doorstep.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition ${
                    paymentMethod === 'ONLINE'
                      ? 'border-[#C9A84C] bg-amber-50/40 ring-1 ring-[#C9A84C]'
                      : 'border-[#E8E3DC] hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="ONLINE"
                    checked={paymentMethod === 'ONLINE'}
                    onChange={() => setPaymentMethod('ONLINE')}
                    className="mt-1 text-[#C9A84C]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="text-[#C9A84C]" size={20} />
                      <span className="font-bold text-[#2D2D2D]">
                        Online Payment (UPI, GPay, Cards, Netbanking)
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6B6B] mt-1">
                      Fast and 100% secure payment through Razorpay / Instant UPI gateway.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Summary Column */}
          <div className="space-y-6">
            <div className="rounded-xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-[#2D2D2D] pb-3 border-b border-[#E8E3DC]">
                Order Items ({items.length})
              </h3>

              <div className="divide-y divide-[#E8E3DC] max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-semibold text-[#2D2D2D] line-clamp-1">{item.name}</p>
                      <p className="text-[#6B6B6B]">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-[#2D2D2D]">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#E8E3DC] pt-3 space-y-2 text-xs text-[#6B6B6B]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#2D2D2D]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{isFreeShipping ? <strong className="text-green-700">FREE</strong> : formatPrice(shippingCharge)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Taxes</span>
                  <span className="text-green-700">Included</span>
                </div>
                <div className="flex justify-between border-t border-[#E8E3DC] pt-2 text-base font-bold text-[#2D2D2D]">
                  <span>Total Amount</span>
                  <span className="text-[#C9A84C]">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#C9A84C] py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#B8963B] transition disabled:opacity-50"
              >
                {loading ? 'Confirming Order...' : `Place Order • ${formatPrice(finalTotal)}`}
              </button>

              <div className="pt-2 text-center text-[11px] text-[#6B6B6B] flex items-center justify-center gap-1">
                <ShieldCheck size={14} className="text-green-600" />
                256-bit Encrypted Transaction
              </div>
            </div>
          </div>
        </form>
      </div>
    </StoreLayoutClient>
  )
}
