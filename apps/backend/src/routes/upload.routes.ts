import { Router, Request, Response } from 'express'
import { uploadController } from '../controllers/upload.controller'
import { requireAuth, requireAdmin } from '../middleware/auth.middleware'
import { AuthenticatedRequest } from '../types/auth.types'
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
    uploadController.uploadSingle(req as AuthenticatedRequest, res)
  }
)

router.post(
  '/multiple',
  requireAuth,
  uploadMultiple('images', 10),
  handleUploadError,
  requireFiles,
  (req: Request, res: Response) => {
    uploadController.uploadMultiple(req as AuthenticatedRequest, res)
  }
)

// Admin-only endpoints for image management
router.delete('/delete', requireAuth, (req: Request, res: Response) => {
  requireAdmin(req as AuthenticatedRequest, res, () => {
    uploadController.deleteImage(req as AuthenticatedRequest, res)
  })
})

router.delete(
  '/delete-multiple',
  requireAuth,
  (req: Request, res: Response) => {
    requireAdmin(req as AuthenticatedRequest, res, () => {
      uploadController.deleteMultiple(req as AuthenticatedRequest, res)
    })
  }
)

// Image information endpoints (authenticated users)
router.get('/details/:publicId', requireAuth, (req: Request, res: Response) => {
  uploadController.getImageDetails(req as AuthenticatedRequest, res)
})

router.post(
  '/transform/:publicId',
  requireAuth,
  (req: Request, res: Response) => {
    uploadController.generateTransformationUrl(req as AuthenticatedRequest, res)
  }
)

export default router
