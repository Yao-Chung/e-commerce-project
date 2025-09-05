import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import passport from './config/passport.config'
import authRoutes from './routes/auth.routes'
import productRoutes from './routes/product.routes'
import uploadRoutes from './routes/upload.routes'
import userRoutes from './routes/user.routes'
import addressRoutes from './routes/address.routes'
import wishlistRoutes from './routes/wishlist.routes'
import preferencesRoutes from './routes/preferences.routes'
import cartRoutes from './routes/cart.routes'

// Load environment variables
dotenv.config()

const app = express()
const PORT: number = parseInt(process.env.PORT || '3000')

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Initialize Passport
app.use(passport.initialize())

// Health check route
app.get('/health', (_, res): void => {
  res.json({
    status: 'OK',
    message: 'E-commerce API is running',
    timestamp: new Date().toISOString(),
  })
})

// Mount routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/users', userRoutes)
app.use('/api/addresses', addressRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/preferences', preferencesRoutes)
app.use('/api/cart', cartRoutes)

// API routes
app.get('/api', (_, res): void => {
  res.json({
    message: 'E-commerce API v1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      products: '/api/products',
      upload: '/api/upload',
      users: '/api/users',
      addresses: '/api/addresses',
      wishlist: '/api/wishlist',
      preferences: '/api/preferences',
      cart: '/api/cart',
      orders: '/api/orders',
      payments: '/api/payments',
      admin: '/api/admin',
    },
  })
})

// 404 handler
app.use((req, res): void => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  })
})

// Error handler
app.use(
  (
    err: Error,
    _: express.Request,
    res: express.Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    _next: express.NextFunction
  ): void => {
    console.error('Error:', err.message)
    res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'Something went wrong',
    })
  }
)

// Start server
app.listen(PORT, (): void => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📚 API docs available at http://localhost:${PORT}/api`)
  console.log(`💖 Health check at http://localhost:${PORT}/health`)
})
