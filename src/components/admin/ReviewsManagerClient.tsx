'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Star,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Trash2,
  Search,
  Filter,
  Check,
  AlertCircle,
  ExternalLink,
  Loader2,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react'

interface ReviewItem {
  id: string
  rating: number
  title: string | null
  comment: string | null
  customerName: string | null
  customerEmail: string | null
  isVerified: boolean
  isApproved: boolean
  createdAt: string
  product: {
    id: string
    name: string
    slug: string
    sku: string
    images: { url: string }[]
  }
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  } | null
}

interface SummaryStats {
  total: number
  pending: number
  approved: number
}

interface Props {
  initialReviews: ReviewItem[]
  initialSummary: SummaryStats
}

export default function ReviewsManagerClient({
  initialReviews,
  initialSummary,
}: Props) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews)
  const [summary, setSummary] = useState<SummaryStats>(initialSummary)
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Toggle review approval (Show on Website vs Hide)
  const handleToggleApproval = async (reviewId: string, currentApproved: boolean) => {
    setUpdatingId(reviewId)
    const newApprovedState = !currentApproved

    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: newApprovedState }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update review status')
      }

      // Update local state
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, isApproved: newApprovedState } : r))
      )
      setSummary((prev) => ({
        ...prev,
        pending: newApprovedState ? Math.max(0, prev.pending - 1) : prev.pending + 1,
        approved: newApprovedState ? prev.approved + 1 : Math.max(0, prev.approved - 1),
      }))

      showToast(
        newApprovedState
          ? 'Review approved! It is now live on the main website.'
          : 'Review hidden from the main website.'
      )
    } catch (err: any) {
      showToast(err.message || 'Error updating review', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  // Delete review
  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review permanently?')) {
      return
    }

    setDeletingId(reviewId)
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete review')
      }

      const target = reviews.find((r) => r.id === reviewId)
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
      setSummary((prev) => ({
        total: Math.max(0, prev.total - 1),
        pending: target && !target.isApproved ? Math.max(0, prev.pending - 1) : prev.pending,
        approved: target && target.isApproved ? Math.max(0, prev.approved - 1) : prev.approved,
      }))

      showToast('Review deleted successfully.')
    } catch (err: any) {
      showToast(err.message || 'Error deleting review', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    if (activeTab === 'PENDING' && r.isApproved) return false
    if (activeTab === 'APPROVED' && !r.isApproved) return false

    if (search.trim()) {
      const q = search.toLowerCase()
      const matchesText =
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.comment && r.comment.toLowerCase().includes(q)) ||
        (r.customerName && r.customerName.toLowerCase().includes(q)) ||
        (r.customerEmail && r.customerEmail.toLowerCase().includes(q)) ||
        r.product.name.toLowerCase().includes(q) ||
        r.product.sku.toLowerCase().includes(q)
      if (!matchesText) return false
    }

    return true
  })

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl transition animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2D2D2D]">
            Customer Reviews & Moderation
          </h1>
          <p className="text-sm text-[#6B6B6B]">
            Review, approve, or hide customer testimonials before they appear live on the storefront.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E8E3DC] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">
              Total Reviews
            </span>
            <span className="rounded-lg bg-gray-100 p-2 text-[#2D2D2D]">
              <MessageSquare size={18} />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#2D2D2D]">{summary.total}</div>
          <p className="mt-1 text-xs text-[#6B6B6B]">Submitted across catalogue</p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Pending Approval
            </span>
            <span className="rounded-lg bg-amber-100 p-2 text-amber-800">
              <EyeOff size={18} />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-900">{summary.pending}</div>
          <p className="mt-1 text-xs text-amber-700">Awaiting your approval to publish</p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Live on Website
            </span>
            <span className="rounded-lg bg-emerald-100 p-2 text-emerald-800">
              <Eye size={18} />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-900">{summary.approved}</div>
          <p className="mt-1 text-xs text-emerald-700">Visible to all store visitors</p>
        </div>
      </div>

      {/* Filters and Tabs */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#E8E3DC] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] p-1">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`rounded-md px-4 py-1.5 text-xs font-bold transition ${
              activeTab === 'ALL'
                ? 'bg-white text-[#2D2D2D] shadow-xs'
                : 'text-[#6B6B6B] hover:text-[#2D2D2D]'
            }`}
          >
            All ({summary.total})
          </button>
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-bold transition ${
              activeTab === 'PENDING'
                ? 'bg-white text-amber-900 shadow-xs'
                : 'text-[#6B6B6B] hover:text-amber-800'
            }`}
          >
            Pending
            {summary.pending > 0 && (
              <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-extrabold text-white">
                {summary.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`rounded-md px-4 py-1.5 text-xs font-bold transition ${
              activeTab === 'APPROVED'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-[#6B6B6B] hover:text-emerald-800'
            }`}
          >
            Approved ({summary.approved})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews or products..."
            className="w-full rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] py-2 pl-9 pr-4 text-xs focus:border-[#C9A84C] focus:outline-none"
          />
          <Search className="absolute left-3 top-2.5 text-[#6B6B6B]" size={15} />
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="rounded-xl border border-[#E8E3DC] bg-white p-12 text-center text-[#6B6B6B]">
            <Star className="mx-auto h-8 w-8 text-[#C9A84C] opacity-40 mb-3" />
            <h3 className="text-base font-semibold text-[#2D2D2D]">No reviews found</h3>
            <p className="mt-1 text-xs">
              {search ? 'Try clearing your search query' : 'No customer reviews in this tab yet.'}
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => {
            const isUpdating = updatingId === review.id
            const isDeleting = deletingId === review.id
            const reviewerName =
              review.customerName ||
              (review.user
                ? `${review.user.firstName} ${review.user.lastName}`.trim()
                : 'Customer')

            return (
              <div
                key={review.id}
                className={`rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                  review.isApproved
                    ? 'border-emerald-200/80 bg-white'
                    : 'border-amber-300 bg-amber-50/20'
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  {/* Left: Product & Customer & Review Info */}
                  <div className="space-y-3 flex-1 min-w-0">
                    {/* Product Header */}
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] overflow-hidden flex items-center justify-center">
                        {review.product.images[0]?.url ? (
                          <img
                            src={review.product.images[0].url}
                            alt={review.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-[#C9A84C]">KLV</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/products/${review.product.id}`}
                            className="text-xs font-bold text-[#2D2D2D] hover:text-[#C9A84C] truncate"
                          >
                            {review.product.name}
                          </Link>
                          <Link
                            href={`/products/${review.product.slug}`}
                            target="_blank"
                            title="View on storefront"
                            className="text-[#6B6B6B] hover:text-[#2D2D2D]"
                          >
                            <ExternalLink size={12} />
                          </Link>
                        </div>
                        <p className="text-[11px] text-[#6B6B6B]">SKU: {review.product.sku}</p>
                      </div>
                    </div>

                    {/* Stars & Title */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={
                              i < review.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300'
                            }
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-[#2D2D2D]">
                        {review.rating}.0 / 5.0
                      </span>
                      {review.title && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs font-semibold text-[#2D2D2D]">
                            "{review.title}"
                          </span>
                        </>
                      )}
                    </div>

                    {/* Review Body */}
                    <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed whitespace-pre-line bg-[#FAF8F5] rounded-lg p-3 border border-[#E8E3DC]">
                      {review.comment}
                    </p>

                    {/* Customer Meta */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6B6B6B]">
                      <span className="font-semibold text-[#2D2D2D]">{reviewerName}</span>
                      {review.customerEmail && (
                        <span>({review.customerEmail})</span>
                      )}
                      {review.isVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 border border-emerald-200">
                          <ShieldCheck size={12} /> Verified Buyer
                        </span>
                      )}
                      <span>•</span>
                      <span>{new Date(review.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}</span>
                    </div>
                  </div>

                  {/* Right: Actions & Moderation Status */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 border-t md:border-t-0 pt-3 md:pt-0 shrink-0">
                    {/* Status Badge */}
                    <div>
                      {review.isApproved ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                          <Eye size={13} /> Live on Website
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                          <EyeOff size={13} /> Hidden from Website
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleApproval(review.id, review.isApproved)}
                        disabled={isUpdating || isDeleting}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 ${
                          review.isApproved
                            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {isUpdating ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : review.isApproved ? (
                          <>
                            <EyeOff size={14} /> Hide
                          </>
                        ) : (
                          <>
                            <Check size={14} /> Show on Website
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={isUpdating || isDeleting}
                        title="Delete review permanently"
                        className="rounded-lg border border-red-200 bg-white p-2 text-red-600 hover:bg-red-50 hover:text-red-800 transition cursor-pointer disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
