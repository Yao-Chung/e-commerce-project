import { PrismaClient, Gender } from '@prisma/client'
import bcrypt from 'bcryptjs'
import {
  UpdateProfileRequestBody,
  UserProfileResponse,
  ProfileCompletionData,
} from '../types/user.types'

const prisma = new PrismaClient()

export class UserService {
  // Get user profile with completion percentage
  async getUserProfile(userId: string): Promise<UserProfileResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        dateOfBirth: true,
        gender: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const profileCompletion = this.calculateProfileCompletion(user)

    return {
      ...user,
      profileCompletion,
    }
  }

  // Update user profile
  async updateUserProfile(
    userId: string,
    data: UpdateProfileRequestBody
  ): Promise<UserProfileResponse> {
    const updateData: Partial<{
      name: string
      phone: string | null
      dateOfBirth: Date | null
      gender: Gender | null
    }> = {}

    if (data.name !== null) {
      updateData.name = data.name
    }
    if (data.phone !== null) {
      updateData.phone = data.phone
    }
    if (data.dateOfBirth !== null) {
      updateData.dateOfBirth = data.dateOfBirth
        ? new Date(data.dateOfBirth)
        : null
    }
    if (data.gender !== null) {
      updateData.gender = data.gender
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        dateOfBirth: true,
        gender: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const profileCompletion = this.calculateProfileCompletion(user)

    return {
      ...user,
      profileCompletion,
    }
  }

  // Update user avatar
  async updateUserAvatar(
    userId: string,
    avatarUrl: string
  ): Promise<UserProfileResponse> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        dateOfBirth: true,
        gender: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const profileCompletion = this.calculateProfileCompletion(user)

    return {
      ...user,
      profileCompletion,
    }
  }

  // Delete user account
  async deleteUserAccount(userId: string, password: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (!user.password) {
      throw new Error('Cannot delete OAuth account with password verification')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new Error('Invalid password')
    }

    // Delete user and all related data (cascade)
    await prisma.user.delete({
      where: { id: userId },
    })
  }

  // Calculate profile completion percentage
  private calculateProfileCompletion(user: {
    name: string
    phone: string | null
    avatar: string | null
    dateOfBirth: Date | null
    gender: Gender | null
  }): number {
    const fields = [
      { field: 'name', value: user.name },
      { field: 'phone', value: user.phone },
      { field: 'avatar', value: user.avatar },
      { field: 'dateOfBirth', value: user.dateOfBirth },
      { field: 'gender', value: user.gender },
    ]

    const completedFields = fields.filter(field => {
      if (field.field === 'name') {
        return (
          field.value &&
          typeof field.value === 'string' &&
          field.value.trim().length > 0
        )
      }
      return field.value !== null && field.value !== undefined
    }).length

    return Math.round((completedFields / fields.length) * 100)
  }

  // Get profile completion details
  async getProfileCompletionDetails(
    userId: string
  ): Promise<ProfileCompletionData> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        phone: true,
        avatar: true,
        dateOfBirth: true,
        gender: true,
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const fields = [
      { name: 'name', value: user.name },
      { name: 'phone', value: user.phone },
      { name: 'avatar', value: user.avatar },
      { name: 'dateOfBirth', value: user.dateOfBirth },
      { name: 'gender', value: user.gender },
    ]

    const totalFields = fields.length
    const completedFields = fields.filter(field => {
      if (field.name === 'name') {
        return (
          field.value &&
          typeof field.value === 'string' &&
          field.value.trim().length > 0
        )
      }
      return field.value !== null && field.value !== undefined
    }).length

    const missingFields = fields
      .filter(field => {
        if (field.name === 'name') {
          return (
            !field.value ||
            typeof field.value !== 'string' ||
            field.value.trim().length === 0
          )
        }
        return field.value === null || field.value === undefined
      })
      .map(field => field.name)

    return {
      totalFields,
      completedFields,
      percentage: Math.round((completedFields / totalFields) * 100),
      missingFields,
    }
  }
}

export const userService = new UserService()
