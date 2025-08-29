import { Request, Response } from 'express'
import { z } from 'zod'
import { productService } from '../services/product.service'
import {
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductFilters,
  ProductListResponse,
  ProductQueryParams,
} from '../types/product.types'
import { AuthenticatedRequest } from '../types/auth.types'

// Validation schemas
const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255, 'Name too long'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(100, 'Category too long'),
  imageUrl: z.url('Invalid image URL').nullable().optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
})

const updateProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(255, 'Name too long')
    .optional(),
  description: z.string().min(1, 'Description is required').optional(),
  price: z.number().positive('Price must be positive').optional(),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(100, 'Category too long')
    .optional(),
  imageUrl: z.url('Invalid image URL').nullable().optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative').optional(),
})

const queryParamsSchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
  category: z.string().optional(),
  minPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/, 'Min price must be a number')
    .optional(),
  maxPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/, 'Max price must be a number')
    .optional(),
  search: z.string().optional(),
  inStock: z
    .string()
    .regex(/^(true|false)$/, 'InStock must be true or false')
    .optional(),
  sortBy: z.enum(['name', 'price', 'createdAt', 'stock']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export class ProductController {
  // Create a new product (Admin only)
  async createProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validationResult = createProductSchema.safeParse(req.body)
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.issues,
        })
        return
      }

      const productData: ProductCreateRequest = {
        ...validationResult.data,
        imageUrl: validationResult.data.imageUrl || null,
      }

      const product = await productService.createProduct(productData)

      res.status(201).json({
        message: 'Product created successfully',
        data: { product },
      })
    } catch (error) {
      console.error('Create product error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create product',
      })
    }
  }

  // Get all products with filtering and pagination
  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const queryValidation = queryParamsSchema.safeParse(req.query)
      if (!queryValidation.success) {
        res.status(400).json({
          error: 'Invalid query parameters',
          details: queryValidation.error.issues,
        })
        return
      }

      const query: ProductQueryParams = {
        page: queryValidation.data.page || null,
        limit: queryValidation.data.limit || null,
        category: queryValidation.data.category || null,
        minPrice: queryValidation.data.minPrice || null,
        maxPrice: queryValidation.data.maxPrice || null,
        search: queryValidation.data.search || null,
        inStock: queryValidation.data.inStock || null,
        sortBy: queryValidation.data.sortBy || null,
        sortOrder: queryValidation.data.sortOrder || null,
      }

      const page: number = parseInt(query.page || '1')
      const limit: number = Math.min(parseInt(query.limit || '10'), 50) // Max 50 items per page

      const filters: ProductFilters = {
        category: query.category || null,
        minPrice: query.minPrice ? parseFloat(query.minPrice) : null,
        maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : null,
        search: query.search || null,
        inStock: query.inStock ? query.inStock === 'true' : null,
      }

      const sortBy: string = query.sortBy || 'createdAt'
      const sortOrder: 'asc' | 'desc' =
        (query.sortOrder as 'asc' | 'desc') || 'desc'

      const { products, total } = await productService.getAllProducts(
        page,
        limit,
        filters,
        sortBy,
        sortOrder
      )

      const response: ProductListResponse = {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }

      res.json({
        message: 'Products retrieved successfully',
        data: response,
      })
    } catch (error) {
      console.error('Get products error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve products',
      })
    }
  }

  // Get product by ID
  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string }

      if (!id || typeof id !== 'string') {
        res.status(400).json({
          error: 'Bad request',
          message: 'Product ID is required',
        })
        return
      }

      const product = await productService.getProductById(id)

      if (!product) {
        res.status(404).json({
          error: 'Not found',
          message: 'Product not found',
        })
        return
      }

      res.json({
        message: 'Product retrieved successfully',
        data: { product },
      })
    } catch (error) {
      console.error('Get product error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve product',
      })
    }
  }

  // Update product (Admin only)
  async updateProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string }

      if (!id || typeof id !== 'string') {
        res.status(400).json({
          error: 'Bad request',
          message: 'Product ID is required',
        })
        return
      }

      const validationResult = updateProductSchema.safeParse(req.body)
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.issues,
        })
        return
      }

      const updateData: ProductUpdateRequest = validationResult.data

      const product = await productService.updateProduct(id, updateData)

      if (!product) {
        res.status(404).json({
          error: 'Not found',
          message: 'Product not found',
        })
        return
      }

      res.json({
        message: 'Product updated successfully',
        data: { product },
      })
    } catch (error) {
      console.error('Update product error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update product',
      })
    }
  }

  // Delete product (Admin only)
  async deleteProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string }

      if (!id || typeof id !== 'string') {
        res.status(400).json({
          error: 'Bad request',
          message: 'Product ID is required',
        })
        return
      }

      const deleted: boolean = await productService.deleteProduct(id)

      if (!deleted) {
        res.status(404).json({
          error: 'Not found',
          message: 'Product not found',
        })
        return
      }

      res.json({
        message: 'Product deleted successfully',
      })
    } catch (error) {
      console.error('Delete product error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete product',
      })
    }
  }

  // Get all categories
  async getAllCategories(_: Request, res: Response): Promise<void> {
    try {
      const categories = await productService.getAllCategories()

      res.json({
        message: 'Categories retrieved successfully',
        data: { categories },
      })
    } catch (error) {
      console.error('Get categories error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve categories',
      })
    }
  }

  // Get products by category
  async getProductsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params
      const page: number = parseInt((req.query.page as string) || '1')
      const limit: number = Math.min(
        parseInt((req.query.limit as string) || '10'),
        50
      )

      if (!category || typeof category !== 'string') {
        res.status(400).json({
          error: 'Bad request',
          message: 'Category is required',
        })
        return
      }

      const { products, total } = await productService.getProductsByCategory(
        category,
        page,
        limit
      )

      const response: ProductListResponse = {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }

      res.json({
        message: 'Products retrieved successfully',
        data: response,
      })
    } catch (error) {
      console.error('Get products by category error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve products',
      })
    }
  }

  // Search products
  async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query
      const page: number = parseInt((req.query.page as string) || '1')
      const limit: number = Math.min(
        parseInt((req.query.limit as string) || '10'),
        50
      )

      if (!q || typeof q !== 'string' || q.trim().length === 0) {
        res.status(400).json({
          error: 'Bad request',
          message: 'Search query is required',
        })
        return
      }

      const { products, total } = await productService.searchProducts(
        q.trim(),
        page,
        limit
      )

      const response: ProductListResponse = {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }

      res.json({
        message: 'Search completed successfully',
        data: response,
      })
    } catch (error) {
      console.error('Search products error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to search products',
      })
    }
  }

  // Update product stock (Admin only)
  async updateStock(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string }
      const { quantity } = req.body as { quantity: number }

      if (!id || typeof id !== 'string') {
        res.status(400).json({
          error: 'Bad request',
          message: 'Product ID is required',
        })
        return
      }

      if (typeof quantity !== 'number') {
        res.status(400).json({
          error: 'Bad request',
          message: 'Quantity must be a number',
        })
        return
      }

      const product = await productService.updateStock(id, quantity)

      if (!product) {
        res.status(404).json({
          error: 'Not found',
          message: 'Product not found',
        })
        return
      }

      res.json({
        message: 'Stock updated successfully',
        data: { product },
      })
    } catch (error) {
      console.error('Update stock error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update stock',
      })
    }
  }
}

export const productController: ProductController = new ProductController()
