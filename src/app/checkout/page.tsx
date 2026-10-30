'use client'

import { useState, useEffect, useRef } from 'react'
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
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  UserPlus,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import StoreLayoutClient from '@/components/store/StoreLayoutClient'

const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Current session user
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Form Fields
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD')

  // Account check state for non-logged-in customers
  const [checkingPhone, setCheckingPhone] = useState(false)
  const [accountStatus, setAccountStatus] = useState<{
    checked: boolean
    exists: boolean
    firstName?: string
  }>({ checked: false, exists: false })
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const passwordInputRef = useRef<HTMLInputElement>(null)

  // Autofill if logged in
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user)
          const name = [data.user.firstName, data.user.lastName].filter(Boolean).join(' ')
          if (name) setFullName(name)
          if (data.user.email) setEmail(data.user.email)
          if (data.user.phone) {
            setPhone(data.user.phone.replace(/\D/g, '').slice(-10))
            setAccountStatus({ checked: true, exists: true, firstName: data.user.firstName })
          }
        }
      })
      .catch(() => {})
      .finally(() => setCheckingAuth(false))
  }, [])

  // Auto-check phone number when user enters 10 digits (and not logged in)
  const checkPhoneNumber = async (phoneNumber: string) => {
    const cleanPhone = phoneNumber.replace(/\D/g, '').slice(-10)
    if (cleanPhone.length < 10) {
      setAccountStatus({ checked: false, exists: false })
      return
    }

    if (currentUser) {
      // Already logged in - no check or password prompt needed
      setAccountStatus({ checked: true, exists: true, firstName: currentUser.firstName })
      return
    }

    setCheckingPhone(true)
    setError('')
    try {
      const res = await fetch('/api/auth/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      })
      const data = await res.json()
      if (res.ok) {
        setAccountStatus({
          checked: true,
          exists: !!data.exists,
          firstName: data.user?.firstName,
        })
      }
    } catch {
      // Non-blocking fallback
    } finally {
      setCheckingPhone(false)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(rawVal)
    if (rawVal.length === 10) {
      checkPhoneNumber(rawVal)
    } else {
      setAccountStatus({ checked: false, exists: false })
    }
  }

  const [freeShippingThreshold, setFreeShippingThreshold] = useState(699)
  const [flatShippingRate, setFlatShippingRate] = useState(70)

  useEffect(() => {
    fetch('/api/admin/settings/shipping')
      .then((res) => res.json())
      .then((data) => {
        if (data.freeShippingAbove) setFreeShippingThreshold(data.freeShippingAbove)
        if (data.flatShippingRate) setFlatShippingRate(data.flatShippingRate)
      })
      .catch(() => {})
  }, [])

  const isFreeShipping = subtotal >= freeShippingThreshold
  const shippingCharge = isFreeShipping ? 0 : flatShippingRate
  const finalTotal = subtotal + shippingCharge

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      setError('Your shopping bag is empty')
      return
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    if (cleanPhone.length < 10) {
      setError('Please provide a valid 10-digit mobile phone number')
      return
    }

    // If user is not logged in, enforce password entry
    if (!currentUser) {
      if (!password || password.trim().length < 6) {
        setError(
          accountStatus.exists
            ? 'Please enter your password to confirm order with your account'
            : 'Please create a password (at least 6 characters) for your new account'
        )
        passwordInputRef.current?.focus()
        return
      }
    }

    setLoading(true)
    setError('')

    try {
      const orderPayload = {
        customerDetails: {
          fullName,
          phone: cleanPhone,
          email,
          addressLine1,
          addressLine2,
          city,
          state,
          pincode,
        },
        password: currentUser ? undefined : password.trim(),
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
      if (!res.ok) {
        // If password was required or failed, prompt user to enter password
        if (data.requiresPassword) {
          setAccountStatus({
            checked: true,
            exists: !!data.accountExists,
            firstName: data.userFirstName,
          })
          passwordInputRef.current?.focus()
        }
        throw new Error(data.error || 'Failed to place order')
      }

      // Clear cart
      await clearCart()

      // Redirect to confirmation
      router.push(`/orders/${data.order.id}?success=true`)
    } catch (err: any) {
      setError(err.message || 'Order processing failed')
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

        {/* Logged in notification banner */}
        {currentUser && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-900">
            <div className="flex items-center gap-2.5">
              <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
              <div>
                <span className="font-bold">Logged in as {currentUser.firstName} {currentUser.lastName || ''}</span>
                <span className="text-emerald-700 ml-2">({currentUser.phone || currentUser.email})</span>
                <p className="text-[11px] text-emerald-600 mt-0.5">
                  Your order will be linked directly to your account. No login or password required.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-start gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-600" />
            <div>{error}</div>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold uppercase text-[#6B6B6B]">
                      Mobile Phone Number *
                    </label>
                    {checkingPhone && (
                      <span className="text-[11px] text-[#C9A84C] flex items-center gap-1 font-medium">
                        <Loader2 size={12} className="animate-spin" /> Checking account...
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#6B6B6B]">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={phone}
                      onChange={handlePhoneChange}
                      onBlur={() => phone.length === 10 && checkPhoneNumber(phone)}
                      className="w-full rounded-lg border border-[#E8E3DC] pl-12 pr-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Account Check / Password Prompt Section for Non-Logged-in Customers */}
              {!currentUser && accountStatus.checked && phone.length === 10 && (
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    accountStatus.exists
                      ? 'border-amber-300 bg-amber-50/60'
                      : 'border-emerald-300 bg-emerald-50/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {accountStatus.exists ? (
                      <UserCheck size={20} className="text-[#C9A84C] flex-shrink-0 mt-0.5" />
                    ) : (
                      <UserPlus size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="text-xs">
                        {accountStatus.exists ? (
                          <>
                            <span className="font-bold text-[#1A1A1A]">
                              Welcome back{accountStatus.firstName ? `, ${accountStatus.firstName}` : ''}!
                            </span>{' '}
                            <span className="text-[#6B6B6B]">
                              An account already exists for this mobile number (+91 {phone}). Please enter your password to authenticate and place your order.
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="font-bold text-emerald-900">
                              New Customer Detected!
                            </span>{' '}
                            <span className="text-emerald-800">
                              No account found for +91 {phone}. Create a password below to register your account and place your order in one click.
                            </span>
                          </>
                        )}
                      </div>

                      <div className="pt-1">
                        <label className="block text-xs font-semibold uppercase text-[#2D2D2D] mb-1">
                          {accountStatus.exists ? 'Account Password *' : 'Create Password (min. 6 characters) *'}
                        </label>
                        <div className="relative max-w-md">
                          <input
                            ref={passwordInputRef}
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder={accountStatus.exists ? 'Enter your password' : 'Create a secure password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-[#E8E3DC] bg-white px-3.5 py-2 pr-10 text-sm focus:border-[#C9A84C] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#1A1A1A]"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <p className="text-[11px] text-[#6B6B6B] mt-1">
                          {accountStatus.exists
                            ? 'Your order will be linked to your existing account history.'
                            : 'We will automatically register your account upon placing the order so you can track delivery.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Email Address (for invoice & tracking updates) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. yourname@example.com"
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
                  placeholder="e.g. Flat 302, Royal Residency / House No. 15"
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
                  placeholder="e.g. MG Road, Sector 4, Near Post Office"
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
                    placeholder="e.g. Mumbai, Delhi, Nagpur"
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
                    list="indian-states-list"
                    placeholder="e.g. Maharashtra, Karnataka"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-lg border border-[#E8E3DC] bg-white px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                  />
                  <datalist id="indian-states-list">
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 400001"
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
                      Fast and 100% secure payment through Instant UPI gateway.
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
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#C9A84C] py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#B8963B] transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Confirming Order...
                  </span>
                ) : (
                  `Place Order • ${formatPrice(finalTotal)}`
                )}
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
