import { Request } from 'express'
import { User } from '@prisma/client'

export type AuthenticatedRequest = Request & {
  user: User
}

export type UpdatePreferencesRequestBody = {
  emailNotifications: boolean | null
  marketingEmails: boolean | null
  orderNotifications: boolean | null
  language: string | null
  currency: string | null
  timezone: string | null
  theme: string | null
}

export type PreferencesResponse = {
  id: string
  emailNotifications: boolean
  marketingEmails: boolean
  orderNotifications: boolean
  language: string
  currency: string
  timezone: string
  theme: string
  createdAt: Date
  updatedAt: Date
}

export type NotificationSettings = {
  emailNotifications: boolean
  marketingEmails: boolean
  orderNotifications: boolean
}

export type DisplaySettings = {
  language: string
  currency: string
  timezone: string
  theme: string
}
