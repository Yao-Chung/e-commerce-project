import { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import { AuthenticatedRequest } from '../types/auth.types'
import { User } from '@prisma/client'

// Type guard to check if request has user
function isAuthenticatedRequest(req: Request): req is AuthenticatedRequest {
  return 'user' in req && req.user !== undefined && req.user !== null
}

// JWT Authentication middleware
export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  passport.authenticate(
    'jwt',
    { session: false },
    (err: Error, user: User | false) => {
      if (err) {
        return next(err)
      }

      if (!user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or missing token',
        })
        return
      }

      // Properly assign user to request without type assertion
      Object.defineProperty(req, 'user', {
        value: user,
        writable: false,
        enumerable: true,
      })

      next()
    }
  )(req, res, next)
}

// Helper function to safely get authenticated request
export function getAuthenticatedRequest(
  req: Request
): AuthenticatedRequest | null {
  if (isAuthenticatedRequest(req)) {
    return req
  }
  return null
}

// Admin role middleware
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    })
    return
  }

  if (req.user.role !== 'ADMIN') {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required',
    })
    return
  }

  next()
}

// Optional JWT authentication (doesn't fail if no token)
export const optionalJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  passport.authenticate(
    'jwt',
    { session: false },
    (err: Error, user: User | false) => {
      if (err) {
        return next(err)
      }

      if (user) {
        Object.defineProperty(req, 'user', {
          value: user,
          writable: false,
          enumerable: true,
        })
      }

      next()
    }
  )(req, res, next)
}
