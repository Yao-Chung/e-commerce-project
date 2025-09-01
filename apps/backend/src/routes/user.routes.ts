import { Router, Request, Response } from 'express'
import { userController } from '../controllers/user.controller'
import {
  requireAuth,
  getAuthenticatedRequest,
} from '../middleware/auth.middleware'
import { uploadMiddleware } from '../middleware/upload.middleware'

const router: Router = Router()

// Apply authentication middleware to all routes
router.use(requireAuth)

// Profile management routes
router.get('/profile', (req: Request, res: Response) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return userController.getProfile(authReq, res)
})

router.put('/profile', (req: Request, res: Response) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return userController.updateProfile(authReq, res)
})

router.put('/avatar', (req: Request, res: Response) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return userController.updateAvatar(authReq, res)
})

router.post(
  '/avatar/upload',
  uploadMiddleware.single('avatar'),
  (req: Request, res: Response) => {
    const authReq = getAuthenticatedRequest(req)
    if (!authReq) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    return userController.uploadAvatar(authReq, res)
  }
)

router.delete('/account', (req: Request, res: Response) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return userController.deleteAccount(authReq, res)
})

router.get('/profile/completion', (req: Request, res: Response) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return userController.getProfileCompletion(authReq, res)
})

export default router
