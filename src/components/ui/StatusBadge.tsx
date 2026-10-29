import { ORDER_STATUSES, PAYMENT_STATUSES } from '@/lib/utils'

type OrderStatusKey = keyof typeof ORDER_STATUSES
type PaymentStatusKey = keyof typeof PAYMENT_STATUSES

interface StatusBadgeProps {
  status: string
  type?: 'order' | 'payment'
}

export default function StatusBadge({ status, type = 'order' }: StatusBadgeProps) {
  const statusMap = type === 'order' ? ORDER_STATUSES : PAYMENT_STATUSES
  const config = statusMap[status as OrderStatusKey & PaymentStatusKey] ?? {
    label: status,
    color: 'bg-gray-100 text-gray-800',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  )
}
