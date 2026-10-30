'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { X, Trash2, ShoppingBag, ArrowRight, AlertTriangle, AlertCircle } from 'lucide-react'

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    subtotal,
    removeItem,
    updateQuantity,
    stockWarning,
    clearStockWarning,
    setStockWarning,
  } = useCart()
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(699)

  useEffect(() => {
    fetch('/api/admin/settings/shipping')
      .then((res) => res.json())
      .then((data) => {
        if (data.freeShippingAbove) setFreeShippingThreshold(data.freeShippingAbove)
      })
      .catch(() => {})
  }, [])

  if (!isOpen) return null

  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal)
  const shippingPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E8E3DC] px-6 py-4">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-[#C9A84C]" />
              <h2 className="text-lg font-bold text-[#2D2D2D]">Your Shopping Bag</h2>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-[#C9A84C]">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="rounded-lg p-1.5 text-[#6B6B6B] hover:bg-gray-100 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Stock Limit Warning Notification Banner */}
          {stockWarning && (
            <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 text-xs text-amber-900 flex items-start justify-between gap-3 animate-fadeIn">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{stockWarning}</span>
              </div>
              <button
                onClick={clearStockWarning}
                className="text-amber-700 hover:text-black shrink-0 p-0.5"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Free Shipping Meter */}
          <div className="bg-[#FAF8F5] px-6 py-3 border-b border-[#E8E3DC]">
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span>
                {remainingForFreeShipping === 0 ? (
                  <span className="text-green-700">🎉 Congratulations! You unlocked Free Shipping</span>
                ) : (
                  <span>
                    Add <strong className="text-[#C9A84C]">{formatPrice(remainingForFreeShipping)}</strong> more for <strong>FREE Delivery</strong>
                  </span>
                )}
              </span>
              <span className="text-[#6B6B6B]">{shippingPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C9A84C] transition-all duration-300"
                style={{ width: `${shippingPercent}%` }}
              />
            </div>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#E8E3DC]">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center text-[#C9A84C] mb-4">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="font-semibold text-base text-[#2D2D2D]">Your bag is empty</h3>
                <p className="text-xs text-[#6B6B6B] max-w-xs mt-1 mb-6">
                  Explore our handcrafted oxidised and traditional jewellery collections to add your favourites.
                </p>
                <Link
                  href="/products"
                  onClick={closeCart}
                  className="rounded-lg bg-[#C9A84C] px-6 py-2.5 text-xs font-semibold text-white shadow hover:bg-[#B8963B] transition"
                >
                  Start Exploring
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const isAtMaxStock = item.quantity >= (item.maxStock ?? 9999)
                return (
                  <div key={item.id} className="py-4 flex gap-3">
                    <div className="h-20 w-20 shrink-0 rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] overflow-hidden flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-[#C9A84C]">KLV</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-[#2D2D2D] line-clamp-1">{item.name}</h4>
                        {item.variantName && (
                          <p className="text-xs text-[#6B6B6B]">Size/Color: {item.variantName}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-[#2D2D2D]">{formatPrice(item.price)}</span>
                          {item.mrp > item.price && (
                            <span className="text-xs text-[#6B6B6B] line-through">{formatPrice(item.mrp)}</span>
                          )}
                        </div>

                        {/* Stock Limit Badge */}
                        {isAtMaxStock && (
                          <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                            <AlertCircle size={12} className="text-amber-600 shrink-0" />
                            <span>Only {item.maxStock} in stock (Max added)</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-[#E8E3DC] rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-2.5 py-0.5 text-xs font-bold text-[#6B6B6B] hover:text-[#2D2D2D] disabled:opacity-30 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-semibold text-[#2D2D2D]">{item.quantity}</span>
                          <button
                            onClick={() => {
                              if (isAtMaxStock) {
                                setStockWarning(
                                  `Only ${item.maxStock} unit${item.maxStock > 1 ? 's' : ''} of "${item.name}" available in stock. Cannot add more.`
                                )
                              } else {
                                updateQuantity(item.productId, item.variantId, item.quantity + 1)
                              }
                            }}
                            className={`px-2.5 py-0.5 text-xs font-bold transition cursor-pointer ${
                              isAtMaxStock
                                ? 'text-amber-500 hover:text-amber-700 bg-amber-50/50'
                                : 'text-[#6B6B6B] hover:text-[#2D2D2D]'
                            }`}
                            title={isAtMaxStock ? `Stock limit: ${item.maxStock}` : 'Increase quantity'}
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-[#6B6B6B] hover:text-red-600 transition p-1 cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer Checkout */}
          {items.length > 0 && (
            <div className="border-t border-[#E8E3DC] p-6 bg-[#FAF8F5] space-y-3">
              <div className="flex justify-between text-sm text-[#6B6B6B]">
                <span>Estimated Subtotal</span>
                <span className="font-bold text-[#2D2D2D] text-base">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-[11px] text-[#6B6B6B]">
                Taxes and coupons calculated during final checkout.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="rounded-lg border border-[#E8E3DC] bg-white py-2.5 text-center text-xs font-semibold text-[#2D2D2D] hover:bg-gray-50 transition"
                >
                  View Full Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="rounded-lg bg-[#C9A84C] py-2.5 text-center text-xs font-semibold text-white shadow hover:bg-[#B8963B] transition flex items-center justify-center gap-1.5"
                >
                  Checkout <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
