import { Request, Response } from 'express'
import { Product } from '@prisma/client'
import { AuthenticatedRequest } from './auth.types'

export type ProductCreateRequest = {
  name: string
  description: string
  price: number
  category: string
  imageUrl: string | null | undefined
  stock: number
}

export type ProductUpdateRequest = Partial<ProductCreateRequest>

export type ProductResponse = Product

export type ProductListResponse = {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type ProductFilters = {
  category: string | null
  minPrice: number | null
  maxPrice: number | null
  search: string | null
  inStock: boolean | null
}

export type ProductQueryParams = {
  page: string | null | undefined
  limit: string | null | undefined
  category: string | null | undefined
  minPrice: string | null | undefined
  maxPrice: string | null | undefined
  search: string | null | undefined
  inStock: string | null | undefined
  sortBy: string | null | undefined
  sortOrder: string | null | undefined
}

export type CategoryResponse = {
  name: string
  count: number
}

export type CategoryListResponse = CategoryResponse[]

// Typed Request/Response interfaces for each endpoint

// GET /products - Get all products
export type GetAllProductsRequest = Request<
  Record<string, never>, // No route params
  | { message: string; data: ProductListResponse }
  | { error: string; details?: unknown }, // Response body
  Record<string, never>, // No request body
  ProductQueryParams // Query params
>

export type GetAllProductsResponse = Response<
  | { message: string; data: ProductListResponse }
  | { error: string; details?: unknown }
>

// GET /products/:id - Get product by ID
export type GetProductByIdRequest = Request<
  { id: string }, // Route params
  | { message: string; data: { product: Product } }
  | { error: string; message: string }, // Response body
  Record<string, never>, // No request body
  Record<string, never> // No query params
>

export type GetProductByIdResponse = Response<
  | { message: string; data: { product: Product } }
  | { error: string; message: string }
>

// POST /products - Create product (Admin only)
export type CreateProductRequest = AuthenticatedRequest

export type CreateProductResponse = Response<
  | { message: string; data: { product: Product } }
  | { error: string; details?: unknown }
>

// PUT /products/:id - Update product (Admin only)
export type UpdateProductRequest = AuthenticatedRequest

export type UpdateProductResponse = Response<
  | { message: string; data: { product: Product } }
  | { error: string; message?: string; details?: unknown }
>

// DELETE /products/:id - Delete product (Admin only)
export type DeleteProductRequest = AuthenticatedRequest

export type DeleteProductResponse = Response<
  { message: string } | { error: string; message: string }
>

// GET /products/categories - Get all categories
export type GetAllCategoriesRequest = Request<
  Record<string, never>, // No route params
  | { message: string; data: { categories: CategoryListResponse } }
  | { error: string; message: string }, // Response body
  Record<string, never>, // No request body
  Record<string, never> // No query params
>

export type GetAllCategoriesResponse = Response<
  | { message: string; data: { categories: CategoryListResponse } }
  | { error: string; message: string }
>

// GET /products/category/:category - Get products by category
export type GetProductsByCategoryRequest = Request<
  { category: string }, // Route params
  | { message: string; data: ProductListResponse }
  | { error: string; message: string }, // Response body
  Record<string, never>, // No request body
  { page?: string; limit?: string } // Query params
>

export type GetProductsByCategoryResponse = Response<
  | { message: string; data: ProductListResponse }
  | { error: string; message: string }
>

// GET /products/search - Search products
export type SearchProductsRequest = Request<
  Record<string, never>, // No route params
  | { message: string; data: ProductListResponse }
  | { error: string; message: string }, // Response body
  Record<string, never>, // No request body
  { q: string; page?: string; limit?: string } // Query params
>

export type SearchProductsResponse = Response<
  | { message: string; data: ProductListResponse }
  | { error: string; message: string }
>

// PATCH /products/:id/stock - Update product stock (Admin only)
export type UpdateStockRequest = AuthenticatedRequest

export type UpdateStockResponse = Response<
  | { message: string; data: { product: Product } }
  | { error: string; message: string }
>
