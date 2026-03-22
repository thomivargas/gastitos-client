import { lazy, Suspense } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { Spinner } from '@/components/ui/spinner'

// Pages
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegistroPage = lazy(() => import('@/pages/RegistroPage'))
const GoogleExitoPage = lazy(() => import('@/pages/GoogleExitoPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const CuentasPage = lazy(() => import('@/pages/CuentasPage'))
const CuentaDetallePage = lazy(() => import('@/pages/CuentaDetallePage'))
const CategoriasPage = lazy(() => import('@/pages/CategoriasPage'))
const TransaccionesPage = lazy(() => import('@/pages/TransaccionesPage'))
const TransferenciasPage = lazy(() => import('@/pages/TransferenciasPage'))
const ReportesPage = lazy(() => import('@/pages/ReportesPage'))
const RecurrentesPage = lazy(() => import('@/pages/RecurrentesPage'))
const ImportacionPage = lazy(() => import('@/pages/ImportacionPage'))
const ReglasPage = lazy(() => import('@/pages/ReglasPage'))
const MpCallbackPage = lazy(() => import('@/pages/MpCallbackPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function PageLoader() {
  return <Spinner fullScreen />
}

export default function App() {
  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Rutas publicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="/auth/google/exito" element={<GoogleExitoPage />} />
            <Route path="/mp/callback" element={<MpCallbackPage />} />

            {/* Rutas protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/cuentas" element={<CuentasPage />} />
                <Route path="/cuentas/:id" element={<CuentaDetallePage />} />
                <Route path="/categorias" element={<CategoriasPage />} />
                <Route path="/transacciones" element={<TransaccionesPage />} />
                <Route path="/transferencias" element={<TransferenciasPage />} />
                <Route path="/reportes" element={<ReportesPage />} />
                <Route path="/recurrentes" element={<RecurrentesPage />} />
                <Route path="/importar" element={<ImportacionPage />} />
                <Route path="/reglas" element={<ReglasPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
    </ErrorBoundary>
  )
}
