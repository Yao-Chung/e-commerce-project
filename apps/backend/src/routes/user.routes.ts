import { Router } from 'express'
import { userController } from '../controllers/user.controller'
import { requireAuth } from '../middleware/auth.middleware'
import { uploadMiddleware } from '../middleware/upload.middleware'
import { AuthenticatedRequest } from '../types/user.types'

const router: Router = Router()

// Apply authentication middleware to all routes
router.use(requireAuth)

// Profile management routes
router.get('/profile', (req, res) =>
  userController.getProfile(req as AuthenticatedRequest, res)
)
router.put('/profile', (req, res) =>
  userController.updateProfile(req as AuthenticatedRequest, res)
)
router.put('/avatar', (req, res) =>
  userController.updateAvatar(req as AuthenticatedRequest, res)
)
router.post('/avatar/upload', uploadMiddleware.single('avatar'), (req, res) =>
  userController.uploadAvatar(req as AuthenticatedRequest, res)
)
router.delete('/account', (req, res) =>
  userController.deleteAccount(req as AuthenticatedRequest, res)
)
router.get('/profile/completion', (req, res) =>
  userController.getProfileCompletion(req as AuthenticatedRequest, res)
)

export default router
