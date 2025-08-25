import React, { useState } from 'react'
import { ShoppingCart, Search, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const App: React.FC = () => {
  const [count, setCount] = useState<number>(0)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">E-Commerce Store</h1>
          <nav className="flex items-center space-x-4">
            <button
              className={cn(
                'p-2 hover:bg-secondary rounded-md transition-colors',
                'flex items-center space-x-2'
              )}
            >
              <Search className="h-5 w-5" />
              <span>Search</span>
            </button>
            <button className="p-2 hover:bg-secondary rounded-md transition-colors">
              <User className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-md transition-colors relative">
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-foreground">
            Welcome to Your E-Commerce Store
          </h2>
          <p className="text-muted-foreground text-lg">
            Built with React, TypeScript, Vite, and Tailwind CSS
          </p>

          <div className="flex justify-center space-x-4 mt-8">
            <button
              onClick={() => setCount((count: number) => count + 1)}
              className={cn(
                'bg-primary text-primary-foreground px-6 py-2 rounded-md',
                'hover:bg-primary/90 transition-colors'
              )}
            >
              Add to Cart ({count})
            </button>
            <button
              onClick={() => setCount(0)}
              className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md hover:bg-secondary/90 transition-colors"
            >
              Clear Cart
            </button>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-2">React Hook Form + Zod</h3>
              <p className="text-sm text-muted-foreground">
                Form handling and validation ready
              </p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-2">React Query</h3>
              <p className="text-sm text-muted-foreground">
                Server state management configured
              </p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-2">Stripe Integration</h3>
              <p className="text-sm text-muted-foreground">
                Payment processing ready
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
