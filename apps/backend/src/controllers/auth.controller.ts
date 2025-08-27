import { Request, Response } from 'express'
import { z } from 'zod'
import { authService } from '../services/auth.service'
import {
  AuthenticatedRequest,
  RegisterRequestBody,
  LoginRequestBody,
  AuthResponse,
} from '../types/auth.types'

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const loginSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export class AuthController {
  // Register new user
  async register(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = registerSchema.safeParse(req.body)
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.issues,
        })
        return
      }

      const { name, email, password }: RegisterRequestBody =
        validationResult.data

      // Check if user already exists
      const existingUser = await authService.userExistsByEmail(email)
      if (existingUser) {
        res.status(409).json({
          error: 'Conflict',
          message: 'User with this email already exists',
        })
        return
      }

      // Create user
      const user = await authService.createUser({ name, email, password })

      // Generate JWT token
      const token: string = authService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      })

      // Create session
      await authService.createSession(user.id, { loginType: 'email' })

      const response: AuthResponse = {
        user,
        token,
      }

      res.status(201).json({
        message: 'User registered successfully',
        data: response,
      })
    } catch (error) {
      console.error('Registration error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to register user',
      })
    }
  }

  // Login user
  async login(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = loginSchema.safeParse(req.body)
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.issues,
        })
        return
      }

      const { email, password }: LoginRequestBody = validationResult.data

      // Find user by email
      const user = await authService.findUserByEmail(email)
      if (!user || !user.password) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid email or password',
        })
        return
      }

      // Check password
      const isPasswordValid: boolean = await authService.comparePassword(
        password,
        user.password
      )
      if (!isPasswordValid) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid email or password',
        })
        return
      }

      // Generate JWT token
      const token: string = authService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      })

      // Create session
      await authService.createSession(user.id, { loginType: 'email' })

      // Remove password from response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      const { password: _, ...userWithoutPassword } = user

      const response: AuthResponse = {
        user: userWithoutPassword,
        token,
      }

      res.json({
        message: 'Login successful',
        data: response,
      })
    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to login',
      })
    }
  }

  // Get current user profile
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = await authService.findUserById(req.user.id)
      if (!user) {
        res.status(404).json({
          error: 'Not found',
          message: 'User not found',
        })
        return
      }

      res.json({
        message: 'Profile retrieved successfully',
        data: { user },
      })
    } catch (error) {
      console.error('Get profile error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to get profile',
      })
    }
  }

  // Google OAuth success callback
  async googleCallback(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const user = req.user

      // Generate JWT token
      const token: string = authService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      })

      // Create session
      await authService.createSession(user.id, { loginType: 'google' })

      // Redirect to frontend with token
      const frontendUrl: string =
        process.env.FRONTEND_URL || 'http://localhost:5173'
      const redirectUrl: string = `${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`

      res.redirect(redirectUrl)
    } catch (error) {
      console.error('Google callback error:', error)
      const frontendUrl: string =
        process.env.FRONTEND_URL || 'http://localhost:5173'
      res.redirect(`${frontendUrl}/auth/callback?error=authentication_failed`)
    }
  }

  // Logout user (clean up sessions)
  async logout(_: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Clean expired sessions
      await authService.cleanExpiredSessions()

      res.json({
        message: 'Logout successful',
      })
    } catch (error) {
      console.error('Logout error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to logout',
      })
    }
  }

  // Verify token endpoint
  async verifyToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      res.json({
        message: 'Token is valid',
        data: {
          user: req.user,
        },
      })
    } catch (error) {
      console.error('Token verification error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to verify token',
      })
    }
  }
}

export const authController: AuthController = new AuthController()
