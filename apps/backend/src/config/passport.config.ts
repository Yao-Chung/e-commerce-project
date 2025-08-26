import passport from 'passport'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from 'passport-google-oauth20'
import { PrismaClient } from '@prisma/client'
import { JWTPayload, GoogleProfile } from '../types/auth.types.js'

const prisma: PrismaClient = new PrismaClient()

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    },
    async (payload: JWTPayload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            googleId: true,
          },
        })

        if (user) {
          return done(null, user)
        }
        return done(null, false)
      } catch (error) {
        return done(error, false)
      }
    }
  )
)

// Google OAuth Strategy - Create instance with proper typing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const googleStrategy = new (GoogleStrategy as any)(
  {
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    passReqToCallback: false,
  },
  async (
    _accessToken: string,
    _refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback
  ) => {
    try {
      // Check if user already exists with this Google ID
      let user = await prisma.user.findUnique({
        where: { googleId: profile.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          googleId: true,
        },
      })

      if (user) {
        return done(null, user)
      }

      // Check if user exists with same email
      const email: string = profile.emails[0]?.value || ''
      user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          googleId: true,
        },
      })

      if (user) {
        // Link Google account to existing user
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: profile.id },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            googleId: true,
          },
        })
        return done(null, updatedUser)
      }

      // Create new user
      const newUser = await prisma.user.create({
        data: {
          googleId: profile.id,
          email,
          name: profile.displayName,
          password: null, // No password for OAuth users
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          googleId: true,
        },
      })

      return done(null, newUser)
    } catch (error) {
      return done(error, false)
    }
  }
)

passport.use('google', googleStrategy)

export default passport
