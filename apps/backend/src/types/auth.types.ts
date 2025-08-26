import { Request } from 'express'
import { User } from '@prisma/client'

export type JWTPayload = {
  userId: string
  email: string
  role: string
}

export type AuthenticatedRequest = Request & {
  user: User
}

export type RegisterRequestBody = {
  name: string
  email: string
  password: string
}

export type LoginRequestBody = {
  email: string
  password: string
}

export type AuthResponse = {
  user: Omit<User, 'password'>
  token: string
}

export type GoogleProfile = {
  id: string
  displayName: string
  emails: Array<{
    value: string
    verified: boolean
  }>
}
