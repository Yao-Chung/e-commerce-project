import { Request } from 'express'
import { User, Gender } from '@prisma/client'

export type AuthenticatedRequest = Request & {
  user: User
}

export type UpdateProfileRequestBody = {
  name: string | null
  phone: string | null
  dateOfBirth: string | null
  gender: Gender | null
}

export type UpdateAvatarRequestBody = {
  avatar: string
}

export type UserProfileResponse = {
  id: string
  email: string
  name: string
  role: string
  phone: string | null
  avatar: string | null
  dateOfBirth: Date | null
  gender: Gender | null
  createdAt: Date
  updatedAt: Date
  profileCompletion: number
}

export type DeleteAccountRequestBody = {
  password: string
  confirmPassword: string
}

export type ProfileCompletionData = {
  totalFields: number
  completedFields: number
  percentage: number
  missingFields: string[]
}
