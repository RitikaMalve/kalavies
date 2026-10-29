'use client'

import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react'

interface CartItemData {
  id: string
  productId: string
  variantId?: string
  name: string
  variantName?: string
  image?: string
  price: number
  mrp: number
  quantity: number
  maxStock: number
  sku: string
}

interface CartState {
  items: CartItemData[]
  isOpen: boolean
}

type CartAction =
  | { type: 'SET_ITEMS'; items: CartItemData[] }
  | { type: 'ADD_ITEM'; item: CartItemData }
  | { type: 'UPDATE_QUANTITY'; productId: string; variantId?: string; quantity: number }
  | { type: 'REMOVE_ITEM'; productId: string; variantId?: string }
  | { type: 'CLEAR' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.items }
    case 'ADD_ITEM': {
      const existing = state.items.find(
        i => i.productId === action.item.productId && i.variantId === action.item.variantId
      )
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.productId === action.item.productId && i.variantId === action.item.variantId
              ? { ...i, quantity: Math.min(i.quantity + action.item.quantity, i.maxStock) }
              : i
          ),
        }
      }
      return { ...state, items: [...state.items, action.item] }
    }
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(i =>
          i.productId === action.productId && i.variantId === action.variantId
            ? { ...i, quantity: Math.min(Math.max(1, action.quantity), i.maxStock) }
            : i
        ),
      }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(
          i => !(i.productId === action.productId && i.variantId === action.variantId)
        ),
      }
    case 'CLEAR':
      return { ...state, items: [] }
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }
    case 'OPEN_CART':
      return { ...state, isOpen: true }
    case 'CLOSE_CART':
      return { ...state, isOpen: false }
    default:
      return state
  }
}

interface CartContextType {
  items: CartItemData[]
  isOpen: boolean
  itemCount: number
  subtotal: number
  totalSavings: number
  addItem: (item: CartItemData) => Promise<void>
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => Promise<void>
  removeItem: (productId: string, variantId?: string) => Promise<void>
  clearCart: () => Promise<void>
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false })

  // Load cart from API on mount
  useEffect(() => {
    fetch('/api/cart')
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          dispatch({ type: 'SET_ITEMS', items: data.items })
        }
      })
      .catch(() => {
        // Load from localStorage as fallback
        try {
          const saved = localStorage.getItem('kalavies-cart')
          if (saved) {
            dispatch({ type: 'SET_ITEMS', items: JSON.parse(saved) })
          }
        } catch {}
      })
  }, [])

  // Save to localStorage as backup
  useEffect(() => {
    try {
      localStorage.setItem('kalavies-cart', JSON.stringify(state.items))
    } catch {}
  }, [state.items])

  const addItem = useCallback(async (item: CartItemData) => {
    dispatch({ type: 'ADD_ITEM', item })
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        }),
      })
    } catch {}
  }, [])

  const updateQuantity = useCallback(async (productId: string, variantId: string | undefined, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, variantId, quantity })
    try {
      await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, variantId, quantity }),
      })
    } catch {}
  }, [])

  const removeItem = useCallback(async (productId: string, variantId?: string) => {
    dispatch({ type: 'REMOVE_ITEM', productId, variantId })
    try {
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, variantId }),
      })
    } catch {}
  }, [])

  const clearCart = useCallback(async () => {
    dispatch({ type: 'CLEAR' })
    try {
      await fetch('/api/cart/clear', { method: 'POST' })
    } catch {}
  }, [])

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const totalSavings = state.items.reduce((sum, i) => sum + (i.mrp - i.price) * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        itemCount,
        subtotal,
        totalSavings,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        toggleCart: () => dispatch({ type: 'TOGGLE_CART' }),
        openCart: () => dispatch({ type: 'OPEN_CART' }),
        closeCart: () => dispatch({ type: 'CLOSE_CART' }),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
