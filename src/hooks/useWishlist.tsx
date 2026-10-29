'use client'

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react'

interface WishlistItem {
  id: string
  productId: string
  name: string
  image?: string
  price: number
  mrp: number
  slug: string
}

interface WishlistContextType {
  items: WishlistItem[]
  itemCount: number
  isInWishlist: (productId: string) => boolean
  addItem: (item: WishlistItem) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  toggleItem: (item: WishlistItem) => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])

  useEffect(() => {
    fetch('/api/wishlist')
      .then(res => res.json())
      .then(data => {
        if (data.items) setItems(data.items)
      })
      .catch(() => {
        try {
          const saved = localStorage.getItem('kalavies-wishlist')
          if (saved) setItems(JSON.parse(saved))
        } catch {}
      })
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('kalavies-wishlist', JSON.stringify(items))
    } catch {}
  }, [items])

  const isInWishlist = useCallback((productId: string) => {
    return items.some(i => i.productId === productId)
  }, [items])

  const addItem = useCallback(async (item: WishlistItem) => {
    setItems(prev => {
      if (prev.some(i => i.productId === item.productId)) return prev
      return [...prev, item]
    })
    try {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: item.productId }),
      })
    } catch {}
  }, [])

  const removeItem = useCallback(async (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId))
    try {
      await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
    } catch {}
  }, [])

  const toggleItem = useCallback(async (item: WishlistItem) => {
    if (items.some(i => i.productId === item.productId)) {
      await removeItem(item.productId)
    } else {
      await addItem(item)
    }
  }, [items, addItem, removeItem])

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount: items.length,
        isInWishlist,
        addItem,
        removeItem,
        toggleItem,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within WishlistProvider')
  return context
}
