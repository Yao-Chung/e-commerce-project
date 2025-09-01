import { Router } from 'express'
import { wishlistController } from '../controllers/wishlist.controller'
import {
  requireAuth,
  getAuthenticatedRequest,
} from '../middleware/auth.middleware'

const router: Router = Router()

// Apply authentication middleware to all routes
router.use(requireAuth)

// Wishlist management routes
router.get('/', (req, res) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return wishlistController.getUserWishlist(authReq, res)
})
router.post('/', (req, res) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return wishlistController.addToWishlist(authReq, res)
})
router.delete('/:productId', (req, res) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return wishlistController.removeFromWishlist(authReq, res)
})
router.post('/:productId/move-to-cart', (req, res) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return wishlistController.moveToCart(authReq, res)
})
router.get('/:productId/status', (req, res) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return wishlistController.checkWishlistStatus(authReq, res)
})
router.get('/count', (req, res) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return wishlistController.getWishlistCount(authReq, res)
})
router.delete('/', (req, res) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return wishlistController.clearWishlist(authReq, res)
})

export default router
