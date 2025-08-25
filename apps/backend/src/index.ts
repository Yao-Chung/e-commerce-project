import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

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

// Health check route
app.get('/health', (_, res): void => {
  res.json({
    status: 'OK',
    message: 'E-commerce API is running',
    timestamp: new Date().toISOString(),
  })
})

// API routes
app.get('/api', (_, res): void => {
  res.json({
    message: 'E-commerce API v1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      products: '/api/products',
      cart: '/api/cart',
      orders: '/api/orders',
      payments: '/api/payments',
      users: '/api/users',
      admin: '/api/admin',
    },
  })
})

// 404 handler
app.use('*', (req, res): void => {
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
