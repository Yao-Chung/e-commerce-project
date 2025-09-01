import { Response } from 'express'
import { z } from 'zod'
import { preferencesService } from '../services/preferences.service'
import {
  AuthenticatedRequest,
  UpdatePreferencesRequestBody,
  NotificationSettings,
  DisplaySettings,
} from '../types/preferences.types'

// Validation schemas
const updatePreferencesSchema = z.object({
  emailNotifications: z.boolean().nullable(),
  marketingEmails: z.boolean().nullable(),
  orderNotifications: z.boolean().nullable(),
  language: z
    .string()
    .min(2, 'Language must be at least 2 characters')
    .nullable(),
  currency: z
    .string()
    .min(3, 'Currency must be at least 3 characters')
    .nullable(),
  timezone: z.string().min(1, 'Timezone is required').nullable(),
  theme: z.enum(['light', 'dark', 'auto']).nullable(),
})

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  orderNotifications: z.boolean(),
})

const displaySettingsSchema = z.object({
  language: z.string().min(2, 'Language must be at least 2 characters'),
  currency: z.string().min(3, 'Currency must be at least 3 characters'),
  timezone: z.string().min(1, 'Timezone is required'),
  theme: z.enum(['light', 'dark', 'auto']),
})

export class PreferencesController {
  // Get user preferences
  async getUserPreferences(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const preferences = await preferencesService.getUserPreferences(
        req.user.id
      )

      res.status(200).json({
        message: 'Preferences retrieved successfully',
        data: preferences,
      })
    } catch (error) {
      console.error('Get preferences error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve preferences',
      })
    }
  }

  // Update user preferences
  async updateUserPreferences(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const validationResult = updatePreferencesSchema.safeParse(req.body)
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.issues,
        })
        return
      }

      const updateData: UpdatePreferencesRequestBody = validationResult.data
      const preferences = await preferencesService.updateUserPreferences(
        req.user.id,
        updateData
      )

      res.status(200).json({
        message: 'Preferences updated successfully',
        data: preferences,
      })
    } catch (error) {
      console.error('Update preferences error:', error)

      if (error instanceof Error) {
        if (error.message.includes('Invalid')) {
          res.status(400).json({
            error: 'Bad request',
            message: error.message,
          })
          return
        }
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update preferences',
      })
    }
  }

  // Update notification settings
  async updateNotificationSettings(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const validationResult = notificationSettingsSchema.safeParse(req.body)
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.issues,
        })
        return
      }

      const settings: NotificationSettings = validationResult.data
      const preferences = await preferencesService.updateNotificationSettings(
        req.user.id,
        settings
      )

      res.status(200).json({
        message: 'Notification settings updated successfully',
        data: preferences,
      })
    } catch (error) {
      console.error('Update notification settings error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update notification settings',
      })
    }
  }

  // Update display settings
  async updateDisplaySettings(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const validationResult = displaySettingsSchema.safeParse(req.body)
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.issues,
        })
        return
      }

      const settings: DisplaySettings = validationResult.data
      const preferences = await preferencesService.updateDisplaySettings(
        req.user.id,
        settings
      )

      res.status(200).json({
        message: 'Display settings updated successfully',
        data: preferences,
      })
    } catch (error) {
      console.error('Update display settings error:', error)

      if (error instanceof Error) {
        if (error.message.includes('Invalid')) {
          res.status(400).json({
            error: 'Bad request',
            message: error.message,
          })
          return
        }
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update display settings',
      })
    }
  }

  // Reset preferences to default
  async resetPreferences(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const preferences = await preferencesService.resetPreferences(req.user.id)

      res.status(200).json({
        message: 'Preferences reset to default successfully',
        data: preferences,
      })
    } catch (error) {
      console.error('Reset preferences error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to reset preferences',
      })
    }
  }

  // Get notification settings
  async getNotificationSettings(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const settings = await preferencesService.getNotificationSettings(
        req.user.id
      )

      res.status(200).json({
        message: 'Notification settings retrieved successfully',
        data: settings,
      })
    } catch (error) {
      console.error('Get notification settings error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve notification settings',
      })
    }
  }

  // Get display settings
  async getDisplaySettings(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const settings = await preferencesService.getDisplaySettings(req.user.id)

      res.status(200).json({
        message: 'Display settings retrieved successfully',
        data: settings,
      })
    } catch (error) {
      console.error('Get display settings error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve display settings',
      })
    }
  }
}

export const preferencesController = new PreferencesController()
