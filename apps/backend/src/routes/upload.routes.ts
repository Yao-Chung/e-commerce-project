import { Router, Request, Response } from 'express'
import { uploadController } from '../controllers/upload.controller'
import { authenticateJWT, requireAdmin } from '../middleware/auth.middleware'
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
  authenticateJWT,
  uploadSingle('image'),
  handleUploadError,
  requireSingleFile,
  (req: Request, res: Response) => {
    uploadController.uploadSingle(req as AuthenticatedRequest, res)
  }
)

router.post(
  '/multiple',
  authenticateJWT,
  uploadMultiple('images', 10),
  handleUploadError,
  requireFiles,
  (req: Request, res: Response) => {
    uploadController.uploadMultiple(req as AuthenticatedRequest, res)
  }
)

// Admin-only endpoints for image management
router.delete('/delete', authenticateJWT, (req: Request, res: Response) => {
  requireAdmin(req as AuthenticatedRequest, res, () => {
    uploadController.deleteImage(req as AuthenticatedRequest, res)
  })
})

router.delete(
  '/delete-multiple',
  authenticateJWT,
  (req: Request, res: Response) => {
    requireAdmin(req as AuthenticatedRequest, res, () => {
      uploadController.deleteMultiple(req as AuthenticatedRequest, res)
    })
  }
)

// Image information endpoints (authenticated users)
router.get(
  '/details/:publicId',
  authenticateJWT,
  (req: Request, res: Response) => {
    uploadController.getImageDetails(req as AuthenticatedRequest, res)
  }
)

router.post(
  '/transform/:publicId',
  authenticateJWT,
  (req: Request, res: Response) => {
    uploadController.generateTransformationUrl(req as AuthenticatedRequest, res)
  }
)

export default router
