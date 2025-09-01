import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { PrismaClient, User } from '@prisma/client'
import { JWTPayload } from '../types/auth.types'

const prisma: PrismaClient = new PrismaClient()

export class AuthService {
  private readonly jwtSecret: string
  private readonly jwtExpiresIn: string

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d'
  }

  // Generate JWT token
  generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions)
  }

  // Verify JWT token
  verifyToken(token: string): JWTPayload {
    return jwt.verify(token, this.jwtSecret) as JWTPayload
  }

  // Hash password
  async hashPassword(password: string): Promise<string> {
    const saltRounds: number = 12
    return bcrypt.hash(password, saltRounds)
  }

  // Compare password
  async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  // Create user
  async createUser(data: {
    name: string
    email: string
    password: string
  }): Promise<Omit<User, 'password'>> {
    const hashedPassword: string = await this.hashPassword(data.password)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        googleId: true,
        phone: true,
        avatar: true,
        dateOfBirth: true,
        gender: true,
      },
    })

    return user
  }

  // Find user by email
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    })
  }

  // Find user by ID
  async findUserById(id: string): Promise<Omit<User, 'password'> | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        googleId: true,
        phone: true,
        avatar: true,
        dateOfBirth: true,
        gender: true,
      },
    })
  }

  // Check if user exists by email
  async userExistsByEmail(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
    return !!user
  }

  // Create session
  async createSession(
    userId: string,
    sessionData: Record<string, unknown>
  ): Promise<void> {
    const expiresAt: Date = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

    await prisma.session.create({
      data: {
        sessionId: `session_${Date.now()}_${Math.random()}`,
        userId,
        data: sessionData as object,
        expiresAt,
      },
    })
  }

  // Clean expired sessions
  async cleanExpiredSessions(): Promise<void> {
    await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })
  }
}

export const authService: AuthService = new AuthService()
