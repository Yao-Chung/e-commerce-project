import { PrismaClient } from '@prisma/client'
import {
  AddToWishlistRequestBody,
  WishlistItemResponse,
  WishlistResponse,
  MoveToCartRequestBody,
  WishlistItemWithProduct,
} from '../types/wishlist.types'

const prisma = new PrismaClient()

export class WishlistService {
  // Get user's wishlist
  async getUserWishlist(userId: string): Promise<WishlistResponse> {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            category: true,
            imageUrl: true,
            stock: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const totalValue = wishlistItems.reduce(
      (sum, item) => sum + item.product.price,
      0
    )

    return {
      items: wishlistItems.map(this.mapWishlistItemToResponse),
      totalCount: wishlistItems.length,
      totalValue,
    }
  }

  // Add item to wishlist
  async addToWishlist(
    userId: string,
    data: AddToWishlistRequestBody
  ): Promise<WishlistItemResponse> {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    })

    if (!product) {
      throw new Error('Product not found')
    }

    // Check if item already exists in wishlist
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: data.productId,
        },
      },
    })

    if (existingItem) {
      throw new Error('Product already in wishlist')
    }

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId,
        productId: data.productId,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            category: true,
            imageUrl: true,
            stock: true,
          },
        },
      },
    })

    return this.mapWishlistItemToResponse(wishlistItem)
  }

  // Remove item from wishlist
  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    if (!wishlistItem) {
      throw new Error('Product not found in wishlist')
    }

    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })
  }

  // Move item from wishlist to cart
  async moveToCart(userId: string, data: MoveToCartRequestBody): Promise<void> {
    // Check if item exists in wishlist
    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: data.productId,
        },
      },
    })

    if (!wishlistItem) {
      throw new Error('Product not found in wishlist')
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    })

    if (!product) {
      throw new Error('Product not found')
    }

    // Check if product is in stock
    const quantity: number = data.quantity ?? 1
    if (product.stock < quantity) {
      throw new Error('Product is out of stock')
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: data.productId,
        },
      },
    })

    if (existingCartItem) {
      // Update quantity if already in cart
      await prisma.cartItem.update({
        where: {
          userId_productId: {
            userId,
            productId: data.productId,
          },
        },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
      })
    } else {
      // Add to cart
      await prisma.cartItem.create({
        data: {
          userId,
          productId: data.productId,
          quantity: quantity,
        },
      })
    }

    // Remove from wishlist
    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId,
          productId: data.productId,
        },
      },
    })
  }

  // Check if product is in wishlist
  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    return !!wishlistItem
  }

  // Get wishlist count
  async getWishlistCount(userId: string): Promise<number> {
    const count = await prisma.wishlistItem.count({
      where: { userId },
    })

    return count
  }

  // Clear wishlist
  async clearWishlist(userId: string): Promise<void> {
    await prisma.wishlistItem.deleteMany({
      where: { userId },
    })
  }

  // Map database wishlist item to response format
  private mapWishlistItemToResponse(
    wishlistItem: WishlistItemWithProduct
  ): WishlistItemResponse {
    return {
      id: wishlistItem.id,
      createdAt: wishlistItem.createdAt,
      product: {
        id: wishlistItem.product.id,
        name: wishlistItem.product.name,
        description: wishlistItem.product.description,
        price: wishlistItem.product.price,
        category: wishlistItem.product.category,
        imageUrl: wishlistItem.product.imageUrl,
        stock: wishlistItem.product.stock,
      },
    }
  }
}

export const wishlistService = new WishlistService()
