import { Router } from 'express'
import passport from 'passport'
import { authController } from '../controllers/auth.controller'
import { authenticateJWT, withAuth } from '../middleware/auth.middleware'

const router: Router = Router()

// Registration endpoint
router.post('/register', authController.register.bind(authController))

// Login endpoint
router.post('/login', authController.login.bind(authController))

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
)

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect:
      process.env.FRONTEND_URL + '/auth/login?error=google_auth_failed',
  }),
  withAuth((req, res) => authController.googleCallback(req, res))
)

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
  res.json({
    status: 'OK',
    message: 'Auth service is running',
    timestamp: new Date().toISOString(),
  })
})

export default router
