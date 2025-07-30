import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ErrorBoundary from '@/components/ui/error-boundary'
import OfflineBanner from '@/components/ui/offline-banner'
import { AuthProvider } from '@/contexts/auth-context'
import { FavoritesProvider } from '@/contexts/favorites-context'
import UserMenu from '@/components/auth/user-menu'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MoveOut Map',
  description: 'Find furniture and items near you on an interactive map',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <FavoritesProvider>
            <OfflineBanner />
            <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center">
                    <h1 className="text-xl font-bold text-gray-900">
                      MoveOut Map
                    </h1>
                  </div>
                  <nav className="flex items-center space-x-4">
                    <a
                      href="/"
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Map
                    </a>
                    <a
                      href="/post"
                      className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Post Item
                    </a>
                    <UserMenu />
                  </nav>
                </div>
              </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
            </div>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  )
}