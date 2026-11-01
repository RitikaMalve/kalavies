import { prisma } from '@/lib/prisma'
import PaymentsManagerClient from './PaymentsManagerClient'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{
    tab?: string
    search?: string
  }>
}

export default async function AdminPaymentsPage({ searchParams }: Props) {
  const params = await searchParams
  const tab = params.tab || 'ALL'
  const search = params.search || ''

  const where: any = {}

  if (tab === 'VERIFICATION_PENDING') {
    where.status = 'VERIFICATION_PENDING'
  } else if (tab === 'PAID') {
    where.status = 'PAID'
  } else if (tab === 'REJECTED') {
    where.status = 'REJECTED'
  } else if (tab === 'REFUNDS') {
    where.status = { in: ['REFUND_PENDING', 'REFUNDED'] }
  }

  if (search) {
    where.OR = [
      { utrNumber: { contains: search, mode: 'insensitive' } },
      { order: { orderNumber: { contains: search, mode: 'insensitive' } } },
      { order: { shippingName: { contains: search, mode: 'insensitive' } } },
      { order: { shippingPhone: { contains: search, mode: 'insensitive' } } },
    ]
  }

  const [payments, pendingCount, refundPendingCount] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: {
            items: true,
            user: { select: { firstName: true, lastName: true, email: true, phone: true } },
          },
        },
      },
    }),
    prisma.payment.count({ where: { status: 'VERIFICATION_PENDING' } }),
    prisma.payment.count({ where: { status: 'REFUND_PENDING' } }),
  ])

  return (
    <PaymentsManagerClient
      payments={payments}
      pendingCount={pendingCount}
      refundPendingCount={refundPendingCount}
      currentTab={tab}
      initialSearch={search}
    />
  )
}
