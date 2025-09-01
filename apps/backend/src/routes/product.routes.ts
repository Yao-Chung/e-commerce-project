import { Router, Request, Response } from 'express'
import { productController } from '../controllers/product.controller'
import {
  requireAuth,
  requireAdmin,
  getAuthenticatedRequest,
} from '../middleware/auth.middleware'
import {
  ProductCreateWithImageRequest,
  ProductUpdateWithImageRequest,
} from '../types/upload.types'
import {
  uploadSingle,
  handleUploadError,
} from '../middleware/upload.middleware'

const router: Router = Router()

// Type guard functions for type safety
function isProductCreateWithImageRequest(
  req: Request
): req is ProductCreateWithImageRequest {
  return (
    'user' in req &&
    req.user !== undefined &&
    'body' in req &&
    typeof req.body === 'object' &&
    req.body !== null &&
    typeof req.body.name === 'string' &&
    typeof req.body.description === 'string' &&
    typeof req.body.price === 'number' &&
    typeof req.body.category === 'string' &&
    typeof req.body.stock === 'number' &&
    'file' in req &&
    (req.file === undefined || req.file !== null)
  )
}

function isProductUpdateWithImageRequest(
  req: Request
): req is ProductUpdateWithImageRequest {
  return (
    'user' in req &&
    req.user !== undefined &&
    'params' in req &&
    typeof req.params === 'object' &&
    req.params !== null &&
    typeof req.params.id === 'string' &&
    'body' in req &&
    typeof req.body === 'object' &&
    req.body !== null &&
    'file' in req &&
    (req.file === undefined || req.file !== null)
  )
}

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
router.post('/', requireAuth, (req: Request, res: Response) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return requireAdmin(authReq, res, () => {
    return productController.createProduct(authReq, res)
  })
})

router.put('/:id', requireAuth, (req: Request, res: Response) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return requireAdmin(authReq, res, () => {
    return productController.updateProduct(authReq, res)
  })
})

router.delete('/:id', requireAuth, (req: Request, res: Response) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return requireAdmin(authReq, res, () => {
    return productController.deleteProduct(authReq, res)
  })
})

router.patch('/:id/stock', requireAuth, (req: Request, res: Response) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return requireAdmin(authReq, res, () => {
    return productController.updateStock(authReq, res)
  })
})

// Product creation and update with image upload
router.post(
  '/with-image',
  requireAuth,
  uploadSingle('image'),
  handleUploadError,
  (req: Request, res: Response) => {
    // Type-safe check before proceeding
    if (!isProductCreateWithImageRequest(req)) {
      res.status(400).json({
        error: 'Invalid request format',
        message:
          'Request does not match expected ProductCreateWithImageRequest format',
      })
      return
    }

    requireAdmin(req, res, () => {
      productController.createProductWithImage(req, res)
    })
  }
)

router.put(
  '/:id/with-image',
  requireAuth,
  uploadSingle('image'),
  handleUploadError,
  (req: Request, res: Response) => {
    // Type-safe check before proceeding
    if (!isProductUpdateWithImageRequest(req)) {
      res.status(400).json({
        error: 'Invalid request format',
        message:
          'Request does not match expected ProductUpdateWithImageRequest format',
      })
      return
    }

    requireAdmin(req, res, () => {
      productController.updateProductWithImage(req, res)
    })
  }
)

export default router
