import { PrismaClient, Product, Prisma } from '@prisma/client'
import {
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductFilters,
  CategoryResponse,
} from '../types/product.types'

const prisma: PrismaClient = new PrismaClient()

export class ProductService {
  // Create a new product
  async createProduct(data: ProductCreateRequest): Promise<Product> {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        imageUrl: data.imageUrl,
        stock: data.stock,
      },
    })
  }

  // Get all products with filtering, pagination and sorting
  async getAllProducts(
    page: number = 1,
    limit: number = 10,
    filters: ProductFilters,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ products: Product[]; total: number }> {
    const skip: number = (page - 1) * limit

    // Build where clause based on filters
    const where: Prisma.ProductWhereInput = {}

    if (filters.category) {
      where.category = {
        contains: filters.category,
        mode: 'insensitive',
      }
    }

    if (filters.search) {
      where.OR = [
        {
          name: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          category: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ]
    }

    if (filters.minPrice !== null || filters.maxPrice !== null) {
      const priceFilter: Prisma.FloatFilter = {}
      if (filters.minPrice !== null) {
        priceFilter.gte = filters.minPrice
      }
      if (filters.maxPrice !== null) {
        priceFilter.lte = filters.maxPrice
      }
      where.price = priceFilter
    }

    if (filters.inStock !== null && filters.inStock) {
      where.stock = {
        gt: 0,
      }
    }

    // Build orderBy clause
    const orderBy: Record<string, string> = {}
    orderBy[sortBy] = sortOrder

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.product.count({ where }),
    ])

    return { products, total }
  }

  // Get product by ID
  async getProductById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
    })
  }

  // Update product
  async updateProduct(
    id: string,
    data: ProductUpdateRequest
  ): Promise<Product | null> {
    try {
      return await prisma.product.update({
        where: { id },
        data: {
          ...(data.name !== null && { name: data.name }),
          ...(data.description !== null && { description: data.description }),
          ...(data.price !== null && { price: data.price }),
          ...(data.category !== null && { category: data.category }),
          ...(data.imageUrl !== null && { imageUrl: data.imageUrl }),
          ...(data.stock !== null && { stock: data.stock }),
        },
      })
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        // Record not found
        return null
      }
      throw error
    }
  }

  // Delete product
  async deleteProduct(id: string): Promise<boolean> {
    try {
      await prisma.product.delete({
        where: { id },
      })
      return true
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        // Record not found
        return false
      }
      throw error
    }
  }

  // Check if product exists
  async productExists(id: string): Promise<boolean> {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    })
    return !!product
  }

  // Get all categories with product counts
  async getAllCategories(): Promise<CategoryResponse[]> {
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      orderBy: {
        category: 'asc',
      },
    })

    return categories.map(cat => ({
      name: cat.category,
      count: cat._count.category,
    }))
  }

  // Get products by category
  async getProductsByCategory(
    category: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ products: Product[]; total: number }> {
    const skip: number = (page - 1) * limit

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          category: {
            equals: category,
            mode: 'insensitive',
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.product.count({
        where: {
          category: {
            equals: category,
            mode: 'insensitive',
          },
        },
      }),
    ])

    return { products, total }
  }

  // Update product stock
  async updateStock(id: string, quantity: number): Promise<Product | null> {
    try {
      return await prisma.product.update({
        where: { id },
        data: {
          stock: quantity,
        },
      })
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null
      }
      throw error
    }
  }

  // Check stock availability
  async checkStock(id: string, requestedQuantity: number): Promise<boolean> {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { stock: true },
    })

    if (!product) {
      return false
    }

    return product.stock >= requestedQuantity
  }
}

export const productService: ProductService = new ProductService()
