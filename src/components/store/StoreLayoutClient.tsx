'use client'

import { useEffect, useState } from 'react'
import StoreHeader from '@/components/store/StoreHeader'
import StoreFooter from '@/components/store/StoreFooter'

export default function StoreLayoutClient({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories)
      })
      .catch(() => {})

    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <StoreHeader categories={categories} user={user} />
      <main className="flex-1">{children}</main>
      <StoreFooter />
    </div>
  )
}
