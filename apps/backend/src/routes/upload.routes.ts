import { Router } from 'express'
import { uploadController } from '../controllers/upload.controller'
import {
  authenticateJWT,
  withAuth,
  requireAdmin,
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
  authenticateJWT,
  uploadSingle('image'),
  handleUploadError,
  requireSingleFile,
  withAuth((req, res) => {
    uploadController.uploadSingle(req, res)
  })
)

router.post(
  '/multiple',
  authenticateJWT,
  uploadMultiple('images', 10),
  handleUploadError,
  requireFiles,
  withAuth((req, res) => {
    uploadController.uploadMultiple(req, res)
  })
)

// Admin-only endpoints for image management
router.delete(
  '/delete',
  authenticateJWT,
  withAuth((req, res) => {
    requireAdmin(req, res, () => {
      uploadController.deleteImage(req, res)
    })
  })
)

router.delete(
  '/delete-multiple',
  authenticateJWT,
  withAuth((req, res) => {
    requireAdmin(req, res, () => {
      uploadController.deleteMultiple(req, res)
    })
  })
)

// Image information endpoints (authenticated users)
router.get(
  '/details/:publicId',
  authenticateJWT,
  withAuth((req, res) => {
    uploadController.getImageDetails(req, res)
  })
)

router.post(
  '/transform/:publicId',
  authenticateJWT,
  withAuth((req, res) => {
    uploadController.generateTransformationUrl(req, res)
  })
)

export default router
