import { create } from 'zustand'
import type { Usuario } from '@/types'
import { setAuthStoreGetter } from '@/api/client'

interface AuthState {
  accessToken: string | null
  usuario: Usuario | null
  isAuthenticated: boolean

  setAuth: (accessToken: string, usuario: Usuario) => void
  setAccessToken: (accessToken: string) => void
  setUsuario: (usuario: Usuario) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  usuario: null,
  isAuthenticated: false,

  setAuth: (accessToken, usuario) =>
    set({ accessToken, usuario, isAuthenticated: true }),

  setAccessToken: (accessToken) =>
    set({ accessToken }),

  setUsuario: (usuario) =>
    set({ usuario }),

  logout: () =>
    set({ accessToken: null, usuario: null, isAuthenticated: false }),
}))

// Conectar el store con el API client
setAuthStoreGetter(() => useAuthStore.getState())
