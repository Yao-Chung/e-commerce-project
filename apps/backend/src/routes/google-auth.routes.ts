import { Router, Request, Response, NextFunction } from 'express'
import passport from 'passport'
import { authController } from '../controllers/auth.controller'
import { withAuth } from '../middleware/auth.middleware'

const router: Router = Router()

// Middleware to check if Google OAuth is configured
const requireGoogleOAuth = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    res.status(503).json({
      error: 'Service Unavailable',
      message:
        'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.',
    })
    return
  }
  next()
}

// Google OAuth routes with clean middleware pattern
router.get(
  '/google',
  requireGoogleOAuth,
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
)

router.get(
  '/google/callback',
  requireGoogleOAuth,
  passport.authenticate('google', {
    session: false,
    failureRedirect:
      process.env.FRONTEND_URL + '/auth/login?error=google_auth_failed',
  }),
  withAuth((req, res) => authController.googleCallback(req, res))
)

export default router
