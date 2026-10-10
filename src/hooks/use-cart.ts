import { useState, useEffect, useCallback } from "react"
import type { Product } from "@/services/products.service"

export interface CartItem {
  product: Product
  quantity: number
}

const CART_STORAGE_KEY = "vibecoding_ecommerce_cart"
const CART_EVENT_NAME = "vibecoding-cart-updated"

function readCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeCartToStorage(items: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new CustomEvent(CART_EVENT_NAME))
  } catch {
    // ignore storage errors
  }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => readCartFromStorage())

  useEffect(() => {
    const handleSync = () => {
      setItems(readCartFromStorage())
    }
    window.addEventListener(CART_EVENT_NAME, handleSync)
    window.addEventListener("storage", handleSync)
    return () => {
      window.removeEventListener(CART_EVENT_NAME, handleSync)
      window.removeEventListener("storage", handleSync)
    }
  }, [])

  const addItem = useCallback((product: Product, qty = 1) => {
    const current = readCartFromStorage()
    const existingIndex = current.findIndex(
      (item) => item.product.id === product.id
    )
    let next: CartItem[]
    if (existingIndex > -1) {
      next = current.map((item, idx) =>
        idx === existingIndex
          ? {
              ...item,
              product,
              quantity: Math.min(
                item.quantity + qty,
                Math.max(product.quantity, 1)
              ),
            }
          : item
      )
    } else {
      next = [...current, { product, quantity: Math.max(1, qty) }]
    }
    writeCartToStorage(next)
    setItems(next)
  }, [])

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    const current = readCartFromStorage()
    if (quantity <= 0) {
      const next = current.filter((item) => item.product.id !== productId)
      writeCartToStorage(next)
      setItems(next)
      return
    }
    const next = current.map((item) =>
      item.product.id === productId
        ? {
            ...item,
            quantity: Math.min(quantity, Math.max(item.product.quantity, 1)),
          }
        : item
    )
    writeCartToStorage(next)
    setItems(next)
  }, [])

  const removeItem = useCallback((productId: number) => {
    const current = readCartFromStorage()
    const next = current.filter((item) => item.product.id !== productId)
    writeCartToStorage(next)
    setItems(next)
  }, [])

  const clearCart = useCallback(() => {
    writeCartToStorage([])
    setItems([])
  }, [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce(
    (sum, item) => sum + (Number(item.product.price) || 0) * item.quantity,
    0
  )

  return {
    items,
    totalItems,
    totalPrice,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  }
}
