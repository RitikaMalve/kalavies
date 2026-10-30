'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingBag, Zap, Truck, ShieldCheck, RefreshCw, Star, Check, Award, AlertTriangle, AlertCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'

interface Variant {
  id: string
  name: string
  sku: string
  size?: string | null
  color?: string | null
  price?: number | null
  mrp?: number | null
  stock: number
}

interface Image {
  id: string
  url: string
}

interface ProductDetailClientProps {
  product: {
    id: string
    name: string
    slug: string
    sku: string
    description?: string | null
    detailedContent?: string | null
    mrp: number
    sellingPrice: number
    totalStock: number
    material?: string | null
    colour?: string | null
    style?: string | null
    weight?: string | null
    brandName?: string | null
    images: Image[]
    variants: Variant[]
  }
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter()
  const { addItem, openCart, items } = useCart()
  const { isInWishlist, toggleItem } = useWishlist()

  const [selectedImage, setSelectedImage] = useState<string>(
    product.images[0]?.url || '/images/products/placeholder-1.jpg'
  )
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants[0] || null
  )
  const [quantity, setQuantity] = useState(1)
  const [pincode, setPincode] = useState('')
  const [deliveryChecked, setDeliveryChecked] = useState(false)
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'CARE' | 'SHIPPING'>('DETAILS')
  const [stockNotice, setStockNotice] = useState<string | null>(null)

  const currentPrice = selectedVariant?.price || product.sellingPrice
  const currentMrp = selectedVariant?.mrp || product.mrp
  const currentStock = selectedVariant ? selectedVariant.stock : product.totalStock
  const isOutOfStock = currentStock === 0

  const cartItem = items.find(
    (i) => i.productId === product.id && i.variantId === selectedVariant?.id
  )
  const inCartQty = cartItem?.quantity || 0
  const remainingStock = Math.max(0, currentStock - inCartQty)
  const isMaxStockInCart = !isOutOfStock && inCartQty >= currentStock

  const discountPercent =
    currentMrp > currentPrice
      ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100)
      : 0

  const isFavorited = isInWishlist(product.id)

  const handleAddToCart = () => {
    if (isOutOfStock) return
    if (inCartQty >= currentStock) {
      setStockNotice(
        `Only ${currentStock} unit${currentStock > 1 ? 's' : ''} in stock. You already have all available units in your bag.`
      )
      openCart()
      return
    }
    if (quantity > remainingStock) {
      setStockNotice(
        `Only ${currentStock} unit${currentStock > 1 ? 's' : ''} in stock (${inCartQty} already in your bag). You can only add ${remainingStock} more.`
      )
      return
    }

    setStockNotice(null)
    addItem({
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : `${product.id}-default`,
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      variantName: selectedVariant?.name,
      price: currentPrice,
      mrp: currentMrp,
      quantity,
      maxStock: currentStock,
      sku: selectedVariant ? selectedVariant.sku : product.sku,
      image: selectedImage,
    })
    openCart()
  }

  const handleBuyNow = () => {
    handleAddToCart()
    if (!isOutOfStock && !isMaxStockInCart) {
      router.push('/checkout')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Left Column: Image Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-square rounded-2xl border border-[#E8E3DC] bg-white overflow-hidden shadow-sm flex items-center justify-center">
          <img
            src={selectedImage}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
          />
          {discountPercent > 0 && (
            <span className="absolute top-4 left-4 rounded-full bg-[#C9A84C] px-3 py-1 text-xs font-bold text-white uppercase shadow">
              {discountPercent}% OFF
            </span>
          )}
          <button
            onClick={() =>
              toggleItem({
                id: product.id,
                productId: product.id,
                name: product.name,
                price: currentPrice,
                mrp: currentMrp,
                slug: product.slug,
                image: selectedImage,
              })
            }
            className={`absolute top-4 right-4 h-10 w-10 rounded-full flex items-center justify-center shadow transition ${
              isFavorited
                ? 'bg-red-50 text-red-600'
                : 'bg-white/90 text-[#2D2D2D] hover:bg-white hover:text-red-600'
            }`}
          >
            <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Thumbnails */}
        {product.images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.images.map((img) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(img.url)}
                className={`h-20 w-20 shrink-0 rounded-xl border-2 overflow-hidden bg-white transition ${
                  selectedImage === img.url ? 'border-[#C9A84C] shadow-md' : 'border-[#E8E3DC]'
                }`}
              >
                <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Product Info & Actions */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
            {product.brandName || 'KALAVIES Jewellery'}
          </span>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A] mt-1"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {product.name}
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-1">SKU: {product.sku}</p>
        </div>

        {/* Price & Savings */}
        <div className="rounded-xl border border-[#E8E3DC] bg-white p-4 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-[#1A1A1A]">
                {formatPrice(currentPrice)}
              </span>
              {currentMrp > currentPrice && (
                <span className="text-sm text-[#6B6B6B] line-through">
                  {formatPrice(currentMrp)}
                </span>
              )}
            </div>
            <p className="text-xs text-green-700 font-semibold mt-0.5">
              Inclusive of all GST taxes
            </p>
          </div>

          {discountPercent > 0 && (
            <div className="text-right">
              <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                Save {formatPrice(currentMrp - currentPrice)}
              </span>
            </div>
          )}
        </div>

        {/* Short Description */}
        {product.description && (
          <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Variants Selector */}
        {product.variants.length > 0 && (
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2D2D]">
              Select Variant / Size:
            </label>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${
                    selectedVariant?.id === v.id
                      ? 'border-[#C9A84C] bg-[#C9A84C] text-white shadow'
                      : 'border-[#E8E3DC] bg-white text-[#2D2D2D] hover:bg-gray-50'
                  }`}
                >
                  {v.name} ({v.size || v.color})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stock status indicator */}
        <div>
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
              Out of Stock
            </span>
          ) : currentStock <= 5 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
              Only {currentStock} units remaining! Hurry
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
              In Stock & Ready for Dispatch
            </span>
          )}
        </div>

        {/* Stock Notice & Max Stock Alerts */}
        {stockNotice && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs font-semibold text-amber-900 flex items-start gap-2 shadow-sm animate-fadeIn">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{stockNotice}</span>
          </div>
        )}

        {isMaxStockInCart && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Maximum Stock in Bag</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                You already have all {currentStock} available unit{currentStock > 1 ? 's' : ''} in your shopping bag.
              </p>
            </div>
          </div>
        )}

        {/* Quantity and Actions */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase text-[#2D2D2D]">Quantity:</span>
            <div className="flex items-center border border-[#E8E3DC] bg-white rounded-lg">
              <button
                onClick={() => {
                  setStockNotice(null)
                  setQuantity(Math.max(1, quantity - 1))
                }}
                disabled={quantity <= 1 || isOutOfStock || isMaxStockInCart}
                className="px-3 py-1 text-sm font-bold text-[#6B6B6B] hover:text-black disabled:opacity-30 cursor-pointer"
              >
                -
              </button>
              <span className="px-3 text-sm font-semibold text-[#2D2D2D]">{quantity}</span>
              <button
                onClick={() => {
                  if (quantity >= remainingStock) {
                    setStockNotice(
                      `Only ${currentStock} unit${currentStock > 1 ? 's' : ''} in stock.${inCartQty > 0 ? ` (${inCartQty} already in your bag)` : ''} Cannot add more.`
                    )
                  } else {
                    setStockNotice(null)
                    setQuantity(quantity + 1)
                  }
                }}
                disabled={quantity >= remainingStock || isOutOfStock || isMaxStockInCart}
                className="px-3 py-1 text-sm font-bold text-[#6B6B6B] hover:text-black disabled:opacity-30 cursor-pointer"
              >
                +
              </button>
            </div>
            {remainingStock > 0 && inCartQty > 0 && (
              <span className="text-[11px] text-[#6B6B6B]">
                ({inCartQty} in bag, {remainingStock} left)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isMaxStockInCart}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#2D2D2D] bg-white py-3.5 text-sm font-bold text-[#2D2D2D] shadow-sm hover:bg-[#2D2D2D] hover:text-white transition disabled:opacity-40 cursor-pointer"
            >
              <ShoppingBag size={18} />
              {isOutOfStock
                ? 'Out of Stock'
                : isMaxStockInCart
                ? `Max in Bag (${currentStock})`
                : 'Add to Bag'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock || isMaxStockInCart}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C9A84C] py-3.5 text-sm font-bold text-white shadow hover:bg-[#B8963B] transition disabled:opacity-40 cursor-pointer"
            >
              <Zap size={18} />
              {isOutOfStock
                ? 'Out of Stock'
                : isMaxStockInCart
                ? `Max in Bag (${currentStock})`
                : 'Buy Now'}
            </button>
          </div>
        </div>

        {/* Delivery Pincode Checker */}
        <div className="rounded-xl border border-[#E8E3DC] bg-white p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#2D2D2D]">
            <Truck size={16} className="text-[#C9A84C]" /> Check Delivery Estimate
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit Pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              className="flex-1 rounded-lg border border-[#E8E3DC] px-3 py-2 text-xs focus:border-[#C9A84C] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setDeliveryChecked(true)}
              className="rounded-lg bg-[#2D2D2D] px-4 py-2 text-xs font-semibold text-white hover:bg-black transition"
            >
              Check
            </button>
          </div>
          {deliveryChecked && (
            <p className="text-xs text-green-700 font-medium">
              ✓ Delivery available to {pincode || 'your location'} in 3-5 business days. Free shipping on this order!
            </p>
          )}
        </div>

        {/* Highlights & Guarantees */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs text-[#6B6B6B] pt-2">
          <div className="p-2 border border-[#E8E3DC] rounded-lg bg-white">
            <Award className="w-5 h-5 text-[#C9A84C] mx-auto mb-1" />
            <span className="font-semibold block text-[#2D2D2D]">100% Authentic</span>
          </div>
          <div className="p-2 border border-[#E8E3DC] rounded-lg bg-white">
            <RefreshCw className="w-5 h-5 text-[#C9A84C] mx-auto mb-1" />
            <span className="font-semibold block text-[#2D2D2D]">7-Day Return</span>
          </div>
          <div className="p-2 border border-[#E8E3DC] rounded-lg bg-white">
            <ShieldCheck className="w-5 h-5 text-[#C9A84C] mx-auto mb-1" />
            <span className="font-semibold block text-[#2D2D2D]">COD Available</span>
          </div>
        </div>

        {/* Specifications Tabs */}
        <div className="pt-4 border-t border-[#E8E3DC]">
          <div className="flex border-b border-[#E8E3DC] gap-6 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('DETAILS')}
              className={`pb-2 transition ${
                activeTab === 'DETAILS'
                  ? 'border-b-2 border-[#C9A84C] text-[#C9A84C]'
                  : 'text-[#6B6B6B] hover:text-[#2D2D2D]'
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab('CARE')}
              className={`pb-2 transition ${
                activeTab === 'CARE'
                  ? 'border-b-2 border-[#C9A84C] text-[#C9A84C]'
                  : 'text-[#6B6B6B] hover:text-[#2D2D2D]'
              }`}
            >
              Jewellery Care
            </button>
            <button
              onClick={() => setActiveTab('SHIPPING')}
              className={`pb-2 transition ${
                activeTab === 'SHIPPING'
                  ? 'border-b-2 border-[#C9A84C] text-[#C9A84C]'
                  : 'text-[#6B6B6B] hover:text-[#2D2D2D]'
              }`}
            >
              Returns Policy
            </button>
          </div>

          <div className="py-4 text-xs text-[#2D2D2D] leading-relaxed">
            {activeTab === 'DETAILS' && (
              <div className="grid grid-cols-2 gap-y-2">
                <div>
                  <span className="text-[#6B6B6B]">Material:</span>{' '}
                  <strong>{product.material || 'Premium Alloy'}</strong>
                </div>
                <div>
                  <span className="text-[#6B6B6B]">Colour:</span>{' '}
                  <strong>{product.colour || 'Silver Tone'}</strong>
                </div>
                <div>
                  <span className="text-[#6B6B6B]">Style:</span>{' '}
                  <strong>{product.style || 'Ethnic Traditional'}</strong>
                </div>
                <div>
                  <span className="text-[#6B6B6B]">Weight:</span>{' '}
                  <strong>{product.weight || 'Standard'}</strong>
                </div>
              </div>
            )}

            {activeTab === 'CARE' && (
              <ul className="list-disc pl-4 space-y-1 text-[#6B6B6B]">
                <li>Keep away from direct water, perfumes, soaps, and hair sprays.</li>
                <li>Store in an airtight ziplock pouch with a piece of cotton.</li>
                <li>Gently wipe with a soft dry cloth after every wear to preserve lustre.</li>
              </ul>
            )}

            {activeTab === 'SHIPPING' && (
              <p className="text-[#6B6B6B]">
                Hassle-free 7-day return and replacement policy. Eligible for return if undamaged and in original packaging. Contact support@kalavies.com with order details.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
