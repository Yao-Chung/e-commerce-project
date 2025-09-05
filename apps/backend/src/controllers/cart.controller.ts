import { Response } from 'express'
import { z } from 'zod'
import { v4 as generateUuid } from 'uuid'
import { cartService } from '../services/cart.service'
import {
  AddToCartRequest,
  UpdateCartItemRequest,
  MergeCartRequest,
  CartResponse,
  OptionalAuthRequest,
} from '../types/cart.types'
import { AuthenticatedRequest } from '../types/auth.types'

// Validation schemas
const addToCartSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .positive('Quantity must be positive'),
})

const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(0, 'Quantity cannot be negative'),
})

const mergeCartSchema = z.object({
  guestSessionId: z.string().min(1, 'Guest session ID is required'),
})

// Type guards
function isValidProductId(params: unknown): params is { productId: string } {
  if (typeof params !== 'object' || params === null) {
    return false
  }

  const hasProductId: boolean = 'productId' in params
  if (!hasProductId) {
    return false
  }

  // Safe property access after 'in' check
  const obj = params as Record<string, unknown>
  const productId: unknown = obj.productId
  return typeof productId === 'string' && productId.length > 0
}

function getSessionIdFromHeaders(
  headers: Record<string, unknown>
): string | null {
  const sessionId: unknown = headers['x-session-id']
  if (typeof sessionId === 'string' && sessionId.length > 0) {
    return sessionId
  }
  return null
}

function getSessionIdForGuest(req: OptionalAuthRequest): string | null {
  const sessionID: string | undefined = req.sessionID
  if (sessionID && sessionID.length > 0) {
    return sessionID
  }
  return getSessionIdFromHeaders(req.headers)
}

export class CartController {
  // Get current cart (authenticated or guest)
  async getCart(req: OptionalAuthRequest, res: Response): Promise<void> {
    try {
      let cartResponse: CartResponse

      if (req.user) {
        // Authenticated user
        const cart = await cartService.getUserCart(req.user.id)
        cartResponse = {
          cart,
          isGuest: false,
        }
      } else {
        // Guest user - use session ID or create new one
        const sessionId: string = req.sessionID || generateUuid()
        const cart = await cartService.getGuestCart(sessionId)
        cartResponse = {
          cart,
          isGuest: true,
        }

        // Set session ID in response headers for frontend to store
        res.setHeader('X-Session-ID', sessionId)
      }

      res.json({
        message: 'Cart retrieved successfully',
        data: cartResponse,
      })
    } catch (error: unknown) {
      console.error('Get cart error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve cart',
      })
    }
  }

  // Add item to cart (authenticated or guest)
  async addToCart(req: OptionalAuthRequest, res: Response): Promise<void> {
    try {
      const validationResult = addToCartSchema.safeParse(req.body)
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.issues,
        })
        return
      }

      const { productId, quantity }: AddToCartRequest = validationResult.data

      let cartResponse: CartResponse

      if (req.user) {
        // Authenticated user
        const cart = await cartService.addToUserCart(
          req.user.id,
          productId,
          quantity
        )
        cartResponse = {
          cart,
          isGuest: false,
        }
      } else {
        // Guest user
        const sessionId: string = req.sessionID || generateUuid()
        const cart = await cartService.addToGuestCart(
          sessionId,
          productId,
          quantity
        )
        cartResponse = {
          cart,
          isGuest: true,
        }

        // Set session ID in response headers for frontend to store
        res.setHeader('X-Session-ID', sessionId)
      }

      res.status(201).json({
        message: 'Item added to cart successfully',
        data: cartResponse,
      })
    } catch (error: unknown) {
      console.error('Add to cart error:', error)

      if (error instanceof Error) {
        if (error.message.includes('Product not found')) {
          res.status(404).json({
            error: 'Not found',
            message: error.message,
          })
          return
        }

        if (error.message.includes('Insufficient stock')) {
          res.status(400).json({
            error: 'Bad request',
            message: error.message,
          })
          return
        }
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to add item to cart',
      })
    }
  }

  // Update cart item quantity (authenticated or guest)
  async updateCartItem(req: OptionalAuthRequest, res: Response): Promise<void> {
    try {
      if (!isValidProductId(req.params)) {
        res.status(400).json({
          error: 'Bad request',
          message: 'Product ID is required',
        })
        return
      }

      const { productId } = req.params

      const validationResult = updateCartItemSchema.safeParse(req.body)
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.issues,
        })
        return
      }

      const { quantity }: UpdateCartItemRequest = validationResult.data

      let cartResponse: CartResponse

      if (req.user) {
        // Authenticated user
        const cart = await cartService.updateUserCartItem(
          req.user.id,
          productId,
          quantity
        )
        cartResponse = {
          cart,
          isGuest: false,
        }
      } else {
        // Guest user
        const sessionId: string =
          req.sessionID || (req.headers['x-session-id'] as string)
        if (!sessionId) {
          res.status(400).json({
            error: 'Bad request',
            message: 'Session ID is required for guest users',
          })
          return
        }

        const cart = await cartService.updateGuestCartItem(
          sessionId,
          productId,
          quantity
        )
        cartResponse = {
          cart,
          isGuest: true,
        }
      }

      res.json({
        message:
          quantity === 0
            ? 'Item removed from cart successfully'
            : 'Cart item updated successfully',
        data: cartResponse,
      })
    } catch (error: unknown) {
      console.error('Update cart item error:', error)

      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          res.status(404).json({
            error: 'Not found',
            message: error.message,
          })
          return
        }

        if (error.message.includes('Insufficient stock')) {
          res.status(400).json({
            error: 'Bad request',
            message: error.message,
          })
          return
        }
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update cart item',
      })
    }
  }

  // Remove item from cart (authenticated or guest)
  async removeCartItem(req: OptionalAuthRequest, res: Response): Promise<void> {
    try {
      if (!isValidProductId(req.params)) {
        res.status(400).json({
          error: 'Bad request',
          message: 'Product ID is required',
        })
        return
      }

      const { productId } = req.params

      let cartResponse: CartResponse

      if (req.user) {
        // Authenticated user
        const cart = await cartService.removeFromUserCart(
          req.user.id,
          productId
        )
        cartResponse = {
          cart,
          isGuest: false,
        }
      } else {
        // Guest user
        const sessionId: string | null = getSessionIdForGuest(req)
        if (!sessionId) {
          res.status(400).json({
            error: 'Bad request',
            message: 'Session ID is required for guest users',
          })
          return
        }

        const cart = await cartService.removeFromGuestCart(sessionId, productId)
        cartResponse = {
          cart,
          isGuest: true,
        }
      }

      res.json({
        message: 'Item removed from cart successfully',
        data: cartResponse,
      })
    } catch (error: unknown) {
      console.error('Remove cart item error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to remove item from cart',
      })
    }
  }

  // Clear entire cart (authenticated or guest)
  async clearCart(req: OptionalAuthRequest, res: Response): Promise<void> {
    try {
      if (req.user) {
        // Authenticated user
        await cartService.clearUserCart(req.user.id)
      } else {
        // Guest user
        const sessionId: string | null = getSessionIdForGuest(req)
        if (!sessionId) {
          res.status(400).json({
            error: 'Bad request',
            message: 'Session ID is required for guest users',
          })
          return
        }

        await cartService.clearGuestCart(sessionId)
      }

      res.json({
        message: 'Cart cleared successfully',
        data: { message: 'All items have been removed from your cart' },
      })
    } catch (error: unknown) {
      console.error('Clear cart error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to clear cart',
      })
    }
  }

  // Merge guest cart with authenticated user cart
  async mergeCart(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        })
        return
      }

      const validationResult = mergeCartSchema.safeParse(req.body)
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.issues,
        })
        return
      }

      const { guestSessionId }: MergeCartRequest = validationResult.data

      const cart = await cartService.mergeGuestCartWithUserCart(
        req.user.id,
        guestSessionId
      )

      const cartResponse: CartResponse = {
        cart,
        isGuest: false,
      }

      res.json({
        message: 'Guest cart merged successfully',
        data: cartResponse,
      })
    } catch (error: unknown) {
      console.error('Merge cart error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to merge cart',
      })
    }
  }

  // Validate cart (authenticated or guest)
  async validateCart(req: OptionalAuthRequest, res: Response): Promise<void> {
    try {
      let userId: string | null = null
      let sessionId: string | null = null

      if (req.user) {
        userId = req.user.id
      } else {
        sessionId = getSessionIdForGuest(req)
        if (!sessionId) {
          res.status(400).json({
            error: 'Bad request',
            message: 'Session ID is required for guest users',
          })
          return
        }
      }

      const validationResult = await cartService.validateCart(userId, sessionId)

      res.json({
        message: 'Cart validation completed',
        data: validationResult,
      })
    } catch (error: unknown) {
      console.error('Validate cart error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to validate cart',
      })
    }
  }
}

export const cartController: CartController = new CartController()
