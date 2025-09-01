import { Router, Request, Response } from 'express'
import { uploadController } from '../controllers/upload.controller'
import {
  requireAuth,
  requireAdmin,
  getAuthenticatedRequest,
} from '../middleware/auth.middleware'
import {
  uploadSingle,
  uploadMultiple,
  handleUploadError,
  requireSingleFile,
  requireFiles,
} from '../middleware/upload.middleware'

const router: Router = Router()

// Public upload endpoints (authenticated users only)
router.post(
  '/single',
  requireAuth,
  uploadSingle('image'),
  handleUploadError,
  requireSingleFile,
  (req: Request, res: Response) => {
    const authReq = getAuthenticatedRequest(req)
    if (!authReq) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    return uploadController.uploadSingle(authReq, res)
  }
)

router.post(
  '/multiple',
  requireAuth,
  uploadMultiple('images', 10),
  handleUploadError,
  requireFiles,
  (req: Request, res: Response) => {
    const authReq = getAuthenticatedRequest(req)
    if (!authReq) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    return uploadController.uploadMultiple(authReq, res)
  }
)

// Admin-only endpoints for image management
router.delete('/delete', requireAuth, (req: Request, res: Response) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return requireAdmin(authReq, res, () => {
    return uploadController.deleteImage(authReq, res)
  })
})

router.delete(
  '/delete-multiple',
  requireAuth,
  (req: Request, res: Response) => {
    const authReq = getAuthenticatedRequest(req)
    if (!authReq) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    return requireAdmin(authReq, res, () => {
      return uploadController.deleteMultiple(authReq, res)
    })
  }
)

// Image information endpoints (authenticated users)
router.get('/details/:publicId', requireAuth, (req: Request, res: Response) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return uploadController.getImageDetails(authReq, res)
})

router.post(
  '/transform/:publicId',
  requireAuth,
  (req: Request, res: Response) => {
    const authReq = getAuthenticatedRequest(req)
    if (!authReq) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    return uploadController.generateTransformationUrl(authReq, res)
  }
)

export default router
