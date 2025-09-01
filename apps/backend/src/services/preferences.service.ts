import { PrismaClient, UserPreferences } from '@prisma/client'
import {
  UpdatePreferencesRequestBody,
  PreferencesResponse,
  NotificationSettings,
  DisplaySettings,
} from '../types/preferences.types'

const prisma = new PrismaClient()

export class PreferencesService {
  // Get user preferences
  async getUserPreferences(userId: string): Promise<PreferencesResponse> {
    let preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    })

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: {
          userId,
          emailNotifications: true,
          marketingEmails: true,
          orderNotifications: true,
          language: 'en',
          currency: 'USD',
          timezone: 'UTC',
          theme: 'light',
        },
      })
    }

    return this.mapPreferencesToResponse(preferences)
  }

  // Update user preferences
  async updateUserPreferences(
    userId: string,
    data: UpdatePreferencesRequestBody
  ): Promise<PreferencesResponse> {
    // Validate preference values
    this.validatePreferences(data)

    // Filter out null values for update
    const updateData: Partial<{
      emailNotifications: boolean
      marketingEmails: boolean
      orderNotifications: boolean
      language: string
      currency: string
      timezone: string
      theme: string
    }> = {}

    if (data.emailNotifications !== null)
      updateData.emailNotifications = data.emailNotifications
    if (data.marketingEmails !== null)
      updateData.marketingEmails = data.marketingEmails
    if (data.orderNotifications !== null)
      updateData.orderNotifications = data.orderNotifications
    if (data.language !== null) updateData.language = data.language
    if (data.currency !== null) updateData.currency = data.currency
    if (data.timezone !== null) updateData.timezone = data.timezone
    if (data.theme !== null) updateData.theme = data.theme

    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        emailNotifications: data.emailNotifications ?? true,
        marketingEmails: data.marketingEmails ?? true,
        orderNotifications: data.orderNotifications ?? true,
        language: data.language ?? 'en',
        currency: data.currency ?? 'USD',
        timezone: data.timezone ?? 'UTC',
        theme: data.theme ?? 'light',
      },
    })

    return this.mapPreferencesToResponse(preferences)
  }

  // Update notification settings
  async updateNotificationSettings(
    userId: string,
    settings: NotificationSettings
  ): Promise<PreferencesResponse> {
    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        emailNotifications: settings.emailNotifications,
        marketingEmails: settings.marketingEmails,
        orderNotifications: settings.orderNotifications,
      },
      create: {
        userId,
        emailNotifications: settings.emailNotifications,
        marketingEmails: settings.marketingEmails,
        orderNotifications: settings.orderNotifications,
        language: 'en',
        currency: 'USD',
        timezone: 'UTC',
        theme: 'light',
      },
    })

    return this.mapPreferencesToResponse(preferences)
  }

  // Update display settings
  async updateDisplaySettings(
    userId: string,
    settings: DisplaySettings
  ): Promise<PreferencesResponse> {
    // Validate display settings
    this.validateDisplaySettings(settings)

    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        language: settings.language,
        currency: settings.currency,
        timezone: settings.timezone,
        theme: settings.theme,
      },
      create: {
        userId,
        emailNotifications: true,
        marketingEmails: true,
        orderNotifications: true,
        language: settings.language,
        currency: settings.currency,
        timezone: settings.timezone,
        theme: settings.theme,
      },
    })

    return this.mapPreferencesToResponse(preferences)
  }

  // Reset preferences to default
  async resetPreferences(userId: string): Promise<PreferencesResponse> {
    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        emailNotifications: true,
        marketingEmails: true,
        orderNotifications: true,
        language: 'en',
        currency: 'USD',
        timezone: 'UTC',
        theme: 'light',
      },
      create: {
        userId,
        emailNotifications: true,
        marketingEmails: true,
        orderNotifications: true,
        language: 'en',
        currency: 'USD',
        timezone: 'UTC',
        theme: 'light',
      },
    })

    return this.mapPreferencesToResponse(preferences)
  }

  // Get notification settings
  async getNotificationSettings(userId: string): Promise<NotificationSettings> {
    const preferences = await this.getUserPreferences(userId)

    return {
      emailNotifications: preferences.emailNotifications,
      marketingEmails: preferences.marketingEmails,
      orderNotifications: preferences.orderNotifications,
    }
  }

  // Get display settings
  async getDisplaySettings(userId: string): Promise<DisplaySettings> {
    const preferences = await this.getUserPreferences(userId)

    return {
      language: preferences.language,
      currency: preferences.currency,
      timezone: preferences.timezone,
      theme: preferences.theme,
    }
  }

  // Validate preferences data
  private validatePreferences(data: UpdatePreferencesRequestBody): void {
    // Validate language
    if (data.language !== null && !this.isValidLanguage(data.language)) {
      throw new Error('Invalid language code')
    }

    // Validate currency
    if (data.currency !== null && !this.isValidCurrency(data.currency)) {
      throw new Error('Invalid currency code')
    }

    // Validate timezone
    if (data.timezone !== null && !this.isValidTimezone(data.timezone)) {
      throw new Error('Invalid timezone')
    }

    // Validate theme
    if (data.theme !== null && !this.isValidTheme(data.theme)) {
      throw new Error('Invalid theme')
    }
  }

  // Validate display settings
  private validateDisplaySettings(settings: DisplaySettings): void {
    if (!this.isValidLanguage(settings.language)) {
      throw new Error('Invalid language code')
    }

    if (!this.isValidCurrency(settings.currency)) {
      throw new Error('Invalid currency code')
    }

    if (!this.isValidTimezone(settings.timezone)) {
      throw new Error('Invalid timezone')
    }

    if (!this.isValidTheme(settings.theme)) {
      throw new Error('Invalid theme')
    }
  }

  // Validation helpers
  private isValidLanguage(language: string): boolean {
    const validLanguages = [
      'en',
      'es',
      'fr',
      'de',
      'it',
      'pt',
      'ja',
      'ko',
      'zh',
    ]
    return validLanguages.includes(language.toLowerCase())
  }

  private isValidCurrency(currency: string): boolean {
    const validCurrencies = [
      'USD',
      'EUR',
      'GBP',
      'JPY',
      'CAD',
      'AUD',
      'CHF',
      'CNY',
    ]
    return validCurrencies.includes(currency.toUpperCase())
  }

  private isValidTimezone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone })
      return true
    } catch {
      return false
    }
  }

  private isValidTheme(theme: string): boolean {
    const validThemes = ['light', 'dark', 'auto']
    return validThemes.includes(theme.toLowerCase())
  }

  // Map database preferences to response format
  private mapPreferencesToResponse(
    preferences: UserPreferences
  ): PreferencesResponse {
    return {
      id: preferences.id,
      emailNotifications: preferences.emailNotifications,
      marketingEmails: preferences.marketingEmails,
      orderNotifications: preferences.orderNotifications,
      language: preferences.language,
      currency: preferences.currency,
      timezone: preferences.timezone,
      theme: preferences.theme,
      createdAt: preferences.createdAt,
      updatedAt: preferences.updatedAt,
    }
  }
}

export const preferencesService = new PreferencesService()
