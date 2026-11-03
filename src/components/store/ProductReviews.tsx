'use client'

import { useState, useEffect } from 'react'
import {
  Star,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  Loader2,
  X,
  ChevronDown,
} from 'lucide-react'

interface ReviewItem {
  id: string
  rating: number
  title: string | null
  comment: string | null
  customerName: string
  isVerified: boolean
  createdAt: string
}

interface ProductReviewsProps {
  productSlug: string
  productName: string
  initialAvgRating: number
  initialReviewCount: number
}

const RATING_LABELS: Record<number, string> = {
  5: '5 - Excellent, Loved it!',
  4: '4 - Very Good, High Quality',
  3: '3 - Good, Met Expectations',
  2: '2 - Fair, Could Be Better',
  1: '1 - Poor, Not Satisfied',
}

export default function ProductReviews({
  productSlug,
  productName,
  initialAvgRating,
  initialReviewCount,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [stats, setStats] = useState({
    avgRating: initialAvgRating || 0,
    reviewCount: initialReviewCount || 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form states
  const [formRating, setFormRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [formTitle, setFormTitle] = useState('')
  const [formComment, setFormComment] = useState('')
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  // Fetch approved reviews for this product
  useEffect(() => {
    let isMounted = true
    async function loadReviews() {
      try {
        const res = await fetch(`/api/products/${productSlug}/reviews`)
        if (res.ok) {
          const data = await res.json()
          if (isMounted && data.success) {
            setReviews(data.reviews || [])
            if (data.stats) {
              setStats(data.stats)
            }
          }
        }
      } catch (err) {
        console.error('Failed to load product reviews:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadReviews()
    return () => {
      isMounted = false
    }
  }, [productSlug])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    if (!formComment.trim()) {
      setFormError('Please enter a review message.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: formRating,
          title: formTitle.trim() || undefined,
          comment: formComment.trim(),
          customerName: formName.trim() || undefined,
          customerEmail: formEmail.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review.')
      }

      setFormSuccess(
        'Thank you! Your review has been submitted for moderation and will appear on the website once approved by our team.'
      )
      // Reset form
      setFormTitle('')
      setFormComment('')
      setFormRating(5)
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while submitting your review.')
    } finally {
      setSubmitting(false)
    }
  }

  const activeStarCount = hoverRating || formRating

  return (
    <section id="customer-reviews" className="mt-16 pt-12 border-t border-[#E8E3DC]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
            Verified Customer Feedback
          </span>
          <h2
            className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A] mt-1"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Ratings & Reviews
          </h2>
        </div>

        <button
          onClick={() => {
            setFormSuccess(null)
            setFormError(null)
            setIsModalOpen(true)
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2D2D2D] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-black transition cursor-pointer self-start md:self-auto"
        >
          <Sparkles size={16} className="text-[#C9A84C]" />
          Write a Review
        </button>
      </div>

      {/* Rating Breakdown & Highlights Box */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 rounded-2xl border border-[#E8E3DC] bg-[#FAF8F5] p-6 sm:p-8">
        {/* Score Summary */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-[#E8E3DC] pb-6 md:pb-0 md:pr-6">
          <div className="text-5xl sm:text-6xl font-black text-[#1A1A1A]">
            {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '5.0'}
          </div>
          <div className="flex items-center gap-1 my-2 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={20}
                className={
                  i < Math.round(stats.avgRating || 5)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300'
                }
              />
            ))}
          </div>
          <p className="text-xs font-semibold text-[#6B6B6B]">
            Based on {stats.reviewCount} customer review{stats.reviewCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Rating Distribution Bars */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-2.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.distribution[star as 1 | 2 | 3 | 4 | 5] || 0
            const percentage = stats.reviewCount > 0 ? Math.round((count / stats.reviewCount) * 100) : star === 5 ? 100 : 0

            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-[#2D2D2D] flex items-center gap-1">
                  {star} <Star size={12} className="fill-amber-400 text-amber-400 inline" />
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-[#E8E3DC] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#C9A84C] transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-10 text-right text-[#6B6B6B] font-medium">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-[#6B6B6B]">
            <Loader2 size={24} className="animate-spin text-[#C9A84C]" />
            <span className="ml-2 text-xs">Loading reviews...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E8E3DC] bg-white p-12 text-center">
            <MessageSquare size={32} className="mx-auto text-[#C9A84C] opacity-50 mb-3" />
            <h3 className="text-base font-bold text-[#2D2D2D]">No customer reviews yet</h3>
            <p className="text-xs text-[#6B6B6B] mt-1 max-w-md mx-auto">
              Be the first to share your thoughts on this handcrafted piece! Click "Write a Review" above to review this product.
            </p>
          </div>
        ) : (
          reviews.map((rev) => {
            const initials = rev.customerName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)

            return (
              <div
                key={rev.id}
                className="rounded-2xl border border-[#E8E3DC] bg-white p-5 sm:p-6 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-[#FAF8F5] border border-[#C9A84C]/30 flex items-center justify-center font-bold text-xs text-[#C9A84C]">
                      {initials || 'KL'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#2D2D2D]">
                          {rev.customerName}
                        </span>
                        {rev.isVerified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                            <ShieldCheck size={11} /> Verified Buyer
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              className={
                                i < rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-200'
                              }
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-[#8C8C8C]">•</span>
                        <span className="text-[11px] text-[#8C8C8C]">
                          {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {rev.title && (
                  <h4 className="text-sm font-bold text-[#2D2D2D]">
                    {rev.title}
                  </h4>
                )}

                <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed whitespace-pre-line">
                  {rev.comment}
                </p>
              </div>
            )
          })
        )}
      </div>

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#E8E3DC] max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition"
            >
              <X size={20} />
            </button>

            <div className="mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C9A84C]">
                Share Your Experience
              </span>
              <h3
                className="text-xl font-bold text-[#2D2D2D] mt-0.5"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Write a Review for {productName}
              </h3>
            </div>

            {formSuccess ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center space-y-3">
                <CheckCircle2 size={40} className="mx-auto text-emerald-600" />
                <h4 className="text-base font-bold text-emerald-900">Review Submitted!</h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  {formSuccess}
                </p>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg bg-emerald-700 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {formError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Star Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2D2D] mb-1.5">
                    Your Rating *
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 hover:scale-110 transition cursor-pointer text-amber-400"
                      >
                        <Star
                          size={28}
                          className={
                            star <= activeStarCount
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          }
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-semibold text-[#6B6B6B]">
                      {RATING_LABELS[activeStarCount] || ''}
                    </span>
                  </div>
                </div>

                {/* Review Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2D2D] mb-1">
                    Headline / Summary (Optional)
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Stunning craftsmanship and finish!"
                    className="w-full rounded-xl border border-[#E8E3DC] bg-[#FAF8F5] px-3.5 py-2.5 text-xs focus:border-[#C9A84C] focus:outline-none"
                  />
                </div>

                {/* Review Body */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2D2D] mb-1">
                    Review Details *
                  </label>
                  <textarea
                    rows={4}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Tell us what you loved about this jewellery piece..."
                    required
                    className="w-full rounded-xl border border-[#E8E3DC] bg-[#FAF8F5] p-3 text-xs focus:border-[#C9A84C] focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2D2D] mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Ritika M."
                      className="w-full rounded-xl border border-[#E8E3DC] bg-[#FAF8F5] px-3.5 py-2.5 text-xs focus:border-[#C9A84C] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2D2D] mb-1">
                      Email Address (Private)
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="For verified purchase check"
                      className="w-full rounded-xl border border-[#E8E3DC] bg-[#FAF8F5] px-3.5 py-2.5 text-xs focus:border-[#C9A84C] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-800 border border-amber-200 flex items-start gap-1.5">
                  <ShieldCheck size={14} className="shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    To ensure authenticity, all reviews undergo admin review before going live.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-[#E8E3DC] bg-white px-4 py-2.5 text-xs font-bold text-[#6B6B6B] hover:bg-gray-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#C9A84C] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#B8963B] transition disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
