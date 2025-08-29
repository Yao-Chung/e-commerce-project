import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { authenticateJWT } from '../middleware/auth.middleware'
import { AuthenticatedRequest } from '../types/auth.types'
import googleAuthRoutes from './google-auth.routes'

const router: Router = Router()

// Registration endpoint
router.post('/register', authController.register.bind(authController))

// Login endpoint
router.post('/login', authController.login.bind(authController))

// Mount Google OAuth routes
router.use('/', googleAuthRoutes)

// Protected routes
router.get('/profile', authenticateJWT, (req, res) =>
  authController.getProfile(req as AuthenticatedRequest, res)
)
router.post('/logout', authenticateJWT, (req, res) =>
  authController.logout(req as AuthenticatedRequest, res)
)
router.get('/verify', authenticateJWT, (req, res) =>
  authController.verifyToken(req as AuthenticatedRequest, res)
)

// Health check for auth routes
router.get('/health', (_, res) => {
  const googleOAuthConfigured: boolean = !!(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  )

  res.json({
    status: 'OK',
    message: 'Auth service is running',
    timestamp: new Date().toISOString(),
    services: {
      jwtAuth: 'enabled',
      googleOAuth: googleOAuthConfigured ? 'enabled' : 'disabled',
      database: 'connected', // Assuming Prisma is working
    },
    endpoints: {
      register: '/api/auth/register',
      login: '/api/auth/login',
      profile: '/api/auth/profile',
      googleOAuth: googleOAuthConfigured ? '/api/auth/google' : 'disabled',
      googleCallback: googleOAuthConfigured
        ? '/api/auth/google/callback'
        : 'disabled',
    },
  })
})

export default router
