export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="flex flex-col items-center justify-center rounded-3xl border border-[#E8E3DC] bg-white p-8 shadow-xl max-w-xs w-full text-center space-y-4">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-[#C9A84C]/20 border-t-[#C9A84C] animate-spin" />
          <span
            className="text-sm font-black text-[#C9A84C] tracking-widest"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            KLV
          </span>
        </div>
        <div>
          <h3
            className="text-sm font-bold text-[#1A1A1A] tracking-wider uppercase"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            KALAVIES Jewellery
          </h3>
          <p className="text-xs text-[#6B6B6B] mt-1">Loading collection...</p>
        </div>
      </div>
    </div>
  )
}
