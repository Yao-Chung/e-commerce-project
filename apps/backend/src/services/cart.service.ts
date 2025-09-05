import { PrismaClient, CartItem, Product, Prisma } from '@prisma/client'
import {
  CartItemWithProduct,
  CartSummary,
  GuestCart,
  CartValidationResult,
} from '../types/cart.types'
import { productService } from './product.service'

const prisma: PrismaClient = new PrismaClient()

export class CartService {
  // Get cart for authenticated user
  async getUserCart(userId: string): Promise<CartSummary> {
    const cartItems: CartItemWithProduct[] = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return this.calculateCartSummary(cartItems)
  }

  // Add item to authenticated user's cart
  async addToUserCart(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<CartSummary> {
    // Check if product exists and has sufficient stock
    const product: Product | null =
      await productService.getProductById(productId)
    if (!product) {
      throw new Error('Product not found')
    }

    // Check if item already exists in cart
    const existingItem: CartItem | null = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    const newQuantity: number = existingItem
      ? existingItem.quantity + quantity
      : quantity

    // Validate stock availability
    if (product.stock < newQuantity) {
      throw new Error(
        `Insufficient stock. Available: ${product.stock}, Requested: ${newQuantity}`
      )
    }

    // Upsert cart item
    await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      create: {
        userId,
        productId,
        quantity,
      },
      update: {
        quantity: newQuantity,
      },
    })

    return this.getUserCart(userId)
  }

  // Update cart item quantity for authenticated user
  async updateUserCartItem(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<CartSummary> {
    if (quantity === 0) {
      return this.removeFromUserCart(userId, productId)
    }

    // Check product exists and stock availability
    const product: Product | null =
      await productService.getProductById(productId)
    if (!product) {
      throw new Error('Product not found')
    }

    if (product.stock < quantity) {
      throw new Error(
        `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`
      )
    }

    try {
      await prisma.cartItem.update({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        data: {
          quantity,
        },
      })
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new Error('Cart item not found')
      }
      throw error
    }

    return this.getUserCart(userId)
  }

  // Remove item from authenticated user's cart
  async removeFromUserCart(
    userId: string,
    productId: string
  ): Promise<CartSummary> {
    try {
      await prisma.cartItem.delete({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      })
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        // Item not found, but that's okay for removal
      } else {
        throw error
      }
    }

    return this.getUserCart(userId)
  }

  // Clear authenticated user's cart
  async clearUserCart(userId: string): Promise<void> {
    await prisma.cartItem.deleteMany({
      where: { userId },
    })
  }

  // Guest cart operations using in-memory session storage
  // Note: In production, consider using Redis or similar for guest cart persistence
  private static guestCarts: Map<string, GuestCart> = new Map()

  async getGuestCart(sessionId: string): Promise<CartSummary> {
    const guestCart: GuestCart | undefined =
      CartService.guestCarts.get(sessionId)

    if (!guestCart || !guestCart.items || !Array.isArray(guestCart.items)) {
      return this.createEmptyCartSummary()
    }

    // Get product details for all cart items
    const cartItemsWithProducts: CartItemWithProduct[] = []
    for (const item of guestCart.items) {
      const product: Product | null = await productService.getProductById(
        item.productId
      )
      if (product) {
        cartItemsWithProducts.push({
          id: `guest-${sessionId}-${item.productId}`,
          userId: '', // Guest user has no userId
          productId: item.productId,
          quantity: item.quantity,
          createdAt: new Date(guestCart.updatedAt || guestCart.createdAt),
          updatedAt: new Date(guestCart.updatedAt || guestCart.createdAt),
          product,
        })
      }
    }

    return this.calculateCartSummary(cartItemsWithProducts)
  }

  // Add item to guest cart
  async addToGuestCart(
    sessionId: string,
    productId: string,
    quantity: number
  ): Promise<CartSummary> {
    // Check if product exists
    const product: Product | null =
      await productService.getProductById(productId)
    if (!product) {
      throw new Error('Product not found')
    }

    // Get or create guest cart
    const guestCart: GuestCart = CartService.guestCarts.get(sessionId) || {
      items: [],
      sessionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (!guestCart.items || !Array.isArray(guestCart.items)) {
      guestCart.items = []
    }

    // Find existing item
    const existingItemIndex: number = guestCart.items.findIndex(
      item => item.productId === productId
    )

    const newQuantity: number =
      existingItemIndex >= 0
        ? guestCart.items[existingItemIndex].quantity + quantity
        : quantity

    // Check stock availability
    if (product.stock < newQuantity) {
      throw new Error(
        `Insufficient stock. Available: ${product.stock}, Requested: ${newQuantity}`
      )
    }

    // Update or add item
    if (existingItemIndex >= 0) {
      guestCart.items[existingItemIndex].quantity = newQuantity
    } else {
      guestCart.items.push({
        productId,
        quantity,
      })
    }

    guestCart.updatedAt = new Date().toISOString()

    // Store guest cart in memory
    CartService.guestCarts.set(sessionId, guestCart)

    return this.getGuestCart(sessionId)
  }

  // Update guest cart item quantity
  async updateGuestCartItem(
    sessionId: string,
    productId: string,
    quantity: number
  ): Promise<CartSummary> {
    if (quantity === 0) {
      return this.removeFromGuestCart(sessionId, productId)
    }

    // Check product exists and stock
    const product: Product | null =
      await productService.getProductById(productId)
    if (!product) {
      throw new Error('Product not found')
    }

    if (product.stock < quantity) {
      throw new Error(
        `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`
      )
    }

    const guestCart: GuestCart | undefined =
      CartService.guestCarts.get(sessionId)
    if (!guestCart || !guestCart.items || !Array.isArray(guestCart.items)) {
      throw new Error('Guest cart not found')
    }

    const itemIndex: number = guestCart.items.findIndex(
      item => item.productId === productId
    )

    if (itemIndex === -1) {
      throw new Error('Cart item not found')
    }

    guestCart.items[itemIndex].quantity = quantity
    guestCart.updatedAt = new Date().toISOString()

    // Update guest cart in memory
    CartService.guestCarts.set(sessionId, guestCart)

    return this.getGuestCart(sessionId)
  }

  // Remove item from guest cart
  async removeFromGuestCart(
    sessionId: string,
    productId: string
  ): Promise<CartSummary> {
    const guestCart: GuestCart | undefined =
      CartService.guestCarts.get(sessionId)
    if (!guestCart || !guestCart.items || !Array.isArray(guestCart.items)) {
      return this.createEmptyCartSummary()
    }

    guestCart.items = guestCart.items.filter(
      item => item.productId !== productId
    )
    guestCart.updatedAt = new Date().toISOString()

    // Update guest cart in memory
    CartService.guestCarts.set(sessionId, guestCart)

    return this.getGuestCart(sessionId)
  }

  // Clear guest cart
  async clearGuestCart(sessionId: string): Promise<void> {
    const emptyCart: GuestCart = {
      items: [],
      sessionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Store empty cart in memory
    CartService.guestCarts.set(sessionId, emptyCart)
  }

  // Merge guest cart with authenticated user cart
  async mergeGuestCartWithUserCart(
    userId: string,
    guestSessionId: string
  ): Promise<CartSummary> {
    // Get guest cart
    const guestCart: GuestCart | undefined =
      CartService.guestCarts.get(guestSessionId)
    if (!guestCart || !guestCart.items || !Array.isArray(guestCart.items)) {
      return this.getUserCart(userId)
    }

    // Process each guest cart item
    for (const guestItem of guestCart.items) {
      try {
        const existingItem: CartItem | null = await prisma.cartItem.findUnique({
          where: {
            userId_productId: {
              userId,
              productId: guestItem.productId,
            },
          },
        })

        const newQuantity: number = existingItem
          ? existingItem.quantity + guestItem.quantity
          : guestItem.quantity

        // Check stock availability before merging
        const product: Product | null = await productService.getProductById(
          guestItem.productId
        )
        if (product && product.stock >= newQuantity) {
          await prisma.cartItem.upsert({
            where: {
              userId_productId: {
                userId,
                productId: guestItem.productId,
              },
            },
            create: {
              userId,
              productId: guestItem.productId,
              quantity: guestItem.quantity,
            },
            update: {
              quantity: newQuantity,
            },
          })
        }
      } catch (error: unknown) {
        console.warn(`Failed to merge item ${guestItem.productId}:`, error)
        // Continue with other items
      }
    }

    // Clean up guest cart from memory
    CartService.guestCarts.delete(guestSessionId)

    return this.getUserCart(userId)
  }

  // Validate cart contents (stock availability, product existence)
  async validateCart(
    userId: string | null,
    sessionId: string | null
  ): Promise<CartValidationResult> {
    const result: CartValidationResult = {
      isValid: true,
      errors: [],
      unavailableItems: [],
      stockIssues: [],
    }

    let cartItems: CartItemWithProduct[] = []

    if (userId) {
      const userCart: CartSummary = await this.getUserCart(userId)
      cartItems = userCart.items
    } else if (sessionId) {
      const guestCart: CartSummary = await this.getGuestCart(sessionId)
      cartItems = guestCart.items
    } else {
      result.errors.push('No cart found')
      result.isValid = false
      return result
    }

    for (const item of cartItems) {
      const product: Product | null = await productService.getProductById(
        item.productId
      )

      if (!product) {
        result.unavailableItems.push(item.productId)
        result.errors.push(`Product ${item.productId} no longer available`)
        result.isValid = false
        continue
      }

      if (product.stock < item.quantity) {
        result.stockIssues.push({
          productId: item.productId,
          requestedQuantity: item.quantity,
          availableStock: product.stock,
        })
        result.errors.push(
          `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        )
        result.isValid = false
      }
    }

    return result
  }

  // Clean up expired guest carts (utility method)
  static cleanupExpiredGuestCarts(): void {
    // In a real application, you'd want to implement TTL or periodic cleanup
    // For now, this is a placeholder for manual cleanup if needed
    console.log(`Current guest carts count: ${CartService.guestCarts.size}`)
  }

  // Helper methods
  private calculateCartSummary(items: CartItemWithProduct[]): CartSummary {
    const totalItems: number = items.reduce(
      (sum, item) => sum + item.quantity,
      0
    )
    const subtotal: number = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )

    return {
      items,
      totalItems,
      totalAmount: subtotal, // Could add taxes, shipping, etc. later
      subtotal,
    }
  }

  private createEmptyCartSummary(): CartSummary {
    return {
      items: [],
      totalItems: 0,
      totalAmount: 0,
      subtotal: 0,
    }
  }
}

export const cartService: CartService = new CartService()
