import { PrismaClient, Address } from '@prisma/client'
import {
  CreateAddressRequestBody,
  UpdateAddressRequestBody,
  AddressResponse,
  AddressListResponse,
} from '../types/address.types'

const prisma = new PrismaClient()

export class AddressService {
  // Get all addresses for a user
  async getUserAddresses(userId: string): Promise<AddressListResponse> {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })

    const defaultAddress = addresses.find(addr => addr.isDefault) || null

    return {
      addresses: addresses.map(this.mapAddressToResponse),
      defaultAddress: defaultAddress
        ? this.mapAddressToResponse(defaultAddress)
        : null,
      totalCount: addresses.length,
    }
  }

  // Create new address
  async createAddress(
    userId: string,
    data: CreateAddressRequestBody
  ): Promise<AddressResponse> {
    // If this is the first address or isDefault is true, set it as default
    const existingAddresses = await prisma.address.findMany({
      where: { userId },
    })

    const isFirstAddress = existingAddresses.length === 0
    const shouldBeDefault = data.isDefault || isFirstAddress

    // If setting as default, unset other default addresses
    if (shouldBeDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.create({
      data: {
        name: data.name,
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        addressType: data.addressType ?? undefined,
        userId,
        isDefault: shouldBeDefault,
      },
    })

    return this.mapAddressToResponse(address)
  }

  // Update address
  async updateAddress(
    userId: string,
    addressId: string,
    data: UpdateAddressRequestBody
  ): Promise<AddressResponse> {
    // Verify address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId },
    })

    if (!existingAddress) {
      throw new Error('Address not found')
    }

    // If setting as default, unset other default addresses
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      })
    }

    // Convert null values to undefined for Prisma
    const prismaData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value === null ? undefined : value,
      ])
    )

    const address = await prisma.address.update({
      where: { id: addressId },
      data: prismaData,
    })

    return this.mapAddressToResponse(address)
  }

  // Delete address
  async deleteAddress(userId: string, addressId: string): Promise<void> {
    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    })

    if (!address) {
      throw new Error('Address not found')
    }

    await prisma.address.delete({
      where: { id: addressId },
    })

    // If deleted address was default, set another address as default
    if (address.isDefault) {
      const remainingAddresses = await prisma.address.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 1,
      })

      if (remainingAddresses.length > 0) {
        await prisma.address.update({
          where: { id: remainingAddresses[0].id },
          data: { isDefault: true },
        })
      }
    }
  }

  // Set address as default
  async setDefaultAddress(
    userId: string,
    addressId: string
  ): Promise<AddressResponse> {
    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    })

    if (!address) {
      throw new Error('Address not found')
    }

    // Unset other default addresses
    await prisma.address.updateMany({
      where: { userId, isDefault: true, id: { not: addressId } },
      data: { isDefault: false },
    })

    // Set this address as default
    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    })

    return this.mapAddressToResponse(updatedAddress)
  }

  // Get address by ID
  async getAddressById(
    userId: string,
    addressId: string
  ): Promise<AddressResponse> {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    })

    if (!address) {
      throw new Error('Address not found')
    }

    return this.mapAddressToResponse(address)
  }

  // Validate address data
  validateAddressData(
    data: CreateAddressRequestBody | UpdateAddressRequestBody
  ): void {
    const requiredFields = [
      'name',
      'street',
      'city',
      'state',
      'zipCode',
      'country',
    ]

    for (const field of requiredFields) {
      const value = data[field as keyof typeof data]
      if (
        value === undefined ||
        (typeof value === 'string' && value.trim() === '')
      ) {
        throw new Error(`${field} is required`)
      }
    }

    // Validate zip code format (basic validation)
    if (data.zipCode && typeof data.zipCode === 'string') {
      const zipCodeRegex = /^\d{5}(-\d{4})?$/
      if (!zipCodeRegex.test(data.zipCode)) {
        throw new Error('Invalid zip code format')
      }
    }
  }

  // Map database address to response format
  private mapAddressToResponse(address: Address): AddressResponse {
    return {
      id: address.id,
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault,
      addressType: address.addressType,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    }
  }
}

export const addressService = new AddressService()
