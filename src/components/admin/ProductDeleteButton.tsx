'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react'

interface ProductDeleteButtonProps {
  productId: string
  productName: string
  productSku: string
  productImage?: string | null
  onDeleted?: (productId: string) => void
}

export default function ProductDeleteButton({
  productId,
  productName,
  productSku,
  productImage,
  onDeleted,
}: ProductDeleteButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setError(null)
    setFeedback(null)
    setIsOpen(true)
  }

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (loading) return
    setIsOpen(false)
    setError(null)
    setFeedback(null)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete product. Please try again.')
      }

      setFeedback(data.message || 'Product deleted successfully.')

      // Trigger callback if provided
      if (onDeleted) {
        onDeleted(productId)
      }

      // Short delay so admin sees confirmation, then refresh
      setTimeout(() => {
        setIsOpen(false)
        router.refresh()
      }, 900)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while deleting the product.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Delete Trigger Button */}
      <button
        type="button"
        onClick={handleOpen}
        title="Delete product"
        className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
      >
        <Trash2 size={16} />
      </button>

      {/* Confirmation Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#E8E3DC] transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Icon */}
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2D2D2D]">Move Product to Trash</h3>
                <p className="mt-1 text-xs text-[#6B6B6B]">
                  Move this product to the Trash Folder. You can restore it anytime within 24 hours before automatic permanent deletion.
                </p>
              </div>
            </div>

            {/* Product Card Details */}
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#E8E3DC] bg-[#FAF8F5] p-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#E8E3DC] bg-white flex items-center justify-center">
                {productImage ? (
                  <img src={productImage} alt={productName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs font-semibold text-[#C9A84C]">KLV</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-[#2D2D2D] truncate">{productName}</h4>
                <p className="text-xs text-[#8C827A] font-mono">SKU: {productSku}</p>
              </div>
            </div>

            {/* Notification Messages */}
            {error && (
              <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                {error}
              </div>
            )}

            {feedback && (
              <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="rounded-lg border border-[#E8E3DC] bg-white px-4 py-2 text-xs font-semibold text-[#2D2D2D] hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Moving to Trash...
                  </>
                ) : (
                  'Move to Trash'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
