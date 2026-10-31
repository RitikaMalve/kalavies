'use client'

import { useState, useRef, useEffect } from 'react'
import { X, ZoomIn, ZoomOut, RotateCw, Crop, Maximize, Check } from 'lucide-react'

interface ImageCropModalProps {
  imageSrc: string
  fileName: string
  isOpen: boolean
  onClose: () => void
  onApply: (croppedBlob: Blob, previewUrl: string) => void
  aspectRatio?: 'square' | 'banner'
}

export default function ImageCropModal({
  imageSrc,
  fileName,
  isOpen,
  onClose,
  onApply,
  aspectRatio = 'square',
}: ImageCropModalProps) {
  const isBanner = aspectRatio === 'banner'
  const previewW = isBanner ? 560 : 500
  const previewH = isBanner ? 210 : 500
  const targetW = isBanner ? 1920 : 1000
  const targetH = isBanner ? 720 : 1000

  const [mode, setMode] = useState<'crop' | 'fit'>('crop')
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0) // 0, 90, 180, 270
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [processing, setProcessing] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  // Load image
  useEffect(() => {
    if (!imageSrc) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imageSrc
    img.onload = () => {
      imgRef.current = img
      setZoom(1)
      setRotation(0)
      setOffset({ x: 0, y: 0 })
      renderCanvas()
    }
  }, [imageSrc])

  // Re-render when controls change
  useEffect(() => {
    renderCanvas()
  }, [mode, zoom, rotation, offset, isBanner])

  const renderCanvas = () => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = previewW
    canvas.height = previewH

    // Clear background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, previewW, previewH)

    ctx.save()
    ctx.translate(previewW / 2 + offset.x, previewH / 2 + offset.y)
    ctx.rotate((rotation * Math.PI) / 180)

    const isRotated90or270 = rotation % 180 !== 0
    const imgW = isRotated90or270 ? img.height : img.width
    const imgH = isRotated90or270 ? img.width : img.height

    let renderW = previewW
    let renderH = previewH

    if (mode === 'crop') {
      const scale = Math.max(previewW / imgW, previewH / imgH) * zoom
      renderW = img.width * scale
      renderH = img.height * scale
    } else {
      const scale = Math.min(previewW / imgW, previewH / imgH) * zoom
      renderW = img.width * scale
      renderH = img.height * scale
    }

    ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH)
    ctx.restore()
  }

  // Mouse & Touch Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    })
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  // Generate final high-res 1000x1000 output
  const handleApply = async () => {
    const img = imgRef.current
    if (!img) return

    setProcessing(true)

    try {
      const outputCanvas = document.createElement('canvas')
      outputCanvas.width = targetW
      outputCanvas.height = targetH
      const ctx = outputCanvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context failed')

      // White background
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, targetW, targetH)

      ctx.save()
      const scaleFactorX = targetW / previewW
      const scaleFactorY = targetH / previewH
      ctx.translate(targetW / 2 + offset.x * scaleFactorX, targetH / 2 + offset.y * scaleFactorY)
      ctx.rotate((rotation * Math.PI) / 180)

      const isRotated90or270 = rotation % 180 !== 0
      const imgW = isRotated90or270 ? img.height : img.width
      const imgH = isRotated90or270 ? img.width : img.height

      let renderW = targetW
      let renderH = targetH

      if (mode === 'crop') {
        const scale = Math.max(targetW / imgW, targetH / imgH) * zoom
        renderW = img.width * scale
        renderH = img.height * scale
      } else {
        const scale = Math.min(targetW / imgW, targetH / imgH) * zoom
        renderW = img.width * scale
        renderH = img.height * scale
      }

      ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH)
      ctx.restore()

      // Convert to WebP blob (optimized for performance)
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            const previewUrl = URL.createObjectURL(blob)
            onApply(blob, previewUrl)
          }
          setProcessing(false)
        },
        'image/webp',
        isBanner ? 0.83 : 0.88
      )
    } catch (err) {
      console.error('Cropping error:', err)
      setProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
      <div className={`relative w-full ${isBanner ? 'max-w-xl' : 'max-w-lg'} rounded-2xl bg-white shadow-2xl overflow-hidden border border-[#E8E3DC]`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E3DC] px-5 py-3.5 bg-[#FAF8F5]">
          <div>
            <h3 className="font-bold text-base text-[#2D2D2D]">
              {isBanner ? 'Crop & Optimize Banner (1920 × 720 px)' : 'Crop & Fit Product Photo'}
            </h3>
            <p className="text-xs text-[#8C827A] truncate max-w-[300px]">
              {fileName} {isBanner ? '• Widescreen format' : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#6B6B6B] hover:bg-gray-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Selector: Crop vs Fit */}
        <div className="p-3 bg-amber-50/60 border-b border-amber-200/60 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMode('crop')
              setOffset({ x: 0, y: 0 })
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === 'crop'
                ? 'bg-[#C9A84C] text-white shadow-sm'
                : 'bg-white text-[#2D2D2D] border border-[#E8E3DC] hover:bg-gray-50'
            }`}
          >
            <Crop size={13} />
            <span>{isBanner ? 'Fill Widescreen Banner (16:6)' : 'Fill & Crop (1:1 Square)'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('fit')
              setOffset({ x: 0, y: 0 })
              setZoom(1)
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === 'fit'
                ? 'bg-[#C9A84C] text-white shadow-sm'
                : 'bg-white text-[#2D2D2D] border border-[#E8E3DC] hover:bg-gray-50'
            }`}
          >
            <Maximize size={13} />
            <span>{isBanner ? 'Fit Whole Photo (Clean Borders)' : 'Fit in Size (No Cut / Clean Border)'}</span>
          </button>
        </div>

        {/* Canvas Area with drag indicator */}
        <div className="p-4 flex flex-col items-center justify-center bg-[#F2EDE4]/40">
          <div
            className={`relative ${
              isBanner
                ? 'w-full max-w-[480px] h-[180px]'
                : 'w-[320px] h-[320px] sm:w-[360px] sm:h-[360px]'
            } rounded-xl overflow-hidden border-2 border-dashed border-[#C9A84C] bg-white shadow-inner cursor-grab active:cursor-grabbing flex items-center justify-center`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            <canvas ref={canvasRef} className="w-full h-full object-contain pointer-events-none" />

            {/* Guide Grid overlay */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-[#C9A84C]/30 opacity-40">
              <div className="border-r border-b border-[#C9A84C]/30"></div>
              <div className="border-r border-b border-[#C9A84C]/30"></div>
              <div className="border-b border-[#C9A84C]/30"></div>
              <div className="border-r border-b border-[#C9A84C]/30"></div>
              <div className="border-r border-b border-[#C9A84C]/30"></div>
              <div className="border-b border-[#C9A84C]/30"></div>
              <div className="border-r border-[#C9A84C]/30"></div>
              <div className="border-r border-[#C9A84C]/30"></div>
              <div></div>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-[#8C827A]">
            💡 Drag photo with mouse or finger to re-position inside square
          </p>
        </div>

        {/* Controls Toolbar: Zoom & Rotate */}
        <div className="px-5 py-3 border-t border-[#E8E3DC] bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <ZoomOut size={14} className="text-[#6B6B6B] shrink-0" />
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1.5 bg-[#E8E3DC] rounded-lg appearance-none cursor-pointer accent-[#C9A84C]"
            />
            <ZoomIn size={14} className="text-[#6B6B6B] shrink-0" />
            <span className="text-xs font-mono text-[#6B6B6B] w-9 text-right shrink-0">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <button
            type="button"
            onClick={handleRotate}
            className="flex items-center gap-1 rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] px-2.5 py-1.5 text-xs font-semibold text-[#2D2D2D] hover:bg-gray-100 transition shrink-0"
            title="Rotate 90 degrees"
          >
            <RotateCw size={13} />
            <span>Rotate</span>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#E8E3DC] bg-[#FAF8F5] px-5 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#6B6B6B] hover:text-[#2D2D2D] transition"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={processing}
            onClick={handleApply}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#C9A84C] px-5 py-2 text-xs font-bold text-white shadow hover:bg-[#B8963B] transition disabled:opacity-50"
          >
            <Check size={14} />
            <span>{processing ? 'Processing...' : 'Apply & Add Photo'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
