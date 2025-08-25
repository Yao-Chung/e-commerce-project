# E-Commerce Backend API

A robust Node.js backend API built with Express, TypeScript, and Prisma.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database and API keys

# Generate Prisma client
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate

# Start development server
pnpm dev
```

## 🛠️ Tech Stack

- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** with **PostgreSQL**
- **JWT Authentication** with **Passport.js**
- **Stripe** for payment processing
- **Cloudinary** for image uploads
- **Zod** for runtime validation

## 📁 Structure

```
src/
├── controllers/    # Route controllers
├── middleware/     # Express middleware
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript types
└── utils/          # Utility functions
```

## 🔧 Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm check-ts` - TypeScript type checking
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:migrate` - Run migrations
- `pnpm prisma:studio` - Open Prisma Studio

## 🌐 API Endpoints

- **Health**: `GET /health`
- **Auth**: `/api/auth/*`
- **Products**: `/api/products/*`
- **Cart**: `/api/cart/*`
- **Orders**: `/api/orders/*`
- **Payments**: `/api/payments/*`
- **Users**: `/api/users/*`
- **Admin**: `/api/admin/*`

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `STRIPE_SECRET_KEY` - Stripe API key
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret

Server runs on `http://localhost:3000` by default.
