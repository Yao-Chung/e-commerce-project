import { Product } from '@prisma/client'

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
