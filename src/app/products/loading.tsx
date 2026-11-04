export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-3 mb-8">
        <div className="h-4 w-40 bg-[#E8E3DC] rounded-md" />
        <div className="h-8 w-64 bg-[#E8E3DC] rounded-lg" />
        <div className="h-4 w-96 max-w-full bg-[#E8E3DC]/60 rounded-md" />
      </div>

      {/* Screen Loader Central Pill */}
      <div className="flex items-center justify-center my-6">
        <div className="inline-flex items-center gap-3 rounded-full border border-[#C9A84C]/30 bg-[#FAF8F5] px-6 py-2.5 shadow-sm">
          <div className="h-4 w-4 rounded-full border-2 border-[#C9A84C]/30 border-t-[#C9A84C] animate-spin" />
          <span className="text-xs font-bold text-[#C9A84C] tracking-wide">
            Loading Jewellery Collection...
          </span>
        </div>
      </div>

      {/* Filter tabs skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
        {[80, 96, 110, 90, 100].map((w, i) => (
          <div
            key={i}
            className="h-8 rounded-full bg-[#E8E3DC] shrink-0"
            style={{ width: `${w}px` }}
          />
        ))}
      </div>

      {/* Grid of product card skeletons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#E8E3DC] bg-white p-3 space-y-3"
          >
            <div className="aspect-square w-full rounded-xl bg-[#FAF8F5] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
            </div>
            <div className="h-3 w-16 bg-[#E8E3DC] rounded" />
            <div className="h-4 w-full bg-[#E8E3DC] rounded" />
            <div className="h-4 w-20 bg-[#E8E3DC] rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
