'use client'

import { useState } from 'react'
import { MapPin, Truck, FileText, Plus, Trash2, CheckCircle2, AlertCircle, Printer, Download } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface OrderItem {
  id: string
  productName: string
  sku: string
  quantity: number
  price: number
}

interface ExistingShipment {
  id: string
  shipmentNumber: string
  status: string
  courierName?: string | null
  trackingNumber?: string | null
  subtotal: number
  shippingCharge: number
  total: number
  orderAddress?: {
    recipientName: string
    recipientPhone: string
    addressLine1: string
    city: string
    state: string
    pincode: string
    label?: string | null
  } | null
  items: {
    quantity: number
    orderItem: {
      productName: string
      sku: string
    }
  }[]
  invoices?: {
    id: string
    invoiceNumber: string
  }[]
}

interface MultiAddressSplitManagerProps {
  orderId: string
  orderNumber: string
  items: OrderItem[]
  existingShipments: ExistingShipment[]
}

export default function MultiAddressSplitManager({
  orderId,
  orderNumber,
  items,
  existingShipments: initialShipments,
}: MultiAddressSplitManagerProps) {
  const [shipments, setShipments] = useState<ExistingShipment[]>(initialShipments || [])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Multi-destination form state
  const [destinations, setDestinations] = useState([
    {
      recipientName: '',
      recipientPhone: '',
      addressLine1: '',
      city: '',
      state: 'Karnataka',
      pincode: '',
      label: 'Destination 1',
      courierName: 'Blue Dart Express',
      shippingCharge: 0,
      itemAllocations: items.map((it) => ({
        orderItemId: it.id,
        productName: it.productName,
        sku: it.sku,
        maxQty: it.quantity,
        allocatedQty: 1,
      })),
    },
  ])

  const handleAddDestination = () => {
    setDestinations([
      ...destinations,
      {
        recipientName: '',
        recipientPhone: '',
        addressLine1: '',
        city: '',
        state: 'Maharashtra',
        pincode: '',
        label: `Destination ${destinations.length + 1}`,
        courierName: 'Blue Dart Express',
        shippingCharge: 0,
        itemAllocations: items.map((it) => ({
          orderItemId: it.id,
          productName: it.productName,
          sku: it.sku,
          maxQty: it.quantity,
          allocatedQty: 0,
        })),
      },
    ])
  }

  const handleRemoveDestination = (index: number) => {
    if (destinations.length <= 1) return
    setDestinations(destinations.filter((_, i) => i !== index))
  }

  const updateDestinationField = (index: number, field: string, value: any) => {
    const updated = [...destinations]
    ;(updated[index] as any)[field] = value
    setDestinations(updated)
  }

  const updateItemAllocation = (destIndex: number, itemIndex: number, qty: number) => {
    const updated = [...destinations]
    updated[destIndex].itemAllocations[itemIndex].allocatedQty = Math.max(0, qty)
    setDestinations(updated)
  }

  const handleSubmitSplit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate
      for (let i = 0; i < destinations.length; i++) {
        const d = destinations[i]
        if (!d.recipientName || !d.recipientPhone || !d.addressLine1 || !d.city || !d.pincode) {
          throw new Error(`Please fill all required address fields for ${d.label || `Destination ${i + 1}`}`)
        }
        const totalItems = d.itemAllocations.reduce((s, it) => s + it.allocatedQty, 0)
        if (totalItems === 0) {
          throw new Error(`Please allocate at least 1 item to ${d.label || `Destination ${i + 1}`}`)
        }
      }

      const payload = {
        destinations: destinations.map((d) => ({
          recipientName: d.recipientName,
          recipientPhone: d.recipientPhone,
          addressLine1: d.addressLine1,
          city: d.city,
          state: d.state,
          pincode: d.pincode,
          label: d.label,
          courierName: d.courierName,
          shippingCharge: d.shippingCharge,
          items: d.itemAllocations
            .filter((it) => it.allocatedQty > 0)
            .map((it) => ({
              orderItemId: it.orderItemId,
              quantity: it.allocatedQty,
            })),
        })),
      }

      const res = await fetch(`/api/admin/orders/${orderId}/split-shipments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to split shipments')

      setSuccess(`Successfully generated ${data.shipmentsCount} address-specific shipments and ${data.invoicesCount} distinct invoices!`)
      setShowForm(false)

      // Refresh order shipments
      const refreshRes = await fetch(`/api/admin/orders/${orderId}/split-shipments`)
      const refreshData = await refreshRes.json()
      if (refreshData.order?.shipments) {
        setShipments(refreshData.order.shipments)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-[#E8E3DC] bg-white shadow-sm overflow-hidden">
      <div className="border-b border-[#E8E3DC] bg-[#FAF8F5] px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-[#C9A84C]" />
            <h3 className="font-bold text-sm text-[#2D2D2D]">
              Multi-Address Deliveries & Split Invoices (Mode B)
            </h3>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Allocate items to separate recipients, generate individual dispatch records and legal invoices.
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#C9A84C] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#B8963B] transition"
          >
            <Plus size={14} /> Split into Multiple Addresses
          </button>
        )}
      </div>

      {success && (
        <div className="m-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="m-6 p-4 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Existing Shipments List */}
      {shipments.length > 0 && !showForm && (
        <div className="p-6 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">
            Active Split Shipments ({shipments.length})
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shipments.map((shp) => (
              <div
                key={shp.id}
                className="rounded-xl border border-[#E8E3DC] bg-[#FAF8F5]/50 p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#C9A84C]">
                      {shp.shipmentNumber}
                    </span>
                    <h5 className="font-semibold text-sm text-[#2D2D2D] mt-0.5">
                      {shp.orderAddress?.recipientName}
                    </h5>
                    {shp.orderAddress?.label && (
                      <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900 mt-1">
                        {shp.orderAddress.label}
                      </span>
                    )}
                  </div>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 uppercase">
                    {shp.status}
                  </span>
                </div>

                <div className="text-xs text-[#6B6B6B] space-y-0.5">
                  <p>{shp.orderAddress?.addressLine1}</p>
                  <p>
                    {shp.orderAddress?.city}, {shp.orderAddress?.state} - {shp.orderAddress?.pincode}
                  </p>
                  <p>Phone: {shp.orderAddress?.recipientPhone}</p>
                </div>

                {/* Items in this shipment */}
                <div className="pt-2 border-t border-[#E8E3DC] text-xs">
                  <span className="font-semibold text-[#2D2D2D] block mb-1">Allocated Items:</span>
                  <ul className="space-y-1 text-[#6B6B6B]">
                    {shp.items.map((it, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>
                          {it.orderItem.productName} ({it.orderItem.sku})
                        </span>
                        <strong className="text-[#2D2D2D]">× {it.quantity}</strong>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Shipment Total & Invoices */}
                <div className="pt-2 border-t border-[#E8E3DC] flex items-center justify-between">
                  <span className="text-xs text-[#6B6B6B]">
                    Shipment Total: <strong className="text-[#2D2D2D]">{formatPrice(shp.total)}</strong>
                  </span>

                  {shp.invoices && shp.invoices[0] && (
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`/api/orders/${orderId}/invoice?invoiceId=${shp.invoices[0].id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded bg-white border border-[#E8E3DC] px-2.5 py-1 text-[11px] font-semibold text-[#2D2D2D] hover:text-[#C9A84C]"
                        title="View Address Tax Invoice"
                      >
                        <FileText size={12} /> Invoice
                      </a>
                      <a
                        href={`/api/orders/${orderId}/invoice?invoiceId=${shp.invoices[0].id}&format=pdf`}
                        className="inline-flex items-center gap-1 rounded bg-[#2D2D2D] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-black"
                        title="Download PDF"
                      >
                        <Download size={12} /> PDF
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Split Form */}
      {showForm && (
        <form onSubmit={handleSubmitSplit} className="p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E3DC]">
            <h4 className="font-bold text-sm text-[#2D2D2D]">
              Configure Multi-Address Destinations & Item Quantities
            </h4>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-[#6B6B6B] hover:text-red-600 font-semibold"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-6">
            {destinations.map((dest, dIdx) => (
              <div
                key={dIdx}
                className="rounded-xl border border-[#C9A84C]/40 bg-[#FAF8F5]/30 p-5 space-y-4 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-[#C9A84C] text-white text-xs font-bold flex items-center justify-center">
                      {dIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={dest.label}
                      onChange={(e) => updateDestinationField(dIdx, 'label', e.target.value)}
                      placeholder="e.g. Gift for Sister, Home Delivery"
                      className="text-sm font-bold text-[#2D2D2D] bg-transparent border-b border-transparent hover:border-[#E8E3DC] focus:border-[#C9A84C] outline-none px-1"
                    />
                  </div>

                  {destinations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDestination(dIdx)}
                      className="text-red-600 hover:text-red-800 text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  )}
                </div>

                {/* Recipient Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#6B6B6B] block mb-1">
                      Recipient Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Verma"
                      value={dest.recipientName}
                      onChange={(e) => updateDestinationField(dIdx, 'recipientName', e.target.value)}
                      className="w-full rounded-lg border border-[#E8E3DC] bg-white px-3 py-1.5 text-xs text-[#2D2D2D] focus:border-[#C9A84C] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#6B6B6B] block mb-1">
                      Recipient Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={dest.recipientPhone}
                      onChange={(e) => updateDestinationField(dIdx, 'recipientPhone', e.target.value)}
                      className="w-full rounded-lg border border-[#E8E3DC] bg-white px-3 py-1.5 text-xs text-[#2D2D2D] focus:border-[#C9A84C] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#6B6B6B] block mb-1">
                      Courier Partner
                    </label>
                    <input
                      type="text"
                      value={dest.courierName}
                      onChange={(e) => updateDestinationField(dIdx, 'courierName', e.target.value)}
                      className="w-full rounded-lg border border-[#E8E3DC] bg-white px-3 py-1.5 text-xs text-[#2D2D2D] focus:border-[#C9A84C] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-[#6B6B6B] block mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Flat / House No, Street name"
                      value={dest.addressLine1}
                      onChange={(e) => updateDestinationField(dIdx, 'addressLine1', e.target.value)}
                      className="w-full rounded-lg border border-[#E8E3DC] bg-white px-3 py-1.5 text-xs text-[#2D2D2D] focus:border-[#C9A84C] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#6B6B6B] block mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mumbai"
                      value={dest.city}
                      onChange={(e) => updateDestinationField(dIdx, 'city', e.target.value)}
                      className="w-full rounded-lg border border-[#E8E3DC] bg-white px-3 py-1.5 text-xs text-[#2D2D2D] focus:border-[#C9A84C] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#6B6B6B] block mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 400001"
                      value={dest.pincode}
                      onChange={(e) => updateDestinationField(dIdx, 'pincode', e.target.value)}
                      className="w-full rounded-lg border border-[#E8E3DC] bg-white px-3 py-1.5 text-xs text-[#2D2D2D] focus:border-[#C9A84C] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Item Allocations for this address */}
                <div className="pt-2 border-t border-[#E8E3DC]/60">
                  <span className="text-[11px] font-bold uppercase text-[#6B6B6B] block mb-2">
                    Allocate Items to this Address:
                  </span>
                  <div className="space-y-2 bg-white rounded-lg border border-[#E8E3DC] p-3">
                    {dest.itemAllocations.map((alloc, itIdx) => (
                      <div
                        key={alloc.orderItemId}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex-1 pr-4">
                          <span className="font-semibold text-[#2D2D2D] block">
                            {alloc.productName}
                          </span>
                          <span className="text-[10px] text-[#6B6B6B]">
                            SKU: {alloc.sku} (Purchased total: {alloc.maxQty})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-[#6B6B6B]">Ship Qty:</span>
                          <input
                            type="number"
                            min="0"
                            max={alloc.maxQty}
                            value={alloc.allocatedQty}
                            onChange={(e) =>
                              updateItemAllocation(dIdx, itIdx, parseInt(e.target.value) || 0)
                            }
                            className="w-16 rounded border border-[#E8E3DC] px-2 py-1 text-center font-bold text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddDestination}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#C9A84C] px-3.5 py-2 text-xs font-semibold text-[#C9A84C] hover:bg-amber-50 transition"
            >
              <Plus size={14} /> Add Another Delivery Destination
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2D2D2D] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-black transition disabled:opacity-50"
            >
              {loading ? 'Processing Split Invoices...' : 'Confirm Split & Generate Distinct Invoices'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
