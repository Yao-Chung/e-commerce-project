import { Request } from 'express'
import { Product, CartItem } from '@prisma/client'

// Cart item with product details
export type CartItemWithProduct = CartItem & {
  product: Product
}

// Cart summary
export type CartSummary = {
  items: CartItemWithProduct[]
  totalItems: number
  totalAmount: number
  subtotal: number
}

// Guest cart item structure (stored in session)
export type GuestCartItem = {
  productId: string
  quantity: number
}

// Guest cart structure
export type GuestCart = {
  items: GuestCartItem[]
  sessionId: string
  createdAt: string
  updatedAt: string
}

// Request body types for cart operations
export type AddToCartRequest = {
  productId: string
  quantity: number
}

export type UpdateCartItemRequest = {
  quantity: number
}

export type MergeCartRequest = {
  guestSessionId: string
}

// Response types
export type CartResponse = {
  cart: CartSummary
  isGuest: boolean
}

// Cart validation and business rules
export type CartValidationResult = {
  isValid: boolean
  errors: string[]
  unavailableItems: string[]
  stockIssues: Array<{
    productId: string
    requestedQuantity: number
    availableStock: number
  }>
}

// Extended Request types
export type OptionalAuthRequest = Request & {
  user?: import('@prisma/client').User
  sessionID?: string
}

export type AuthenticatedRequest = Request & {
  user: import('@prisma/client').User
}
