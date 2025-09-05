import { Router, Request, Response } from 'express'
import { cartController } from '../controllers/cart.controller'
import {
  requireAuth,
  optionalJWT,
  getAuthenticatedRequest,
  getOptionalAuthRequest,
} from '../middleware/auth.middleware'

const router: Router = Router()

// Get current cart (authenticated or guest)
router.get('/', optionalJWT, (req: Request, res: Response) => {
  const optionalAuthReq = getOptionalAuthRequest(req)
  return cartController.getCart(optionalAuthReq, res)
})

// Add item to cart (authenticated or guest)
router.post('/items', optionalJWT, (req: Request, res: Response) => {
  const optionalAuthReq = getOptionalAuthRequest(req)
  return cartController.addToCart(optionalAuthReq, res)
})

// Update cart item quantity (authenticated or guest)
router.put('/items/:productId', optionalJWT, (req: Request, res: Response) => {
  const optionalAuthReq = getOptionalAuthRequest(req)
  return cartController.updateCartItem(optionalAuthReq, res)
})

// Remove item from cart (authenticated or guest)
router.delete(
  '/items/:productId',
  optionalJWT,
  (req: Request, res: Response) => {
    const optionalAuthReq = getOptionalAuthRequest(req)
    return cartController.removeCartItem(optionalAuthReq, res)
  }
)

// Clear entire cart (authenticated or guest)
router.delete('/', optionalJWT, (req: Request, res: Response) => {
  const optionalAuthReq = getOptionalAuthRequest(req)
  return cartController.clearCart(optionalAuthReq, res)
})

// Merge guest cart with authenticated user cart (authenticated only)
router.post('/merge', requireAuth, (req: Request, res: Response) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return cartController.mergeCart(authReq, res)
})

// Validate cart contents (authenticated or guest)
router.get('/validate', optionalJWT, (req: Request, res: Response) => {
  const optionalAuthReq = getOptionalAuthRequest(req)
  return cartController.validateCart(optionalAuthReq, res)
})

export default router
