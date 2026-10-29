import PDFDocument from 'pdfkit'
import { formatPrice, formatDate } from './utils'

export interface InvoiceData {
  invoiceNumber: string
  issuedAt: Date | string
  businessName: string
  businessAddress: string
  businessGstin: string
  customerName: string
  customerEmail?: string | null
  customerPhone?: string | null
  customerAddress?: string | null
  orderNumber: string
  paymentMethod: string
  paymentStatus: string
  trackingNumber?: string | null
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  type?: string
  addressLabel?: string | null
  items: {
    productName: string
    variantName?: string | null
    sku: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
}

/**
 * Generate a PDF Buffer using PDFKit
 */
export async function generateInvoicePdfBuffer(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 45, size: 'A4' })
      const buffers: Buffer[] = []

      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => resolve(Buffer.concat(buffers)))
      doc.on('error', reject)

      // Brand Header
      doc.fillColor('#C9A84C').fontSize(22).font('Helvetica-Bold').text('KALAVIES', { align: 'left' })
      doc.fillColor('#6B6B6B').fontSize(9).font('Helvetica').text('FINE HANDCRAFTED JEWELLERY')
      doc.moveDown(0.3)
      doc.fillColor('#4B5563').fontSize(9).font('Helvetica').text(data.businessName || 'KALAVIES Jewellery Pvt Ltd')
      doc.text(data.businessAddress || '108, Jewellery Palace, MG Road, Bangalore, Karnataka, 560001')
      doc.text(`GSTIN: ${data.businessGstin || '29ABCDE1234F1Z5'}`)

      // Invoice Title & Info on Right
      doc.fontSize(16).fillColor('#1A1A1A').font('Helvetica-Bold').text('TAX INVOICE', 350, 45, { align: 'right' })
      if (data.type && data.type !== 'STANDARD') {
        doc.fontSize(8).fillColor('#B45309').text(`[${data.type.replace('_', ' ')}]`, 350, 65, { align: 'right' })
      }
      doc.fontSize(9).fillColor('#374151').font('Helvetica')
      doc.text(`Invoice #: ${data.invoiceNumber}`, 350, 80, { align: 'right' })
      doc.text(`Order ID: ${data.orderNumber}`, 350, 95, { align: 'right' })
      doc.text(`Date: ${formatDate(data.issuedAt)}`, 350, 110, { align: 'right' })
      doc.text(`Payment: ${data.paymentMethod} (${data.paymentStatus})`, 350, 125, { align: 'right' })

      // Divider
      doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(45, 150).lineTo(550, 150).stroke()

      // Customer & Shipping Info
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827').text('BILLED & DELIVERED TO:', 45, 165)
      doc.fontSize(9).font('Helvetica').fillColor('#374151')
      doc.text(data.customerName || 'Valued Customer', 45, 180)
      if (data.addressLabel) {
        doc.fillColor('#92400E').text(`Destination: ${data.addressLabel}`, 45, 195)
        doc.fillColor('#374151')
      }
      doc.text(data.customerAddress || 'Address on file', 45, data.addressLabel ? 210 : 195, { width: 250 })
      doc.text(`Phone: ${data.customerPhone || 'N/A'}`)
      doc.text(`Email: ${data.customerEmail || 'N/A'}`)

      // Shipping & Dispatch Info on Right
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827').text('DISPATCH DETAILS:', 350, 165)
      doc.fontSize(9).font('Helvetica').fillColor('#374151')
      doc.text(`Shipping Mode: Standard Express Delivery`, 350, 180)
      doc.text(`Tracking: ${data.trackingNumber || 'Generated upon dispatch'}`, 350, 195)
      doc.text(`Place of Supply: Karnataka (State Code 29)`, 350, 210)

      // Table Header
      const tableTop = 260
      doc.rect(45, tableTop, 505, 22).fill('#FAF8F5')
      doc.strokeColor('#E8E3DC').lineWidth(1).rect(45, tableTop, 505, 22).stroke()
      
      doc.fillColor('#4B5563').font('Helvetica-Bold').fontSize(8.5)
      doc.text('ITEM DESCRIPTION', 55, tableTop + 6)
      doc.text('SKU', 250, tableTop + 6)
      doc.text('PRICE', 330, tableTop + 6, { width: 60, align: 'right' })
      doc.text('QTY', 400, tableTop + 6, { width: 40, align: 'center' })
      doc.text('AMOUNT', 460, tableTop + 6, { width: 80, align: 'right' })

      // Table Rows
      let y = tableTop + 24
      doc.font('Helvetica').fontSize(8.5).fillColor('#1F2937')

      for (const item of data.items) {
        const itemTotal = item.unitPrice * item.quantity
        doc.rect(45, y, 505, 22).strokeColor('#F3F4F6').lineWidth(0.5).stroke()

        const title = item.variantName ? `${item.productName} (${item.variantName})` : item.productName
        doc.text(title.slice(0, 36), 55, y + 6, { width: 190 })
        doc.text(item.sku, 250, y + 6, { width: 75 })
        doc.text(formatPrice(item.unitPrice), 330, y + 6, { width: 60, align: 'right' })
        doc.text(String(item.quantity), 400, y + 6, { width: 40, align: 'center' })
        doc.text(formatPrice(itemTotal), 460, y + 6, { width: 80, align: 'right' })

        y += 22
      }

      // Totals Box
      y += 15
      const totalsLeft = 330
      doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(totalsLeft, y).lineTo(550, y).stroke()
      y += 8

      const row = (label: string, val: string, isBold: boolean = false, isGold: boolean = false) => {
        doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(isBold ? 10 : 9)
          .fillColor(isGold ? '#C9A84C' : isBold ? '#111827' : '#4B5563')
          .text(label, totalsLeft, y)
          .text(val, 460, y, { width: 80, align: 'right' })
        y += 16
      }

      row('Subtotal:', formatPrice(data.subtotal))
      if (data.discount > 0) {
        row('Discount:', `- ${formatPrice(data.discount)}`)
      }
      row('Shipping Charge:', data.shipping === 0 ? 'FREE' : formatPrice(data.shipping))
      row('GST (Included 3%):', formatPrice(data.tax || Math.round((data.subtotal * 3) / 103)))
      y += 4
      doc.strokeColor('#C9A84C').lineWidth(1.5).moveTo(totalsLeft, y).lineTo(550, y).stroke()
      y += 8
      row('Final Amount:', formatPrice(data.total), true, true)

      // Terms & Legal Footer
      const footerY = 720
      doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(45, footerY).lineTo(550, footerY).stroke()
      doc.fontSize(7.5).fillColor('#6B6B6B').font('Helvetica')
      doc.text(
        'Terms & Conditions: 1. All jewellery products are handcrafted and quality certified. 2. Please store in airtight pouches away from water and perfume. 3. This is a computer generated invoice and does not require a physical signature.',
        45,
        footerY + 10,
        { width: 505, align: 'center' }
      )
      doc.text('Thank you for shopping with KALAVIES Jewellery | www.kalavies.com', 45, footerY + 30, {
        width: 505,
        align: 'center',
      })

      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * Generate a clean, responsive HTML invoice for browser viewing & printing
 */
export function generateInvoiceHtml(data: InvoiceData, includePageBreak: boolean = false): string {
  return `
    <div class="invoice-wrapper ${includePageBreak ? 'page-break' : ''}" style="max-width: 820px; margin: 0 auto 40px auto; background: #ffffff; border: 1px solid #E8E3DC; border-radius: 12px; padding: 36px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #2D2D2D; line-height: 1.5; font-size: 13px;">
      
      <!-- Top Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #C9A84C; padding-bottom: 20px; margin-bottom: 24px;">
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 6px;">
            <img src="/logo-circle.png" alt="KALAVIES Jewellery" style="height: 48px; width: 48px; border-radius: 50%; object-fit: contain;" />
            <div>
              <div style="font-size: 20px; font-weight: bold; letter-spacing: 2px; color: #1A1A1A;">KALAVIES</div>
              <div style="font-size: 9px; letter-spacing: 3px; color: #C9A84C; text-transform: uppercase; font-weight: 600;">Jewellery</div>
            </div>
          </div>
          <p style="font-size: 11px; color: #6B6B6B; line-height: 1.4; margin: 0;">
            <strong>${data.businessName}</strong><br>
            ${data.businessAddress}<br>
            <strong>GSTIN:</strong> ${data.businessGstin}
          </p>
        </div>

        <div style="text-align: right;">
          <div style="font-size: 20px; font-weight: 800; color: #C9A84C; letter-spacing: 1px;">TAX INVOICE</div>
          ${data.type && data.type !== 'STANDARD' ? `<span style="display: inline-block; background: #FEF3C7; color: #B45309; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 4px; margin-top: 4px;">${data.type.replace('_', ' ')}</span>` : ''}
          <div style="margin-top: 8px; font-size: 12px; color: #4B5563;">
            <p style="margin: 2px 0;"><strong>Invoice #:</strong> <span style="font-family: monospace; font-weight: bold; color: #111;">${data.invoiceNumber}</span></p>
            <p style="margin: 2px 0;"><strong>Order ID:</strong> ${data.orderNumber}</p>
            <p style="margin: 2px 0;"><strong>Date:</strong> ${formatDate(data.issuedAt)}</p>
            <p style="margin: 2px 0;"><strong>Payment:</strong> ${data.paymentMethod} (${data.paymentStatus})</p>
          </div>
        </div>
      </div>

      <!-- Customer & Shipping Destination -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; background: #FAF8F5; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; border: 1px solid #E8E3DC;">
        <div>
          <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #9CA3AF; display: block; margin-bottom: 6px;">Billed & Delivered To</span>
          <strong style="font-size: 14px; color: #111827;">${data.customerName}</strong>
          ${data.addressLabel ? `<span style="display: inline-block; background: #E0E7FF; color: #3730A3; font-size: 10px; padding: 1px 6px; border-radius: 4px; margin-left: 6px;">${data.addressLabel}</span>` : ''}
          <p style="font-size: 12px; color: #4B5563; margin: 4px 0 0 0; line-height: 1.4;">
            ${data.customerAddress || 'Address on file'}<br>
            Phone: ${data.customerPhone || 'N/A'}<br>
            Email: ${data.customerEmail || 'N/A'}
          </p>
        </div>

        <div style="text-align: right;">
          <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #9CA3AF; display: block; margin-bottom: 6px;">Dispatch Details</span>
          <p style="font-size: 12px; color: #4B5563; margin: 0; line-height: 1.5;">
            <strong>Shipping Mode:</strong> Standard Insured Express<br>
            <strong>Tracking No:</strong> ${data.trackingNumber || 'Available upon dispatch'}<br>
            <strong>Place of Supply:</strong> Karnataka (State Code 29)
          </p>
        </div>
      </div>

      <!-- Line Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="background: #FAF8F5; border-bottom: 2px solid #E8E3DC;">
            <th style="text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #6B6B6B;">Item & Specifications</th>
            <th style="text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #6B6B6B;">SKU</th>
            <th style="text-align: right; padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #6B6B6B;">Unit Price</th>
            <th style="text-align: center; padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #6B6B6B;">Qty</th>
            <th style="text-align: right; padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #6B6B6B;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${data.items
            .map(
              (item) => `
            <tr style="border-bottom: 1px solid #E8E3DC;">
              <td style="padding: 12px;">
                <strong style="color: #1F2937;">${item.productName}</strong>
                ${item.variantName ? `<br><small style="color: #6B6B6B;">Variant: ${item.variantName}</small>` : ''}
              </td>
              <td style="padding: 12px; font-family: monospace; font-size: 11px; color: #6B6B6B;">${item.sku}</td>
              <td style="padding: 12px; text-align: right; color: #374151;">${formatPrice(item.unitPrice)}</td>
              <td style="padding: 12px; text-align: center; font-weight: 600; color: #111827;">${item.quantity}</td>
              <td style="padding: 12px; text-align: right; font-weight: 600; color: #111827;">${formatPrice(item.totalPrice)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <!-- Totals Breakdown -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 28px;">
        <div style="width: 280px; border-top: 1px solid #E8E3DC; padding-top: 12px;">
          <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; color: #6B6B6B;">
            <span>Subtotal:</span>
            <span style="font-weight: 600; color: #111827;">${formatPrice(data.subtotal)}</span>
          </div>
          ${
            data.discount > 0
              ? `<div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; color: #059669; font-weight: 600;">
                  <span>Discount:</span>
                  <span>- ${formatPrice(data.discount)}</span>
                </div>`
              : ''
          }
          <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; color: #6B6B6B;">
            <span>Shipping:</span>
            <span style="font-weight: 600; color: #111827;">${data.shipping === 0 ? 'FREE' : formatPrice(data.shipping)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; color: #6B6B6B;">
            <span>GST (3% Included):</span>
            <span style="color: #059669;">${formatPrice(data.tax || Math.round((data.subtotal * 3) / 103))}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0 4px 0; border-top: 2px solid #C9A84C; margin-top: 8px; font-size: 16px; font-weight: 800; color: #C9A84C;">
            <span>Grand Total:</span>
            <span>${formatPrice(data.total)}</span>
          </div>
        </div>
      </div>

      <!-- Legal Declaration -->
      <div style="border-top: 1px solid #E8E3DC; padding-top: 16px; font-size: 11px; color: #6B6B6B; text-align: center; line-height: 1.6;">
        <p style="margin: 0 0 4px 0;">This is a computer-generated tax invoice issued in accordance with GST regulations and requires no physical signature.</p>
        <p style="margin: 0; color: #C9A84C; font-weight: 600;">Thank you for choosing KALAVIES Jewellery | www.kalavies.com</p>
      </div>
    </div>
  `
}
