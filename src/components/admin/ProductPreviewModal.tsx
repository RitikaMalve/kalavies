'use client'

import { useState } from 'react'
import { X, Eye, CheckCircle2, ShieldCheck, Truck, Sparkles, Heart } from 'lucide-react'

interface ProductPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    name: string
    sku: string
    mrp: number
    sellingPrice: number
    discountPercent: number
    description?: string
    detailedContent?: string
    material?: string
    colour?: string
    weight?: string
    totalStock?: number
    images: string[]
    collectionName?: string
    status: string
  }
}

export default function ProductPreviewModal({
  isOpen,
  onClose,
  product,
}: ProductPreviewModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  if (!isOpen) return null

  const displayImages =
    product.images && product.images.length > 0
      ? product.images
      : ['/images/products/placeholder-1.jpg']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl my-8 rounded-2xl bg-white shadow-2xl overflow-hidden border border-[#E8E3DC]">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#E8E3DC] px-6 py-4 bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-[#C9A84C]" />
            <h3 className="font-bold text-base text-[#2D2D2D]">Storefront Preview</h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                product.status === 'PUBLISHED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {product.status === 'PUBLISHED' ? 'Will Be Published Live' : 'Draft Preview'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6B6B6B] hover:bg-gray-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Product Layout */}
        <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Images */}
            <div className="space-y-4">
              <div className="relative aspect-square w-full rounded-2xl border border-[#E8E3DC] overflow-hidden bg-[#FAF8F5] flex items-center justify-center shadow-sm">
                <img
                  src={displayImages[selectedImageIndex] || displayImages[0]}
                  alt={product.name || 'Product Preview'}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                {product.discountPercent > 0 && (
                  <span className="absolute top-3 left-3 rounded-full bg-[#C9A84C] px-2.5 py-1 text-xs font-bold text-white shadow">
                    {product.discountPercent}% OFF
                  </span>
                )}
                <div className="absolute top-3 right-3 rounded-full bg-white/90 p-2 shadow-sm text-gray-400">
                  <Heart size={16} />
                </div>
              </div>

              {/* Thumbnails */}
              {displayImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {displayImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImageIndex(i)}
                      className={`relative h-16 w-16 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                        selectedImageIndex === i
                          ? 'border-[#C9A84C] ring-2 ring-[#C9A84C]/30'
                          : 'border-[#E8E3DC] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase font-bold tracking-widest text-[#C9A84C]">
                  {product.collectionName || 'KALAVIES OXIDISED'}
                </p>
                <h1 className="text-2xl font-bold text-[#2D2D2D] mt-1 font-serif">
                  {product.name || 'Untitled Jewellery Piece'}
                </h1>
                <p className="text-xs font-mono text-[#8C827A] mt-1">
                  SKU: {product.sku || 'KLV-AOX-001'}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E3DC]">
                <span className="text-2xl font-bold text-[#2D2D2D]">
                  ₹{(product.sellingPrice || 0).toLocaleString('en-IN')}
                </span>
                {product.mrp > (product.sellingPrice || 0) && (
                  <span className="text-sm text-[#8C827A] line-through">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                )}
                {product.discountPercent > 0 && (
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                    Save {product.discountPercent}%
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={14} />
                <span>In Stock ({product.totalStock ?? 25} available units)</span>
              </div>

              {/* Short Description */}
              {product.description && (
                <div className="text-sm text-[#6B6B6B] leading-relaxed border-t border-[#E8E3DC] pt-3">
                  {product.description}
                </div>
              )}

              {/* Jewellery Specs */}
              <div className="grid grid-cols-3 gap-2 border-t border-b border-[#E8E3DC] py-3 text-xs">
                <div>
                  <span className="text-[#8C827A] block">Material:</span>
                  <span className="font-semibold text-[#2D2D2D]">{product.material || 'Oxidised Silver'}</span>
                </div>
                <div>
                  <span className="text-[#8C827A] block">Colour:</span>
                  <span className="font-semibold text-[#2D2D2D]">{product.colour || 'Silver'}</span>
                </div>
                <div>
                  <span className="text-[#8C827A] block">Weight:</span>
                  <span className="font-semibold text-[#2D2D2D]">{product.weight || '25g'}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-[#6B6B6B]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#C9A84C]" />
                  <span>100% Genuine Quality</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-[#C9A84C]" />
                  <span>Free Express Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E8E3DC] bg-[#FAF8F5] px-6 py-3.5 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#2D2D2D] px-5 py-2 text-xs font-bold text-white hover:bg-black transition"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  )
}
