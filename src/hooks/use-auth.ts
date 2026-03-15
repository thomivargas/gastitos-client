import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth.store'
import { extractApiError } from '@/lib/utils'
import * as authApi from '@/api/auth.api'

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.accessToken, data.usuario)
      navigate('/', { replace: true })
    },
    onError: (error) => {
      toast.error(extractApiError(error))
    },
  })
}

export function useRegistro() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.registro,
    onSuccess: (data) => {
      setAuth(data.accessToken, data.usuario)
      toast.success('Cuenta creada exitosamente')
      navigate('/', { replace: true })
    },
    onError: (error) => {
      toast.error(extractApiError(error))
    },
  })
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout()
      queryClient.clear()
      navigate('/login', { replace: true })
    },
    onError: () => {
      // Logout local aunque falle el server
      logout()
      queryClient.clear()
      navigate('/login', { replace: true })
    },
  })
}

