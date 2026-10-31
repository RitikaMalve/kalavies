import Link from 'next/link'
import { WifiOff, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
      <div className="h-20 w-20 rounded-full bg-amber-50 text-[#C9A84C] flex items-center justify-center mb-6">
        <WifiOff size={36} />
      </div>
      <h1
        className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]"
        style={{ fontFamily: 'Playfair Display, serif' }}
      >
        You are currently offline
      </h1>
      <p className="text-xs sm:text-sm text-[#6B6B6B] max-w-sm mt-2 mb-8">
        Please check your internet connection to continue browsing our jewellery collections and live stock.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-[#C9A84C] px-6 py-3 text-xs font-bold text-white shadow hover:bg-[#B8963B] transition"
      >
        <RefreshCw size={15} /> Retry Connection
      </Link>
    </div>
  )
}
