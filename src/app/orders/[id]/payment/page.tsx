import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import StoreLayout from '@/components/store/StoreLayout'
import PaymentClient from './PaymentClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function OrderPaymentPage({ params }: Props) {
  const { id } = await params

  const [order, paymentSetting] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    }),
    prisma.paymentSetting.findFirst({
      where: { isActive: true },
    }),
  ])

  if (!order) notFound()

  // If already confirmed and paid, redirect to full order confirmation
  if (order.status === 'CONFIRMED' && order.paymentStatus === 'PAID') {
    redirect(`/orders/${order.id}?success=true`)
  }

  const latestPayment = order.payments[0] || null

  const activeSettings = {
    qrImageUrl: paymentSetting?.qrImageUrl || '',
    upiId: paymentSetting?.upiId || 'kalavies@upi',
    payeeName: paymentSetting?.payeeName || 'KALAVIES Jewellery',
    paymentInstructions:
      paymentSetting?.paymentInstructions ||
      'Scan the QR code with any UPI app (Google Pay, PhonePe, Paytm, BHIM, Cred). Complete the payment of exact order amount, then copy the 12-digit UTR reference number and upload your screenshot below.',
  }

  return (
    <StoreLayout>
      <PaymentClient
        order={order}
        payment={latestPayment}
        settings={activeSettings}
      />
    </StoreLayout>
  )
}
