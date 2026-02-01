import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/providers'
import { ProtectedRoute } from '@/components/auth'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { FullPageLoading } from '@/components/ui/loading-spinner'

// Lazy load pages for code splitting
const Login = lazy(() => import('@/pages/Login'))
const Signup = lazy(() => import('@/pages/Signup'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Accounts = lazy(() => import('@/pages/Accounts'))
const Categories = lazy(() => import('@/pages/Categories'))
const Transactions = lazy(() => import('@/pages/Transactions'))
const Budgets = lazy(() => import('@/pages/Budgets'))
const Debts = lazy(() => import('@/pages/Debts'))
const Reports = lazy(() => import('@/pages/Reports'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <Suspense fallback={<FullPageLoading />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login/*" element={<Login />} />
              <Route path="/signup/*" element={<Signup />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/accounts"
                element={
                  <ProtectedRoute>
                    <Accounts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute>
                    <Categories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <Transactions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/budgets"
                element={
                  <ProtectedRoute>
                    <Budgets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/debts"
                element={
                  <ProtectedRoute>
                    <Debts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>

          <Toaster position="top-center" richColors />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
