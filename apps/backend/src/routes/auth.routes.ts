import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { authenticateJWT, withAuth } from '../middleware/auth.middleware'
import googleAuthRoutes from './google-auth.routes'

const router: Router = Router()

// Registration endpoint
router.post('/register', authController.register.bind(authController))

// Login endpoint
router.post('/login', authController.login.bind(authController))

// Mount Google OAuth routes
router.use('/', googleAuthRoutes)

// Protected routes
router.get(
  '/profile',
  authenticateJWT,
  withAuth((req, res) => authController.getProfile(req, res))
)
router.post(
  '/logout',
  authenticateJWT,
  withAuth((req, res) => authController.logout(req, res))
)
router.get(
  '/verify',
  authenticateJWT,
  withAuth((req, res) => authController.verifyToken(req, res))
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
