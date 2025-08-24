# E-Commerce Project

A full-stack e-commerce application built with React, TypeScript, Node.js, and PostgreSQL.

## 🚀 Features

- **User Authentication**: Registration, login, logout with JWT
- **Product Catalog**: Browse products with images, titles, prices, and descriptions
- **Category Navigation**: Simple category-based product browsing
- **Shopping Cart**: Add/remove items, view cart contents
- **Checkout Process**: Simple checkout form with customer information
- **Payment Integration**: Stripe payment gateway
- **Order Management**: Place orders and view confirmations
- **Admin Panel**: Full CRUD operations for products and order management

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** - Build tool and development server
- **Tailwind CSS** + **shadcn/ui** - Styling and UI components
- **React Hook Form** + **Zod** - Form handling and validation
- **React Query** - Server state management
- **Axios** - HTTP client
- **Stripe Elements** - Payment forms
- **React OAuth** - Social authentication
- **Lucide React** - Icons
- **js-cookie** - Cookie management
- **Lodash** - Utility functions

### Backend

- **Node.js** with **Express** and TypeScript
- **Prisma ORM** with **PostgreSQL** database
- **JWT Authentication** with Passport.js strategies:
  - **passport-jwt** - JWT strategy
  - **passport-google-oauth20** - Google OAuth
- **Zod** - Runtime validation
- **Stripe SDK** - Payment processing
- **Cloudinary** - Image upload and management
- **Express Session** - Session management

### Development & Testing

- **Turborepo** - Monorepo build system with pnpm
- **MSW** (Mock Service Worker) - API mocking
- **Storybook** - Component development and documentation
- **TypeScript** - Type safety

### Database

- **PostgreSQL** - Primary database

### Payment

- **Stripe** - Payment processing

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **pnpm** package manager
- **Turborepo** - Install globally: `npm install -g turbo`
- **PostgreSQL** database
- **Stripe** account for payment processing
- **Cloudinary** account for image uploads (optional)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd e-commerce-project
```

### 2. Install dependencies

```bash
# Install all dependencies across the monorepo
pnpm install

# Or use turbo for optimized installation
pnpm turbo install
```

### 3. Environment Setup

Create `.env` files for both frontend and backend:

#### Backend `.env`

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce"

# JWT
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"

# Session
SESSION_SECRET="your-session-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# CORS
FRONTEND_URL="http://localhost:5173"
```

#### Frontend `.env`

```env
# API
VITE_API_URL="http://localhost:3000/api"

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Google OAuth
VITE_GOOGLE_CLIENT_ID="your-google-client-id"
```

### 4. Database Setup

```bash
# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev

# Seed the database (optional)
pnpm prisma db seed
```

### 5. Start Development Servers

#### Option 1: Using Turborepo (Recommended)

```bash
# Start all services in parallel
pnpm turbo dev
```

#### Option 2: Start individually

##### Backend

```bash
cd backend
pnpm dev
```

##### Frontend

```bash
cd frontend
pnpm dev
```

The application will be available at:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

## 📁 Project Structure

```
e-commerce-project/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and configurations
│   │   ├── types/          # TypeScript type definitions
│   │   └── styles/         # Global styles and Tailwind config
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Database models (Prisma)
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── prisma/             # Database schema and migrations
│   └── package.json
├── shared/                  # Shared types and utilities (optional)
└── README.md
```

## 🔧 Available Scripts

### Monorepo (Turborepo)

```bash
pnpm turbo dev         # Start all development servers in parallel
pnpm turbo build       # Build all packages for production
pnpm turbo lint        # Run linting across all packages
pnpm turbo type-check  # Run TypeScript checking across all packages
pnpm turbo test        # Run tests across all packages
```

### Frontend

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript type checking
pnpm storybook    # Start Storybook development server
```

### Backend

```bash
pnpm dev          # Start development server with hot reload
pnpm build        # Build TypeScript to JavaScript
pnpm start        # Start production server
pnpm prisma:studio # Open Prisma Studio
pnpm prisma:migrate # Run database migrations
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

## 📚 API Documentation

The API follows RESTful conventions. Key endpoints include:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/cart` - Add item to cart
- `POST /api/orders` - Create new order
- `POST /api/admin/products` - Create product (admin only)

## 🎨 UI Components

This project uses shadcn/ui components with Tailwind CSS. To add new components:

```bash
pnpm dlx shadcn-ui@latest add [component-name]
```

## 🔐 Authentication

The application supports:

- Email/password authentication with JWT
- Google OAuth integration
- Protected routes and admin-only access

## 💳 Payment Integration

Stripe is integrated for payment processing:

- Test cards can be used in development
- Webhook handling for payment confirmations
- Secure payment form with Stripe Elements

## 🚀 Deployment

### Environment Variables

Ensure all production environment variables are set.

### Database

Run migrations in production:

```bash
pnpm prisma migrate deploy
```

### Build

```bash
# Frontend
pnpm build

# Backend
pnpm build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## 🔗 Useful Links

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Stripe Documentation](https://stripe.com/docs/)
