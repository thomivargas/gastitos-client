import { create } from 'zustand'
import type { Usuario } from '@/types'
import { setAuthStoreGetter } from '@/api/client'

interface AuthState {
  accessToken: string | null
  usuario: Usuario | null
  isAuthenticated: boolean
  isInitializing: boolean

  setAuth: (accessToken: string, usuario: Usuario) => void
  setAccessToken: (accessToken: string) => void
  setUsuario: (usuario: Usuario) => void
  logout: () => void
  inicializar: () => Promise<void>
}

let inicializandoPromise: Promise<void> | null = null

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  usuario: null,
  isAuthenticated: false,
  isInitializing: true,

  setAuth: (accessToken, usuario) =>
    set({ accessToken, usuario, isAuthenticated: true }),

  setAccessToken: (accessToken) =>
    set({ accessToken }),

  setUsuario: (usuario) =>
    set({ usuario }),

  logout: () =>
    set({ accessToken: null, usuario: null, isAuthenticated: false }),

  inicializar: async () => {
    // Si ya esta autenticado, no hace falta
    if (get().isAuthenticated) {
      set({ isInitializing: false })
      return
    }

    // Evitar llamadas duplicadas concurrentes
    if (inicializandoPromise) return inicializandoPromise

    inicializandoPromise = (async () => {
      try {
        // Intenta refresh — la cookie HttpOnly se envia automaticamente
        const { BASE_URL } = await import('@/api/client')
        const { default: axios } = await import('axios')
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        )

        const { accessToken, usuario } = data.data
        set({ accessToken, usuario, isAuthenticated: true })
      } catch {
        // No hay sesion valida — se queda deslogueado
      } finally {
        set({ isInitializing: false })
        inicializandoPromise = null
      }
    })()

    return inicializandoPromise
  },
}))

// Conectar el store con el API client
setAuthStoreGetter(() => useAuthStore.getState())
