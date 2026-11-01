'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  QrCode,
  Upload,
  Save,
  Check,
  AlertCircle,
  Eye,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Loader2,
} from 'lucide-react'

interface PaymentSettingsFormProps {
  initialSetting: {
    id?: string
    qrImageUrl?: string
    upiId?: string
    payeeName?: string | null
    paymentInstructions?: string | null
    isActive?: boolean
  }
}

export default function PaymentSettingsForm({ initialSetting }: PaymentSettingsFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    qrImageUrl: initialSetting.qrImageUrl || '',
    upiId: initialSetting.upiId || 'kalavies@upi',
    payeeName: initialSetting.payeeName || 'KALAVIES Jewellery',
    paymentInstructions:
      initialSetting.paymentInstructions ||
      'Scan the QR code with any UPI app (Google Pay, PhonePe, Paytm, BHIM, Cred). Complete the payment of exact order amount, then copy the 12-digit UTR reference number and upload your screenshot below.',
    isActive: typeof initialSetting.isActive === 'boolean' ? initialSetting.isActive : true,
  })

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, WebP)')
      return
    }

    setUploading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('folder', 'payment-qr')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to upload QR code image')

      setFormData((prev) => ({ ...prev, qrImageUrl: data.url }))
    } catch (err: any) {
      setError(err.message || 'QR upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMsg('')

    try {
      const res = await fetch('/api/admin/settings/payment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save payment settings')

      setMsg('UPI QR payment settings saved successfully!')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  // Backup dynamic QR preview for admin preview
  const previewDeepLink = `upi://pay?pa=${encodeURIComponent(
    formData.upiId
  )}&pn=${encodeURIComponent(formData.payeeName || 'KALAVIES')}&am=100&cu=INR&tn=KALAVIES-PREVIEW`
  const dynamicPreviewQr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(
    previewDeepLink
  )}`
  const currentQrImage = formData.qrImageUrl || dynamicPreviewQr

  return (
    <div className="space-y-6">
      {/* Messages */}
      {msg && (
        <div className="rounded-xl bg-green-50 p-3.5 text-xs font-semibold text-green-800 border border-green-200 flex items-center gap-2">
          <Check size={16} /> {msg}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-800 border border-red-200 flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configuration Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E3DC]">
              <div className="flex items-center gap-2">
                <QrCode className="text-[#C9A84C]" size={20} />
                <h3 className="font-bold text-base text-[#2D2D2D]">
                  UPI QR Configuration
                </h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-[#C9A84C] text-[#C9A84C] focus:ring-[#C9A84C]"
                />
                <span className="text-xs font-bold text-[#2D2D2D]">
                  {formData.isActive ? 'Active on Checkout' : 'Disabled'}
                </span>
              </label>
            </div>

            {/* UPI ID */}
            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                Official Business UPI ID *
              </label>
              <input
                type="text"
                required
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value.trim() })}
                placeholder="e.g. kalavies@icici / kalavies@okhdfcbank"
                className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm font-mono focus:border-[#C9A84C] focus:outline-none"
              />
              <p className="text-[11px] text-[#6B6B6B] mt-1">
                The exact VPA / UPI address where customer funds are received.
              </p>
            </div>

            {/* Payee Name */}
            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                Payee / Beneficiary Name
              </label>
              <input
                type="text"
                value={formData.payeeName || ''}
                onChange={(e) => setFormData({ ...formData, payeeName: e.target.value })}
                placeholder="e.g. KALAVIES Jewellery"
                className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
              />
              <p className="text-[11px] text-[#6B6B6B] mt-1">
                Displayed to customers so they can verify the name in their UPI app before paying.
              </p>
            </div>

            {/* Upload QR Image */}
            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                Upload UPI QR Code Image
              </label>

              {formData.qrImageUrl ? (
                <div className="rounded-xl border border-[#E8E3DC] bg-[#FAF8F5] p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={formData.qrImageUrl}
                      alt="Active QR Code"
                      className="h-16 w-16 object-contain rounded-lg border border-[#E8E3DC] bg-white p-1"
                    />
                    <div>
                      <p className="text-xs font-bold text-emerald-800">Custom QR Code Uploaded</p>
                      <a
                        href={formData.qrImageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        View Full Image <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, qrImageUrl: '' })}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                    title="Remove QR code"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#E8E3DC] rounded-xl hover:border-[#C9A84C] bg-[#FAF8F5] cursor-pointer transition">
                  <Upload className="w-6 h-6 text-[#C9A84C] mb-1" />
                  <span className="text-xs font-semibold text-[#2D2D2D]">
                    {uploading ? 'Uploading...' : 'Click to upload your Bank UPI QR code'}
                  </span>
                  <span className="text-[10px] text-[#6B6B6B] mt-0.5">
                    PNG, JPG or WebP (e.g. from Google Pay for Business, PhonePe Business, BharatPe)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Payment Instructions */}
            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                Customer Payment Instructions
              </label>
              <textarea
                rows={3}
                value={formData.paymentInstructions || ''}
                onChange={(e) => setFormData({ ...formData, paymentInstructions: e.target.value })}
                className="w-full rounded-lg border border-[#E8E3DC] p-3 text-xs focus:border-[#C9A84C] focus:outline-none"
              />
              <p className="text-[11px] text-[#6B6B6B] mt-1">
                Visible to customers during checkout and on the payment page.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving || uploading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C9A84C] px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-[#B8963B] transition disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving Settings...
                  </>
                ) : (
                  <>
                    <Save size={14} /> Save Payment Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Customer Checkout Live Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E3DC]">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-[#6B6B6B]" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#6B6B6B]">
                  Customer Checkout Preview
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-[#C9A84C]">
                What Customers See
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-5 bg-[#FAF8F5] rounded-xl border border-[#E8E3DC] text-center space-y-3">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-[#C9A84C] max-w-[200px] max-h-[200px]">
                <img
                  src={currentQrImage}
                  alt="Customer Preview"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <p className="text-xs font-bold text-[#2D2D2D]">{formData.payeeName || 'KALAVIES Jewellery'}</p>
                <p className="text-xs font-mono font-semibold text-[#C9A84C] mt-0.5">
                  {formData.upiId}
                </p>
              </div>

              <div className="w-full pt-1 border-t border-[#E8E3DC] text-left">
                <p className="text-[11px] text-[#6B6B6B] leading-relaxed line-clamp-3">
                  {formData.paymentInstructions}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-amber-50/70 p-3 border border-amber-200/60 text-[11px] text-amber-900 flex items-start gap-2">
              <ShieldCheck size={16} className="text-[#C9A84C] shrink-0 mt-0.5" />
              <div>
                <strong>Manual Bank Verification:</strong> Orders will enter <em>PAYMENT_VERIFICATION</em> upon submission. You will verify bank credits in the <strong>Payment Verification</strong> dashboard before confirming orders.
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
