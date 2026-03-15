import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '@/stores/auth.store'
import { Spinner } from '@/components/ui/spinner'

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isInitializing = useAuthStore((s) => s.isInitializing)
  const inicializar = useAuthStore((s) => s.inicializar)

  useEffect(() => {
    inicializar()
  }, [inicializar])

  if (isInitializing) {
    return <Spinner fullScreen />
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <Outlet />
}
