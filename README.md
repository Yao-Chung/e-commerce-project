# E-Commerce Project

A full-stack e-commerce application built with React, TypeScript, Node.js, and PostgreSQL.

## 🚀 Features

### 🏠 Landing & Product Discovery

- **Guest Browsing**: Browse products without authentication required
- **Product Catalog**: Display products with images, titles, prices, and descriptions
- **Category Navigation**: Simple category-based product browsing
- **Search & Filter**: Basic product search and filtering capabilities
- **Product Details**: Detailed product pages with full descriptions

### 🔐 User Authentication & Management

- **Multiple Auth Methods**: Email/password and Google OAuth integration
- **JWT Authentication**: Secure token-based authentication
- **Session Management**: Persistent login sessions
- **User Profiles**: Account management and preferences
- **Protected Routes**: Secure access to user-specific features

### 🛍️ Shopping Experience

- **Guest vs Authenticated Flow**: Different experiences for logged-in users
- **Shopping Cart**: Add/remove items, update quantities, persist cart state
- **Wishlist**: Save items for later (authenticated users)
- **Cart Persistence**: Maintain cart across sessions for logged-in users

### 💳 Checkout & Payment

- **Multi-step Checkout**: Review cart → Shipping info → Payment → Confirmation
- **Address Management**: Save and manage shipping addresses
- **Stripe Integration**: Secure payment processing with Stripe Elements
- **Order Review**: Final order confirmation before payment
- **Payment Validation**: Real-time payment form validation

### 📦 Order Management

- **Order Confirmation**: Immediate confirmation with order details
- **Order History**: View past orders and their status
- **Email Notifications**: Automated order confirmation emails
- **Order Tracking**: Basic order status updates

### 👨‍💼 Admin Panel

- **Product Management**: Full CRUD operations for products
- **Order Management**: View and manage customer orders
- **User Management**: Basic user administration
- **Analytics Dashboard**: Basic sales and order analytics

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** - Build tool and development server
- **Tailwind CSS** + **shadcn/ui** - Styling and UI components
- **React Hook Form** + **Zod** - Form handling and validation
- **React Context + useReducer** - Client state management
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

```text
e-commerce-project/
├── apps/
│   ├── frontend/                    # React frontend application
│   │   ├── src/
│   │   │   ├── components/         # Reusable UI components
│   │   │   │   ├── auth/          # Authentication components
│   │   │   │   ├── cart/          # Shopping cart components
│   │   │   │   ├── checkout/      # Checkout flow components
│   │   │   │   ├── product/       # Product display components
│   │   │   │   ├── ui/            # Base UI components (shadcn/ui)
│   │   │   │   └── layout/        # Layout components
│   │   │   ├── pages/             # Page components
│   │   │   │   ├── auth/          # Login, register, OAuth callback
│   │   │   │   ├── products/      # Product catalog, details
│   │   │   │   ├── checkout/      # Checkout steps
│   │   │   │   ├── orders/        # Order history, confirmation
│   │   │   │   ├── admin/         # Admin panel pages
│   │   │   │   └── account/       # User account pages
│   │   │   ├── hooks/             # Custom React hooks
│   │   │   │   ├── useAuth.ts     # Authentication context hook
│   │   │   │   ├── useCart.ts     # Cart context hook
│   │   │   │   ├── useUser.ts     # User context hook
│   │   │   │   ├── useCheckout.ts # Checkout context hook
│   │   │   │   ├── useAdmin.ts    # Admin context hook
│   │   │   │   ├── api/           # API interaction hooks
│   │   │   │   │   ├── useProducts.ts # Product API hooks
│   │   │   │   │   ├── useOrders.ts   # Order API hooks
│   │   │   │   │   └── usePayments.ts # Payment API hooks
│   │   │   │   └── utils/         # Utility hooks
│   │   │   │       ├── useLocalStorage.ts # Local storage hook
│   │   │   │       ├── useDebounce.ts     # Debounce hook
│   │   │   │       └── useApi.ts          # Generic API hook
│   │   │   ├── contexts/          # React Context providers
│   │   │   │   ├── AuthContext.tsx    # Authentication context
│   │   │   │   ├── CartContext.tsx    # Shopping cart context
│   │   │   │   ├── UserContext.tsx    # User preferences context
│   │   │   │   ├── CheckoutContext.tsx # Checkout flow context
│   │   │   │   └── AdminContext.tsx   # Admin state context
│   │   │   ├── providers/         # Context providers with reducers
│   │   │   │   ├── AuthProvider.tsx   # Auth provider with useReducer
│   │   │   │   ├── CartProvider.tsx   # Cart provider with useReducer
│   │   │   │   ├── UserProvider.tsx   # User provider
│   │   │   │   ├── CheckoutProvider.tsx # Checkout provider
│   │   │   │   └── AppProvider.tsx    # Root provider wrapper
│   │   │   ├── lib/               # Utility functions and configurations
│   │   │   │   ├── auth.ts        # Auth configuration
│   │   │   │   ├── stripe.ts      # Stripe configuration
│   │   │   │   ├── api.ts         # API client setup
│   │   │   │   └── utils.ts       # General utilities
│   │   │   ├── types/             # TypeScript type definitions
│   │   │   └── styles/            # Global styles and Tailwind config
│   │   ├── public/                # Static assets
│   │   └── package.json
│   └── backend/                    # Node.js backend application
│       ├── src/
│       │   ├── controllers/       # Route controllers
│       │   │   ├── auth.ts        # Authentication controller
│       │   │   ├── products.ts    # Product management
│       │   │   ├── cart.ts        # Cart operations
│       │   │   ├── orders.ts      # Order processing
│       │   │   ├── payments.ts    # Payment handling
│       │   │   ├── users.ts       # User management
│       │   │   └── admin.ts       # Admin operations
│       │   ├── middleware/        # Express middleware
│       │   │   ├── auth.ts        # JWT authentication
│       │   │   ├── validation.ts  # Request validation
│       │   │   ├── cors.ts        # CORS configuration
│       │   │   └── error.ts       # Error handling
│       │   ├── routes/            # API routes
│       │   │   ├── auth.ts        # Auth routes
│       │   │   ├── products.ts    # Product routes
│       │   │   ├── cart.ts        # Cart routes
│       │   │   ├── orders.ts      # Order routes
│       │   │   ├── payments.ts    # Payment routes
│       │   │   ├── users.ts       # User routes
│       │   │   └── admin.ts       # Admin routes
│       │   ├── services/          # Business logic
│       │   │   ├── auth.ts        # Authentication service
│       │   │   ├── email.ts       # Email notifications
│       │   │   ├── payment.ts     # Payment processing
│       │   │   ├── inventory.ts   # Inventory management
│       │   │   └── analytics.ts   # Analytics service
│       │   ├── types/             # TypeScript type definitions
│       │   └── utils/             # Utility functions
│       ├── prisma/                # Database schema and migrations
│       │   ├── schema.prisma      # Database schema
│       │   ├── migrations/        # Database migrations
│       │   └── seed.ts            # Database seeding
│       └── package.json
├── packages/
│   └── shared/                     # Shared types and utilities
│       ├── types/                 # Shared TypeScript types
│       │   ├── auth.ts           # Authentication types
│       │   ├── product.ts        # Product types
│       │   ├── cart.ts           # Cart types
│       │   ├── order.ts          # Order types
│       │   └── user.ts           # User types
│       ├── utils/                # Shared utilities
│       └── package.json
├── turbo.json                     # Turborepo configuration
├── package.json                   # Root package.json
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

The API follows RESTful conventions and supports the complete e-commerce workflow:

### 🔐 Authentication Endpoints

- `POST /api/auth/register` - User registration with email/password
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### 🛍️ Product & Category Endpoints

- `GET /api/products` - Get all products (with search/filter params)
- `GET /api/products/:id` - Get single product details
- `GET /api/categories` - Get all product categories
- `GET /api/categories/:id/products` - Get products by category
- `GET /api/products/search?q=term` - Search products
- `GET /api/products/featured` - Get featured products

### 🛒 Shopping Cart Endpoints

- `GET /api/cart` - Get user's cart (authenticated)
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item quantity
- `DELETE /api/cart/items/:id` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart
- `POST /api/cart/merge` - Merge guest cart with user cart (on login)

### 💳 Checkout & Order Endpoints

- `POST /api/checkout/validate` - Validate cart before checkout
- `POST /api/checkout/shipping` - Save shipping information
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's order history
- `GET /api/orders/:id` - Get specific order details
- `POST /api/orders/:id/cancel` - Cancel order (if allowed)

### 💰 Payment Endpoints

- `POST /api/payments/intent` - Create Stripe payment intent
- `POST /api/payments/confirm` - Confirm payment completion
- `POST /api/payments/webhook` - Stripe webhook handler

### 👤 User Management Endpoints

- `GET /api/users/addresses` - Get saved addresses
- `POST /api/users/addresses` - Add new address
- `PUT /api/users/addresses/:id` - Update address
- `DELETE /api/users/addresses/:id` - Delete address
- `GET /api/users/wishlist` - Get user's wishlist
- `POST /api/users/wishlist/:productId` - Add to wishlist
- `DELETE /api/users/wishlist/:productId` - Remove from wishlist

### 👨‍💼 Admin Endpoints

- `GET /api/admin/products` - Get all products (admin view)
- `POST /api/admin/products` - Create new product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/users` - Get all users
- `GET /api/admin/analytics` - Get sales analytics

## 🎨 UI Components

This project uses shadcn/ui components with Tailwind CSS. To add new components:

```bash
pnpm dlx shadcn-ui@latest add [component-name]
```

## 🧠 State Management Architecture

The frontend uses **React Context + useReducer** for client state management, providing a clean and type-safe approach:

### Context Structure

```typescript
// Authentication Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usage in components
const { user, login, logout, isLoading } = useAuth();
```

### Key Contexts:

- **AuthContext**: User authentication state, login/logout actions
- **CartContext**: Shopping cart items, add/remove/update actions
- **UserContext**: User preferences, addresses, wishlist
- **CheckoutContext**: Multi-step checkout flow state
- **AdminContext**: Admin-specific state and actions

### Benefits:

- **Type Safety**: Full TypeScript support with proper typing
- **Component Isolation**: No prop drilling, clean component APIs
- **Performance**: Context providers optimize re-renders
- **Developer Experience**: Easy to use hooks like `useAuth()`, `useCart()`
- **Testing**: Easy to mock contexts for testing

### Provider Hierarchy:

```tsx
<AppProvider>
  <AuthProvider>
    <UserProvider>
      <CartProvider>
        <CheckoutProvider>
          <App />
        </CheckoutProvider>
      </CartProvider>
    </UserProvider>
  </AuthProvider>
</AppProvider>
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

## 🎯 User Workflow

### **Core Flow: Browse → Authenticate → Buy → Confirm**

### 🏠 Landing & Discovery Flow

```text
Guest User Lands on Site
↓
Browse Products (No Auth Required)
├── View Product Grid/List
├── Use Basic Search/Filter
├── Click Product for Details
└── See "Add to Cart" (requires login)
```

**Implementation Notes:**

- Homepage displays featured products and categories
- Guest users can browse all products and categories
- Search/filter functionality available without authentication
- Product details page shows full information
- "Add to Cart" button triggers authentication flow

### 🔐 Authentication Flow

```text
User Wants to Purchase
↓
Click "Login/Sign Up"
↓
Choose Authentication Method
├── OAuth (Google) → Auto-login → Dashboard
└── Email/Password → Manual Entry → Dashboard

OAuth Flow Detail:
Click "Continue with Google"
↓
Redirect to Google OAuth
↓
User Authorizes App
↓
Redirect Back with Token
↓
Auto-create Account + Login
↓
Redirect to Originally Intended Page
```

**Implementation Notes:**

- Modal or dedicated auth pages
- Google OAuth integration with passport-google-oauth20
- JWT token management with secure cookies
- Automatic redirect to intended destination after login
- Account creation for new OAuth users

### 🛍️ Shopping Flow (Authenticated User)

```text
Authenticated User
↓
Browse Products
├── View Product Details
├── Select Quantity
└── Add to Cart
↓
Continue Shopping OR Go to Cart
↓
View Cart
├── Update Quantities
├── Remove Items
└── Proceed to Checkout
```

**Implementation Notes:**

- Cart state persists across sessions for logged-in users
- Real-time cart updates without page refresh
- Cart badge shows item count in navigation
- Cart page allows quantity updates and item removal

### 💳 Checkout & Payment Flow

```text
User Clicks "Checkout"
↓
Review Order Summary
├── Items in Cart
├── Subtotal
└── Tax/Shipping (if applicable)
↓
Enter Shipping Information
├── Name, Address
├── Phone Number
└── Delivery Instructions
↓
Choose Payment Method
└── Credit Card (via Stripe)
↓
Enter Payment Details
├── Card Number
├── Expiry, CVV
└── Billing Address
↓
Review Final Order
↓
Click "Place Order"
↓
Process Payment (Stripe)
├── Success → Order Confirmation
└── Failure → Return to Payment
```

**Implementation Notes:**

- Multi-step checkout with progress indicator
- Form validation with React Hook Form + Zod
- Stripe Elements for secure payment collection
- Address management (save for future orders)
- Real-time payment processing with error handling

### ✅ Post-Purchase Flow

```text
Payment Successful
↓
Order Confirmation Page
├── Order Number
├── Order Details
├── Estimated Delivery
└── Email Confirmation Sent
↓
Clear Shopping Cart
↓
Option to Continue Shopping
```

**Implementation Notes:**

- Order confirmation with all details
- Email notification service
- Cart automatically cleared
- Order saved to user's order history

### 📱 Detailed User Journey Maps

#### **First-Time User Journey**

```text
1. Lands on Homepage
2. Sees Featured Products
3. Clicks on Product
4. Views Product Details
5. Clicks "Add to Cart"
6. Prompted to Login
7. Chooses Google OAuth
8. Redirects to Google
9. Authorizes App
10. Returns to Site (Logged In)
11. Product Auto-Added to Cart
12. Reviews Cart
13. Clicks Checkout
14. Enters Shipping Info
15. Enters Payment Info
16. Places Order
17. Sees Confirmation
18. Receives Email
```

#### **Returning User Journey**

```text
1. Lands on Homepage (Already Logged In)
2. Browses Products
3. Adds Multiple Items to Cart
4. Goes to Cart
5. Updates Quantities
6. Proceeds to Checkout
7. Uses Saved Shipping Info
8. Enters New Payment Info
9. Places Order
10. Gets Confirmation
```

### 🎛️ Admin Workflow

```text
Admin Login
↓
Admin Dashboard
├── View Sales Analytics
├── Manage Products
│   ├── Add New Products
│   ├── Edit Existing Products
│   └── Delete Products
├── Manage Orders
│   ├── View All Orders
│   ├── Update Order Status
│   └── Process Refunds
└── User Management
    ├── View All Users
    └── Manage User Accounts
```

**Implementation Notes:**

- Role-based access control
- Dedicated admin interface
- Product management with image upload (Cloudinary)
- Order status management
- Basic analytics dashboard

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
