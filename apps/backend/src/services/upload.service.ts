import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'
import {
  cloudinary,
  cloudinaryUploadOptions,
  CloudinaryUploadType,
} from '../config/cloudinary.config'
import { UploadedFile, UploadResult } from '../types/upload.types'

export type UploadError = {
  message: string
  http_code?: number
}

export class UploadService {
  /**
   * Upload an image to Cloudinary
   */
  async uploadImage(
    file: UploadedFile,
    uploadType: CloudinaryUploadType = 'product_images'
  ): Promise<UploadResult> {
    try {
      const options = cloudinaryUploadOptions[uploadType]

      // Upload to Cloudinary using a Promise wrapper
      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: options.folder,
              allowed_formats: options.allowed_formats,
              transformation: options.transformation,
              resource_type: 'image',
            },
            (
              error: UploadApiErrorResponse | undefined,
              result: UploadApiResponse | undefined
            ) => {
              if (error) {
                reject(error)
              } else if (result) {
                resolve(result)
              } else {
                reject(new Error('Upload failed: no result returned'))
              }
            }
          )
          .end(file.buffer)
      })

      return {
        public_id: result.public_id,
        url: result.url,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes,
      }
    } catch (error: unknown) {
      console.error('Cloudinary upload error:', error)
      if (error instanceof Error) {
        throw new Error(`Image upload failed: ${error.message}`)
      }
      throw new Error('Image upload failed: Unknown error')
    }
  }

  /**
   * Upload multiple images to Cloudinary
   */
  async uploadMultipleImages(
    files: UploadedFile[],
    uploadType: CloudinaryUploadType = 'product_images'
  ): Promise<UploadResult[]> {
    try {
      const uploadPromises: Promise<UploadResult>[] = files.map(file =>
        this.uploadImage(file, uploadType)
      )

      const results: UploadResult[] = await Promise.all(uploadPromises)
      return results
    } catch (error: unknown) {
      console.error('Multiple image upload error:', error)
      if (error instanceof Error) {
        throw new Error(`Multiple image upload failed: ${error.message}`)
      }
      throw new Error('Multiple image upload failed: Unknown error')
    }
  }

  /**
   * Delete an image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<{ result: string }> {
    try {
      const result = await cloudinary.uploader.destroy(publicId)

      if (result.result !== 'ok') {
        throw new Error(`Failed to delete image: ${result.result}`)
      }

      return result
    } catch (error: unknown) {
      console.error('Cloudinary delete error:', error)
      if (error instanceof Error) {
        throw new Error(`Image deletion failed: ${error.message}`)
      }
      throw new Error('Image deletion failed: Unknown error')
    }
  }

  /**
   * Delete multiple images from Cloudinary
   */
  async deleteMultipleImages(
    publicIds: string[]
  ): Promise<{ deleted: Record<string, string> }> {
    try {
      const result = await cloudinary.api.delete_resources(publicIds)
      return result
    } catch (error: unknown) {
      console.error('Cloudinary multiple delete error:', error)
      if (error instanceof Error) {
        throw new Error(`Multiple image deletion failed: ${error.message}`)
      }
      throw new Error('Multiple image deletion failed: Unknown error')
    }
  }

  /**
   * Get image details from Cloudinary
   */
  async getImageDetails(publicId: string): Promise<UploadApiResponse> {
    try {
      const result: UploadApiResponse = await cloudinary.api.resource(publicId)
      return result
    } catch (error: unknown) {
      console.error('Cloudinary get image details error:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to get image details: ${error.message}`)
      }
      throw new Error('Failed to get image details: Unknown error')
    }
  }

  /**
   * Generate a transformation URL for an existing image
   */
  generateTransformationUrl(
    publicId: string,
    transformations: Record<string, unknown>
  ): string {
    return cloudinary.url(publicId, transformations)
  }

  /**
   * Validate file before upload
   */
  validateImage(file: UploadedFile): {
    isValid: boolean
    error?: string
  } {
    // Check file size (max 10MB)
    const maxSize: number = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size too large. Maximum size is 10MB.',
      }
    }

    // Check file type
    const allowedMimeTypes: string[] = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ]
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
      }
    }

    return { isValid: true }
  }
}

export const uploadService: UploadService = new UploadService()
