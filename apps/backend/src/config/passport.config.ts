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

// Google OAuth Strategy - Only initialize if credentials are provided
const googleClientId: string | undefined = process.env.GOOGLE_CLIENT_ID
const googleClientSecret: string | undefined = process.env.GOOGLE_CLIENT_SECRET
const googleCallbackUrl: string =
  process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'

if (googleClientId && googleClientSecret) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const googleStrategy = new (GoogleStrategy as any)(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackUrl,
        passReqToCallback: false,
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: GoogleProfile,
        done: VerifyCallback
      ) => {
        try {
          console.log(
            `🔐 Google OAuth callback triggered for user: ${profile.displayName} (${profile.emails[0]?.value})`
          )

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
            console.log(`✅ Existing Google user found: ${user.email}`)
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
            console.log(`🔗 Linking Google account to existing user: ${email}`)
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
          console.log(`👤 Creating new user from Google OAuth: ${email}`)
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

          console.log(
            `✅ New Google user created successfully: ${newUser.email}`
          )
          return done(null, newUser)
        } catch (error) {
          console.error('❌ Google OAuth strategy error:', error)
          return done(error, false)
        }
      }
    )

    passport.use('google', googleStrategy)
    console.log('✅ Google OAuth strategy initialized successfully')
    console.log(`   Client ID: ${googleClientId.substring(0, 20)}...`)
    console.log(`   Callback URL: ${googleCallbackUrl}`)
  } catch (error) {
    console.error('❌ Failed to initialize Google OAuth strategy:', error)
  }
} else {
  console.log(
    '⚠️  Google OAuth not configured - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables are required'
  )
}

export default passport
