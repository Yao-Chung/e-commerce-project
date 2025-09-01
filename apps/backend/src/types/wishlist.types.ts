import { Request } from 'express'
import { User } from '@prisma/client'

export type AuthenticatedRequest = Request & {
  user: User
}

export type AddToWishlistRequestBody = {
  productId: string
}

export type WishlistItemResponse = {
  id: string
  createdAt: Date
  product: {
    id: string
    name: string
    description: string
    price: number
    category: string
    imageUrl: string | null
    stock: number
  }
}

export type WishlistResponse = {
  items: WishlistItemResponse[]
  totalCount: number
  totalValue: number
}

export type MoveToCartRequestBody = {
  productId: string
  quantity: number | null
}

// Type for wishlist item with included product data from Prisma queries
export type WishlistItemWithProduct = {
  id: string
  createdAt: Date
  product: {
    id: string
    name: string
    description: string
    price: number
    category: string
    imageUrl: string | null
    stock: number
  }
}
