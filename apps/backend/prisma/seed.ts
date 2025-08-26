import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma: PrismaClient = new PrismaClient()

async function main(): Promise<void> {
  console.log('🌱 Starting database seeding...')

  // Clean existing data (in reverse order due to foreign key constraints)
  await prisma.cartItem.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.order.deleteMany()
  await prisma.address.deleteMany()
  await prisma.session.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Cleaned existing data')

  // Create users
  const hashedPassword: string = await bcrypt.hash('password123', 10)

  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  const regularUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: hashedPassword,
      name: 'John Doe',
      role: 'USER',
    },
  })

  const oauthUser = await prisma.user.create({
    data: {
      email: 'google.user@example.com',
      name: 'Jane Smith',
      role: 'USER',
      googleId: 'google-123456789',
    },
  })

  console.log('👥 Created users')

  // Create addresses
  await prisma.address.create({
    data: {
      name: 'Home Address',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      isDefault: true,
      userId: regularUser.id,
    },
  })

  await prisma.address.create({
    data: {
      name: 'Work Address',
      street: '456 Business Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA',
      isDefault: false,
      userId: oauthUser.id,
    },
  })

  console.log('🏠 Created addresses')

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 199.99,
        category: 'Electronics',
        imageUrl:
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        stock: 50,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Organic Cotton T-Shirt',
        description: 'Comfortable organic cotton t-shirt in multiple colors',
        price: 29.99,
        category: 'Clothing',
        imageUrl:
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
        stock: 100,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Coffee Maker Pro',
        description:
          'Professional-grade coffee maker with programmable features',
        price: 149.99,
        category: 'Home & Kitchen',
        imageUrl:
          'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500',
        stock: 25,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Yoga Mat Premium',
        description: 'Non-slip premium yoga mat perfect for all exercises',
        price: 49.99,
        category: 'Sports & Fitness',
        imageUrl:
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500',
        stock: 75,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Smartphone Case',
        description:
          'Protective case for smartphones with wireless charging support',
        price: 24.99,
        category: 'Electronics',
        imageUrl:
          'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500',
        stock: 200,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Desk Lamp LED',
        description: 'Adjustable LED desk lamp with USB charging port',
        price: 79.99,
        category: 'Home & Office',
        imageUrl:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
        stock: 40,
      },
    }),
  ])

  console.log('🛍️ Created products')

  // Create cart items
  await prisma.cartItem.create({
    data: {
      quantity: 2,
      userId: regularUser.id,
      productId: products[0].id, // Bluetooth Headphones
    },
  })

  await prisma.cartItem.create({
    data: {
      quantity: 1,
      userId: regularUser.id,
      productId: products[2].id, // Coffee Maker
    },
  })

  await prisma.cartItem.create({
    data: {
      quantity: 3,
      userId: oauthUser.id,
      productId: products[1].id, // T-Shirt
    },
  })

  console.log('🛒 Created cart items')

  // Create orders
  const order1 = await prisma.order.create({
    data: {
      status: 'DELIVERED',
      total: 249.98,
      shippingAddress: {
        name: 'John Doe',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      },
      userId: regularUser.id,
    },
  })

  const order2 = await prisma.order.create({
    data: {
      status: 'PROCESSING',
      total: 89.97,
      shippingAddress: {
        name: 'Jane Smith',
        street: '456 Business Ave',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA',
      },
      userId: oauthUser.id,
    },
  })

  console.log('📦 Created orders')

  // Create order items
  await prisma.orderItem.create({
    data: {
      quantity: 1,
      price: 199.99, // Price at time of order
      orderId: order1.id,
      productId: products[0].id, // Bluetooth Headphones
    },
  })

  await prisma.orderItem.create({
    data: {
      quantity: 2,
      price: 24.99, // Price at time of order
      orderId: order1.id,
      productId: products[4].id, // Smartphone Case
    },
  })

  await prisma.orderItem.create({
    data: {
      quantity: 3,
      price: 29.99, // Price at time of order
      orderId: order2.id,
      productId: products[1].id, // T-Shirt
    },
  })

  console.log('📋 Created order items')

  // Create payments
  await prisma.payment.create({
    data: {
      stripeId: 'pi_test_1234567890',
      amount: 249.98,
      currency: 'usd',
      status: 'SUCCEEDED',
      orderId: order1.id,
    },
  })

  await prisma.payment.create({
    data: {
      stripeId: 'pi_test_0987654321',
      amount: 89.97,
      currency: 'usd',
      status: 'PENDING',
      orderId: order2.id,
    },
  })

  console.log('💳 Created payments')

  // Create sessions
  await prisma.session.create({
    data: {
      sessionId: 'sess_1234567890abcdef',
      data: {
        userId: regularUser.id,
        loginTime: new Date().toISOString(),
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      userId: regularUser.id,
    },
  })

  console.log('🔐 Created sessions')

  console.log('✅ Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`- Users: 3 (1 admin, 2 regular)`)
  console.log(`- Products: ${products.length}`)
  console.log(`- Orders: 2`)
  console.log(`- Cart items: 3`)
  console.log(`- Addresses: 2`)
  console.log(`- Payments: 2`)
  console.log(`- Sessions: 1`)
}

main()
  .catch((e): void => {
    console.error('❌ Error during seeding:', e)
    throw e
  })
  .finally(async (): Promise<void> => {
    await prisma.$disconnect()
  })
