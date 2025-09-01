import { Response } from 'express'
import { z } from 'zod'
import { userService } from '../services/user.service'
import { uploadService } from '../services/upload.service'
import {
  AuthenticatedRequest,
  UpdateProfileRequestBody,
  UpdateAvatarRequestBody,
  DeleteAccountRequestBody,
} from '../types/user.types'

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').nullable(),
  phone: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).nullable(),
})

const updateAvatarSchema = z.object({
  avatar: z.string().url('Invalid avatar URL'),
})

const deleteAccountSchema = z
  .object({
    password: z.string().min(1, 'Password is required'),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export class UserController {
  // Get current user profile
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const profile = await userService.getUserProfile(req.user.id)

      res.status(200).json({
        message: 'Profile retrieved successfully',
        data: profile,
      })
    } catch (error) {
      console.error('Get profile error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve profile',
      })
    }
  }

  // Update user profile
  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validationResult = updateProfileSchema.safeParse(req.body)
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.issues,
        })
        return
      }

      const updateData: UpdateProfileRequestBody = validationResult.data
      const profile = await userService.updateUserProfile(
        req.user.id,
        updateData
      )

      res.status(200).json({
        message: 'Profile updated successfully',
        data: profile,
      })
    } catch (error) {
      console.error('Update profile error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update profile',
      })
    }
  }

  // Update user avatar
  async updateAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validationResult = updateAvatarSchema.safeParse(req.body)
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.issues,
        })
        return
      }

      const { avatar }: UpdateAvatarRequestBody = validationResult.data
      const profile = await userService.updateUserAvatar(req.user.id, avatar)

      res.status(200).json({
        message: 'Avatar updated successfully',
        data: profile,
      })
    } catch (error) {
      console.error('Update avatar error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update avatar',
      })
    }
  }

  // Upload avatar image
  async uploadAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          error: 'Bad request',
          message: 'No image file provided',
        })
        return
      }

      // Upload image to cloud storage
      const uploadResult = await uploadService.uploadImage(
        req.file,
        'user_avatars'
      )

      // Update user avatar
      const profile = await userService.updateUserAvatar(
        req.user.id,
        uploadResult.url
      )

      res.status(200).json({
        message: 'Avatar uploaded successfully',
        data: {
          profile,
          upload: uploadResult,
        },
      })
    } catch (error) {
      console.error('Upload avatar error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to upload avatar',
      })
    }
  }

  // Delete user account
  async deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validationResult = deleteAccountSchema.safeParse(req.body)
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.issues,
        })
        return
      }

      const { password }: DeleteAccountRequestBody = validationResult.data
      await userService.deleteUserAccount(req.user.id, password)

      // Clear authentication cookie
      res.clearCookie('authToken')

      res.status(200).json({
        message: 'Account deleted successfully',
      })
    } catch (error) {
      console.error('Delete account error:', error)

      if (error instanceof Error) {
        if (error.message === 'User not found') {
          res.status(404).json({
            error: 'Not found',
            message: 'User not found',
          })
          return
        }
        if (error.message === 'Invalid password') {
          res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid password',
          })
          return
        }
        if (
          error.message ===
          'Cannot delete OAuth account with password verification'
        ) {
          res.status(400).json({
            error: 'Bad request',
            message: 'Cannot delete OAuth account with password verification',
          })
          return
        }
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete account',
      })
    }
  }

  // Get profile completion details
  async getProfileCompletion(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const completion = await userService.getProfileCompletionDetails(
        req.user.id
      )

      res.status(200).json({
        message: 'Profile completion details retrieved successfully',
        data: completion,
      })
    } catch (error) {
      console.error('Get profile completion error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve profile completion details',
      })
    }
  }
}

export const userController = new UserController()
