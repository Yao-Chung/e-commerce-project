import { Response } from 'express'
import { z } from 'zod'
import { wishlistService } from '../services/wishlist.service'
import {
  AuthenticatedRequest,
  AddToWishlistRequestBody,
  MoveToCartRequestBody,
} from '../types/wishlist.types'

// Validation schemas
const addToWishlistSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
})

const moveToCartSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z
    .number()
    .int()
    .positive('Quantity must be a positive integer')
    .optional(),
})

export class WishlistController {
  // Get user's wishlist
  async getUserWishlist(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const wishlist = await wishlistService.getUserWishlist(req.user.id)

      res.status(200).json({
        message: 'Wishlist retrieved successfully',
        data: wishlist,
      })
    } catch (error) {
      console.error('Get wishlist error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve wishlist',
      })
    }
  }

  // Add item to wishlist
  async addToWishlist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validationResult = addToWishlistSchema.safeParse(req.body)
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.issues,
        })
        return
      }

      const { productId }: AddToWishlistRequestBody = validationResult.data
      const wishlistItem = await wishlistService.addToWishlist(req.user.id, {
        productId,
      })

      res.status(201).json({
        message: 'Item added to wishlist successfully',
        data: wishlistItem,
      })
    } catch (error) {
      console.error('Add to wishlist error:', error)

      if (error instanceof Error) {
        if (error.message === 'Product not found') {
          res.status(404).json({
            error: 'Not found',
            message: 'Product not found',
          })
          return
        }
        if (error.message === 'Product already in wishlist') {
          res.status(409).json({
            error: 'Conflict',
            message: 'Product already in wishlist',
          })
          return
        }
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to add item to wishlist',
      })
    }
  }

  // Remove item from wishlist
  async removeFromWishlist(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { productId } = req.params

      // Validate product ID format
      if (!z.string().uuid().safeParse(productId).success) {
        res.status(400).json({
          error: 'Bad request',
          message: 'Invalid product ID format',
        })
        return
      }

      await wishlistService.removeFromWishlist(req.user.id, productId)

      res.status(200).json({
        message: 'Item removed from wishlist successfully',
      })
    } catch (error) {
      console.error('Remove from wishlist error:', error)

      if (error instanceof Error) {
        if (error.message === 'Product not found in wishlist') {
          res.status(404).json({
            error: 'Not found',
            message: 'Product not found in wishlist',
          })
          return
        }
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to remove item from wishlist',
      })
    }
  }

  // Move item from wishlist to cart
  async moveToCart(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validationResult = moveToCartSchema.safeParse(req.body)
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.issues,
        })
        return
      }

      const { productId, quantity }: MoveToCartRequestBody =
        validationResult.data
      await wishlistService.moveToCart(req.user.id, { productId, quantity })

      res.status(200).json({
        message: 'Item moved to cart successfully',
      })
    } catch (error) {
      console.error('Move to cart error:', error)

      if (error instanceof Error) {
        if (error.message === 'Product not found in wishlist') {
          res.status(404).json({
            error: 'Not found',
            message: 'Product not found in wishlist',
          })
          return
        }
        if (error.message === 'Product not found') {
          res.status(404).json({
            error: 'Not found',
            message: 'Product not found',
          })
          return
        }
        if (error.message === 'Product is out of stock') {
          res.status(400).json({
            error: 'Bad request',
            message: 'Product is out of stock',
          })
          return
        }
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to move item to cart',
      })
    }
  }

  // Check if product is in wishlist
  async checkWishlistStatus(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { productId } = req.params

      // Validate product ID format
      if (!z.string().uuid().safeParse(productId).success) {
        res.status(400).json({
          error: 'Bad request',
          message: 'Invalid product ID format',
        })
        return
      }

      const isInWishlist = await wishlistService.isInWishlist(
        req.user.id,
        productId
      )

      res.status(200).json({
        message: 'Wishlist status checked successfully',
        data: {
          productId,
          isInWishlist,
        },
      })
    } catch (error) {
      console.error('Check wishlist status error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to check wishlist status',
      })
    }
  }

  // Get wishlist count
  async getWishlistCount(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const count = await wishlistService.getWishlistCount(req.user.id)

      res.status(200).json({
        message: 'Wishlist count retrieved successfully',
        data: {
          count,
        },
      })
    } catch (error) {
      console.error('Get wishlist count error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to get wishlist count',
      })
    }
  }

  // Clear wishlist
  async clearWishlist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await wishlistService.clearWishlist(req.user.id)

      res.status(200).json({
        message: 'Wishlist cleared successfully',
      })
    } catch (error) {
      console.error('Clear wishlist error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to clear wishlist',
      })
    }
  }
}

export const wishlistController = new WishlistController()
