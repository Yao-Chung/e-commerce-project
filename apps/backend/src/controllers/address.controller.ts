import { Response } from 'express'
import { z } from 'zod'
import { addressService } from '../services/address.service'
import {
  AuthenticatedRequest,
  CreateAddressRequestBody,
  UpdateAddressRequestBody,
} from '../types/address.types'

// Validation schemas
const createAddressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid zip code format'),
  country: z.string().min(1, 'Country is required'),
  isDefault: z.boolean().optional(),
  addressType: z.enum(['SHIPPING', 'BILLING', 'BOTH']).optional(),
})

const updateAddressSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  street: z.string().min(1, 'Street is required').optional(),
  city: z.string().min(1, 'City is required').optional(),
  state: z.string().min(1, 'State is required').optional(),
  zipCode: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid zip code format')
    .optional(),
  country: z.string().min(1, 'Country is required').optional(),
  isDefault: z.boolean().optional(),
  addressType: z.enum(['SHIPPING', 'BILLING', 'BOTH']).optional(),
})

export class AddressController {
  // Get all user addresses
  async getUserAddresses(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const addresses = await addressService.getUserAddresses(req.user.id)

      res.status(200).json({
        message: 'Addresses retrieved successfully',
        data: addresses,
      })
    } catch (error) {
      console.error('Get addresses error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve addresses',
      })
    }
  }

  // Create new address
  async createAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validationResult = createAddressSchema.safeParse(req.body)
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.issues,
        })
        return
      }

      const addressData: CreateAddressRequestBody = {
        ...validationResult.data,
        isDefault: validationResult.data.isDefault ?? null,
        addressType: validationResult.data.addressType ?? null,
      }

      // Validate address data
      addressService.validateAddressData(addressData)

      const address = await addressService.createAddress(
        req.user.id,
        addressData
      )

      res.status(201).json({
        message: 'Address created successfully',
        data: address,
      })
    } catch (error) {
      console.error('Create address error:', error)

      if (error instanceof Error) {
        if (
          error.message.includes('is required') ||
          error.message.includes('Invalid')
        ) {
          res.status(400).json({
            error: 'Bad request',
            message: error.message,
          })
          return
        }
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create address',
      })
    }
  }

  // Update address
  async updateAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const validationResult = updateAddressSchema.safeParse(req.body)
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.issues,
        })
        return
      }

      const addressData: UpdateAddressRequestBody = {
        name: validationResult.data.name || null,
        street: validationResult.data.street || null,
        city: validationResult.data.city || null,
        state: validationResult.data.state || null,
        zipCode: validationResult.data.zipCode || null,
        country: validationResult.data.country || null,
        isDefault: validationResult.data.isDefault || null,
        addressType: validationResult.data.addressType || null,
      }

      // Validate address data if any fields are provided
      if (Object.keys(addressData).length > 0) {
        addressService.validateAddressData(addressData)
      }

      const address = await addressService.updateAddress(
        req.user.id,
        id,
        addressData
      )

      res.status(200).json({
        message: 'Address updated successfully',
        data: address,
      })
    } catch (error) {
      console.error('Update address error:', error)

      if (error instanceof Error) {
        if (error.message === 'Address not found') {
          res.status(404).json({
            error: 'Not found',
            message: 'Address not found',
          })
          return
        }
        if (
          error.message.includes('is required') ||
          error.message.includes('Invalid')
        ) {
          res.status(400).json({
            error: 'Bad request',
            message: error.message,
          })
          return
        }
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update address',
      })
    }
  }

  // Delete address
  async deleteAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params

      await addressService.deleteAddress(req.user.id, id)

      res.status(200).json({
        message: 'Address deleted successfully',
      })
    } catch (error) {
      console.error('Delete address error:', error)

      if (error instanceof Error) {
        if (error.message === 'Address not found') {
          res.status(404).json({
            error: 'Not found',
            message: 'Address not found',
          })
          return
        }
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete address',
      })
    }
  }

  // Set address as default
  async setDefaultAddress(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params

      const address = await addressService.setDefaultAddress(req.user.id, id)

      res.status(200).json({
        message: 'Default address updated successfully',
        data: address,
      })
    } catch (error) {
      console.error('Set default address error:', error)

      if (error instanceof Error) {
        if (error.message === 'Address not found') {
          res.status(404).json({
            error: 'Not found',
            message: 'Address not found',
          })
          return
        }
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to set default address',
      })
    }
  }

  // Get address by ID
  async getAddressById(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params

      const address = await addressService.getAddressById(req.user.id, id)

      res.status(200).json({
        message: 'Address retrieved successfully',
        data: address,
      })
    } catch (error) {
      console.error('Get address error:', error)

      if (error instanceof Error) {
        if (error.message === 'Address not found') {
          res.status(404).json({
            error: 'Not found',
            message: 'Address not found',
          })
          return
        }
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve address',
      })
    }
  }
}

export const addressController = new AddressController()
