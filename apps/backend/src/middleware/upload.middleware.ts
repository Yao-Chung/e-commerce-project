import multer from 'multer'
import { Request, Response, NextFunction } from 'express'
import { UploadedFile } from '../types/upload.types'

// Configure multer for memory storage (we'll upload to Cloudinary)
const storage = multer.memoryStorage()

// File filter function
const fileFilter = (
  _req: Request,
  file: UploadedFile,
  cb: multer.FileFilterCallback
): void => {
  // Check file type
  const allowedMimeTypes: string[] = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ]

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new Error(
        'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      )
    )
  }
}

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10, // Maximum 10 files
  },
})

// Middleware for single image upload
export const uploadSingle = (
  fieldName: string = 'image'
): ReturnType<typeof upload.single> => {
  return upload.single(fieldName)
}

// Middleware for multiple image upload
export const uploadMultiple = (
  fieldName: string = 'images',
  maxCount: number = 10
): ReturnType<typeof upload.array> => {
  return upload.array(fieldName, maxCount)
}

// Middleware for multiple fields with images
export const uploadFields = (
  fields: multer.Field[]
): ReturnType<typeof upload.fields> => {
  return upload.fields(fields)
}

// Error handling middleware for multer
export const handleUploadError = (
  error: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof multer.MulterError) {
    let message: string = 'File upload error'

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size too large. Maximum size is 10MB.'
        break
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Maximum is 10 files.'
        break
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field.'
        break
      case 'LIMIT_FIELD_COUNT':
        message = 'Too many fields.'
        break
      case 'LIMIT_FIELD_KEY':
        message = 'Field name too long.'
        break
      case 'LIMIT_FIELD_VALUE':
        message = 'Field value too long.'
        break
      case 'LIMIT_PART_COUNT':
        message = 'Too many parts.'
        break
      default:
        message = error.message
    }

    res.status(400).json({
      error: 'Upload Error',
      message,
    })
    return
  }

  if (error.message.includes('Invalid file type')) {
    res.status(400).json({
      error: 'Invalid File Type',
      message: error.message,
    })
    return
  }

  // Pass other errors to the global error handler
  next(error)
}

// Validation middleware to check if files were uploaded
export const requireFiles = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const hasFile: boolean = !!(
    req.file ||
    (req.files && Array.isArray(req.files) && req.files.length > 0)
  )

  if (!hasFile) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'No files uploaded. Please select at least one image file.',
    })
    return
  }

  next()
}

// Validation middleware to check if a single file was uploaded
export const requireSingleFile = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.file) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'No file uploaded. Please select an image file.',
    })
    return
  }

  next()
}
