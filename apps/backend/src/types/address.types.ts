import { Request } from 'express'
import { AddressType, User } from '@prisma/client'

export type AuthenticatedRequest = Request & {
  user: User
}

export type CreateAddressRequestBody = {
  name: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean | null
  addressType: AddressType | null
}

export type UpdateAddressRequestBody = {
  name: string | null
  street: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  country: string | null
  isDefault: boolean | null
  addressType: AddressType | null
}

export type AddressResponse = {
  id: string
  name: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
  addressType: AddressType
  createdAt: Date
  updatedAt: Date
}

export type AddressListResponse = {
  addresses: AddressResponse[]
  defaultAddress: AddressResponse | null
  totalCount: number
}
