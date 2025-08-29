import { Router, Request, Response } from 'express'
import { productController } from '../controllers/product.controller'
import { authenticateJWT, requireAdmin } from '../middleware/auth.middleware'
import { AuthenticatedRequest } from '../types/auth.types'
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
router.post('/', authenticateJWT, (req: Request, res: Response) => {
  requireAdmin(req as AuthenticatedRequest, res, () => {
    productController.createProduct(req as AuthenticatedRequest, res)
  })
})

router.put('/:id', authenticateJWT, (req: Request, res: Response) => {
  requireAdmin(req as AuthenticatedRequest, res, () => {
    productController.updateProduct(req as AuthenticatedRequest, res)
  })
})

router.delete('/:id', authenticateJWT, (req: Request, res: Response) => {
  requireAdmin(req as AuthenticatedRequest, res, () => {
    productController.deleteProduct(req as AuthenticatedRequest, res)
  })
})

router.patch('/:id/stock', authenticateJWT, (req: Request, res: Response) => {
  requireAdmin(req as AuthenticatedRequest, res, () => {
    productController.updateStock(req as AuthenticatedRequest, res)
  })
})

// Product creation and update with image upload
router.post(
  '/with-image',
  authenticateJWT,
  uploadSingle('image'),
  handleUploadError,
  (req: Request, res: Response) => {
    requireAdmin(req as AuthenticatedRequest, res, () => {
      productController.createProductWithImage(req as AuthenticatedRequest, res)
    })
  }
)

router.put(
  '/:id/with-image',
  authenticateJWT,
  uploadSingle('image'),
  handleUploadError,
  (req: Request, res: Response) => {
    requireAdmin(req as AuthenticatedRequest, res, () => {
      productController.updateProductWithImage(
        req as ProductUpdateWithImageRequest,
        res
      )
    })
  }
)

export default router
