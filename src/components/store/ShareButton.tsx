'use client'

import { useState, useRef, useEffect } from 'react'
import { Share2, Copy, Check, MessageCircle, X } from 'lucide-react'

interface ShareButtonProps {
  title: string
  url?: string
  text?: string
  imageUrl?: string
  variant?: 'icon' | 'bar' | 'compact'
  className?: string
}

export default function ShareButton({
  title,
  url,
  text,
  imageUrl,
  variant = 'icon',
  className = '',
}: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const shareUrl =
    typeof window !== 'undefined'
      ? url
        ? url.startsWith('http')
          ? url
          : `${window.location.origin}${url}`
        : window.location.href
      : url || ''

  const shareText =
    text || `Check out this gorgeous ${title} on KALAVIES Jewellery: ${shareUrl}`

  // Close dropdown on outside click or escape
  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        })
        return true
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setOpen(true)
        }
        return false
      }
    }
    setOpen((prev) => !prev)
    return false
  }

  const handleCopyLink = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        const input = document.createElement('input')
        input.value = shareUrl
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch (err) {
      console.error('Failed to copy share link:', err)
    }
  }

  const handleWhatsAppShare = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`
    window.open(waUrl, '_blank', 'noopener,noreferrer')
  }

  const handleFacebookShare = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(fbUrl, '_blank', 'noopener,noreferrer')
  }

  const handleTwitterShare = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`
    window.open(twUrl, '_blank', 'noopener,noreferrer')
  }

  // Bar variant: prominently displayed inline with quick actions
  if (variant === 'bar') {
    return (
      <div className={`flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl border border-[#E8E3DC] bg-[#FAF8F5]/80 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-[#C9A84C]/15 text-[#C9A84C] flex items-center justify-center">
            <Share2 size={14} />
          </div>
          <span className="text-xs font-semibold text-[#2D2D2D]">
            Share with friends & family
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Quick WhatsApp Share Button */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white px-3 py-1.5 text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer"
            title="Share on WhatsApp"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.82 2.791.82 3.181 0 5.768-2.587 5.768-5.766.001-3.181-2.585-5.766-5.768-5.766zm9.969 5.766c0 5.503-4.477 9.97-9.969 9.97-1.748 0-3.385-.45-4.821-1.237l-5.21 1.363 1.389-5.077c-.888-1.499-1.358-3.218-1.358-5.019 0-5.503 4.477-9.97 9.969-9.97 5.504 0 9.97 4.467 9.97 9.97z" />
            </svg>
            <span>WhatsApp</span>
          </button>

          {/* Quick Copy Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition active:scale-95 cursor-pointer ${
              copied
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-[#E8E3DC] bg-white text-[#2D2D2D] hover:border-[#C9A84C]'
            }`}
          >
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>
    )
  }

  // Icon / Compact variant with interactive popup
  return (
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleNativeShare()
        }}
        className={
          variant === 'compact'
            ? 'h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/90 hover:bg-white text-[#2D2D2D] hover:text-[#C9A84C] flex items-center justify-center shadow-xs transition active:scale-90'
            : 'h-10 w-10 rounded-full bg-white/90 hover:bg-white text-[#2D2D2D] hover:text-[#C9A84C] flex items-center justify-center shadow transition active:scale-95'
        }
        title="Share Product"
        aria-label="Share Product"
      >
        <Share2 size={variant === 'compact' ? 14 : 18} />
      </button>

      {/* Share Menu Popup */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-[#E8E3DC] bg-white p-3 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E8E3DC]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]">
              Share Jewellery
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[#6B6B6B] hover:text-black p-0.5 rounded-full hover:bg-gray-100"
            >
              <X size={14} />
            </button>
          </div>

          <div className="space-y-1 text-xs">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left font-semibold text-[#1A1A1A] hover:bg-emerald-50 hover:text-emerald-800 transition cursor-pointer"
            >
              <span className="h-6 w-6 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.82 2.791.82 3.181 0 5.768-2.587 5.768-5.766.001-3.181-2.585-5.766-5.768-5.766zm9.969 5.766c0 5.503-4.477 9.97-9.969 9.97-1.748 0-3.385-.45-4.821-1.237l-5.21 1.363 1.389-5.077c-.888-1.499-1.358-3.218-1.358-5.019 0-5.503 4.477-9.97 9.969-9.97 5.504 0 9.97 4.467 9.97 9.97z" />
                </svg>
              </span>
              <span>Share on WhatsApp</span>
            </button>

            {/* Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left font-semibold transition cursor-pointer ${
                copied
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-[#1A1A1A] hover:bg-amber-50 hover:text-[#C9A84C]'
              }`}
            >
              <span className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                copied ? 'bg-emerald-600 text-white' : 'bg-[#FAF8F5] text-[#C9A84C] border border-[#C9A84C]/30'
              }`}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
              </span>
              <span>{copied ? 'Link Copied!' : 'Copy Direct Link'}</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={handleFacebookShare}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left font-medium text-[#6B6B6B] hover:bg-blue-50 hover:text-[#1877F2] transition cursor-pointer"
            >
              <span className="h-6 w-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-xs text-[10px] font-bold">
                f
              </span>
              <span>Facebook</span>
            </button>

            {/* Twitter / X */}
            <button
              type="button"
              onClick={handleTwitterShare}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left font-medium text-[#6B6B6B] hover:bg-gray-100 hover:text-black transition cursor-pointer"
            >
              <span className="h-6 w-6 rounded-full bg-black text-white flex items-center justify-center shrink-0 shadow-xs text-[10px] font-bold">
                𝕏
              </span>
              <span>Share on X</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
