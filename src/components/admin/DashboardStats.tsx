'use client'

import {
  Package,
  ShoppingBag,
  IndianRupee,
  Users,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface StatCard {
  label: string
  value: string | number
  icon: 'products' | 'orders' | 'revenue' | 'customers'
  change?: number
  subtitle?: string
}

interface DashboardStatsProps {
  stats: StatCard[]
}

const iconMap = {
  products: Package,
  orders: ShoppingBag,
  revenue: IndianRupee,
  customers: Users,
}

const colorMap = {
  products: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    ring: 'ring-blue-100',
  },
  orders: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    ring: 'ring-purple-100',
  },
  revenue: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    ring: 'ring-emerald-100',
  },
  customers: {
    bg: 'bg-amber-50',
    icon: 'text-[#C9A84C]',
    ring: 'ring-amber-100',
  },
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = iconMap[stat.icon]
        const colors = colorMap[stat.icon]

        return (
          <div
            key={stat.label}
            className="rounded-xl border border-[#E8E3DC] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#6B6B6B]">{stat.label}</p>
                <p className="mt-1.5 text-2xl font-bold text-[#2D2D2D]">
                  {typeof stat.value === 'number' && stat.icon === 'revenue'
                    ? formatPrice(stat.value)
                    : stat.value.toLocaleString('en-IN')}
                </p>
                {stat.subtitle && (
                  <p className="mt-1 text-xs text-[#6B6B6B]">{stat.subtitle}</p>
                )}
              </div>
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${colors.bg} ring-1 ${colors.ring}`}
              >
                <Icon size={22} className={colors.icon} />
              </div>
            </div>

            {stat.change !== undefined && (
              <div className="mt-3 flex items-center gap-1">
                {stat.change >= 0 ? (
                  <TrendingUp size={14} className="text-[#4CAF50]" />
                ) : (
                  <TrendingDown size={14} className="text-[#E53935]" />
                )}
                <span
                  className={`text-xs font-medium ${
                    stat.change >= 0 ? 'text-[#4CAF50]' : 'text-[#E53935]'
                  }`}
                >
                  {stat.change >= 0 ? '+' : ''}
                  {stat.change}%
                </span>
                <span className="text-xs text-[#6B6B6B]">vs last month</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
