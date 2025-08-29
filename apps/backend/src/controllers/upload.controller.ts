import { Response } from 'express'
import { z } from 'zod'
import { uploadService } from '../services/upload.service'
import { CloudinaryUploadType } from '../config/cloudinary.config'
import { AuthenticatedRequest } from '../types/auth.types'
import { UploadedFile, UploadResult } from '../types/upload.types'

// Validation schemas
const uploadTypeSchema = z.enum([
  'product_images',
  'thumbnails',
  'user_avatars',
])

const deleteImageSchema = z.object({
  publicId: z.string().min(1, 'Public ID is required'),
})

const deleteMultipleImagesSchema = z.object({
  publicIds: z
    .array(z.string().min(1, 'Public ID is required'))
    .min(1, 'At least one public ID is required'),
})

export class UploadController {
  // Upload a single image
  async uploadSingle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'No file uploaded',
        })
        return
      }

      // Validate upload type
      const uploadType: CloudinaryUploadType = uploadTypeSchema.parse(
        req.body.uploadType || 'product_images'
      )

      // Validate the file
      const validation = uploadService.validateImage(req.file)
      if (!validation.isValid) {
        res.status(400).json({
          error: 'Invalid File',
          message: validation.error,
        })
        return
      }

      // Upload to Cloudinary
      const result: UploadResult = await uploadService.uploadImage(
        req.file,
        uploadType
      )

      res.status(201).json({
        message: 'Image uploaded successfully',
        data: {
          image: result,
        },
      })
    } catch (error: unknown) {
      console.error('Upload single error:', error)
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation Error',
          details: error.issues,
        })
        return
      }

      if (error instanceof Error) {
        res.status(500).json({
          error: 'Upload Failed',
          message: error.message,
        })
        return
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to upload image',
      })
    }
  }

  // Upload multiple images
  async uploadMultiple(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const files: UploadedFile[] = req.files as UploadedFile[]

      if (!files || files.length === 0) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'No files uploaded',
        })
        return
      }

      // Validate upload type
      const uploadType: CloudinaryUploadType = uploadTypeSchema.parse(
        req.body.uploadType || 'product_images'
      )

      // Validate all files
      for (const file of files) {
        const validation = uploadService.validateImage(file)
        if (!validation.isValid) {
          res.status(400).json({
            error: 'Invalid File',
            message: `File ${file.originalname}: ${validation.error}`,
          })
          return
        }
      }

      // Upload all files to Cloudinary
      const results: UploadResult[] = await uploadService.uploadMultipleImages(
        files,
        uploadType
      )

      res.status(201).json({
        message: `${results.length} images uploaded successfully`,
        data: {
          images: results,
          count: results.length,
        },
      })
    } catch (error: unknown) {
      console.error('Upload multiple error:', error)
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation Error',
          details: error.issues,
        })
        return
      }

      if (error instanceof Error) {
        res.status(500).json({
          error: 'Upload Failed',
          message: error.message,
        })
        return
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to upload images',
      })
    }
  }

  // Delete a single image
  async deleteImage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validationResult = deleteImageSchema.safeParse(req.body)
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation Error',
          details: validationResult.error.issues,
        })
        return
      }

      const { publicId } = validationResult.data

      // Delete from Cloudinary
      const result = await uploadService.deleteImage(publicId)

      res.json({
        message: 'Image deleted successfully',
        data: result,
      })
    } catch (error: unknown) {
      console.error('Delete image error:', error)
      if (error instanceof Error) {
        res.status(500).json({
          error: 'Delete Failed',
          message: error.message,
        })
        return
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete image',
      })
    }
  }

  // Delete multiple images
  async deleteMultiple(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const validationResult = deleteMultipleImagesSchema.safeParse(req.body)
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation Error',
          details: validationResult.error.issues,
        })
        return
      }

      const { publicIds } = validationResult.data

      // Delete from Cloudinary
      const result = await uploadService.deleteMultipleImages(publicIds)

      res.json({
        message: `${publicIds.length} images deletion attempted`,
        data: result,
      })
    } catch (error: unknown) {
      console.error('Delete multiple images error:', error)
      if (error instanceof Error) {
        res.status(500).json({
          error: 'Delete Failed',
          message: error.message,
        })
        return
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete images',
      })
    }
  }

  // Get image details
  async getImageDetails(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { publicId } = req.params

      if (!publicId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Public ID is required',
        })
        return
      }

      // Get details from Cloudinary
      const details = await uploadService.getImageDetails(publicId)

      res.json({
        message: 'Image details retrieved successfully',
        data: {
          image: details,
        },
      })
    } catch (error: unknown) {
      console.error('Get image details error:', error)
      if (error instanceof Error) {
        res.status(500).json({
          error: 'Fetch Failed',
          message: error.message,
        })
        return
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get image details',
      })
    }
  }

  // Generate transformation URL
  async generateTransformationUrl(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { publicId } = req.params
      const transformations = req.body.transformations || {}

      if (!publicId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Public ID is required',
        })
        return
      }

      // Generate transformation URL
      const url: string = uploadService.generateTransformationUrl(
        publicId,
        transformations
      )

      res.json({
        message: 'Transformation URL generated successfully',
        data: {
          url,
          publicId,
          transformations,
        },
      })
    } catch (error: unknown) {
      console.error('Generate transformation URL error:', error)
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to generate transformation URL',
      })
    }
  }
}

export const uploadController: UploadController = new UploadController()
