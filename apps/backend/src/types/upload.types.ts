import { AuthenticatedRequest } from './auth.types'

// Type alias for uploaded file
export type UploadedFile = {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  size: number
  buffer: Buffer
}

export type UploadResult = {
  public_id: string
  url: string
  secure_url: string
  width: number
  height: number
  format: string
  resource_type: string
  bytes: number
}

export type CloudinaryUploadType =
  | 'product_images'
  | 'thumbnails'
  | 'user_avatars'

// Request types for upload endpoints
export type UploadSingleRequest = AuthenticatedRequest & {
  file?: UploadedFile
  body: {
    uploadType?: CloudinaryUploadType
  }
}

export type UploadMultipleRequest = AuthenticatedRequest & {
  files?: UploadedFile[]
  body: {
    uploadType?: CloudinaryUploadType
  }
}

export type DeleteImageRequest = AuthenticatedRequest & {
  body: {
    publicId: string
  }
}

export type DeleteMultipleImagesRequest = AuthenticatedRequest & {
  body: {
    publicIds: string[]
  }
}

export type GetImageDetailsRequest = AuthenticatedRequest & {
  params: {
    publicId: string
  }
}

export type GenerateTransformationRequest = AuthenticatedRequest & {
  params: {
    publicId: string
  }
  body: {
    transformations?: Record<string, unknown>
  }
}

// Response types
export type UploadResponse = {
  message: string
  data: {
    image: UploadResult
  }
}

export type MultipleUploadResponse = {
  message: string
  data: {
    images: UploadResult[]
    count: number
  }
}

export type DeleteResponse = {
  message: string
  data: {
    result: string
  }
}

export type MultipleDeleteResponse = {
  message: string
  data: {
    deleted: Record<string, string>
  }
}

export type ImageDetailsResponse = {
  message: string
  data: {
    image: unknown
  }
}

export type TransformationUrlResponse = {
  message: string
  data: {
    url: string
    publicId: string
    transformations: Record<string, unknown>
  }
}

// Product with image upload request types
export type ProductCreateWithImageRequest = AuthenticatedRequest & {
  body: {
    name: string
    description: string
    price: number
    category: string
    stock: number
  }
  file?: UploadedFile
}

export type ProductUpdateWithImageRequest = AuthenticatedRequest & {
  params: {
    id: string
  }
  body: {
    name?: string
    description?: string
    price?: number
    category?: string
    stock?: number
  }
  file?: UploadedFile
}
