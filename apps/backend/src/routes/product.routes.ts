import { Router } from 'express'
import { productController } from '../controllers/product.controller'
import {
  authenticateJWT,
  withAuth,
  requireAdmin,
} from '../middleware/auth.middleware'
import {
  uploadSingle,
  handleUploadError,
} from '../middleware/upload.middleware'
import { ProductUpdateWithImageRequest } from '../types/upload.types'

const router: Router = Router()

// Public routes (no authentication required)
router.get('/', productController.getAllProducts.bind(productController))
router.get(
  '/categories',
  productController.getAllCategories.bind(productController)
)
router.get(
  '/category/:category',
  productController.getProductsByCategory.bind(productController)
)
router.get('/:id', productController.getProductById.bind(productController))

// Admin-only routes (authentication + admin role required)
router.post(
  '/',
  authenticateJWT,
  withAuth((req, res) => {
    requireAdmin(req, res, () => {
      productController.createProduct(req, res)
    })
  })
)

router.put(
  '/:id',
  authenticateJWT,
  withAuth((req, res) => {
    requireAdmin(req, res, () => {
      productController.updateProduct(req, res)
    })
  })
)

router.delete(
  '/:id',
  authenticateJWT,
  withAuth((req, res) => {
    requireAdmin(req, res, () => {
      productController.deleteProduct(req, res)
    })
  })
)

router.patch(
  '/:id/stock',
  authenticateJWT,
  withAuth((req, res) => {
    requireAdmin(req, res, () => {
      productController.updateStock(req, res)
    })
  })
)

// Product creation and update with image upload
router.post(
  '/with-image',
  authenticateJWT,
  uploadSingle('image'),
  handleUploadError,
  withAuth((req, res) => {
    requireAdmin(req, res, () => {
      productController.createProductWithImage(req, res)
    })
  })
)

router.put(
  '/:id/with-image',
  authenticateJWT,
  uploadSingle('image'),
  handleUploadError,
  withAuth((req, res) => {
    requireAdmin(req, res, () => {
      productController.updateProductWithImage(
        req as ProductUpdateWithImageRequest,
        res
      )
    })
  })
)

export default router
