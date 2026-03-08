import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // envia cookies (refresh token) en cross-origin
})

// Lazy import del store para evitar circular dependency
// Se resuelve en runtime cuando ya esta inicializado
let _getStore: (() => {
  accessToken: string | null
  setAccessToken: (t: string) => void
  logout: () => void
}) | null = null

export function setAuthStoreGetter(getter: typeof _getStore) {
  _getStore = getter
}

function getStore() {
  if (!_getStore) throw new Error('Auth store no inicializado')
  return _getStore()
}

// Adjunta el access token en cada request
apiClient.interceptors.request.use((config) => {
  try {
    const { accessToken } = getStore()
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  } catch {
    // Store no inicializado todavia (requests antes del mount)
  }
  return config
})

// Cola de requests que fallaron durante el refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason: unknown) => void
  config: AxiosRequestConfig
}> = []

function processQueue(error: unknown, newToken: string | null) {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error)
    } else {
      if (config.headers) config.headers['Authorization'] = `Bearer ${newToken}`
      resolve(apiClient(config))
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error)

    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // POST /auth/refresh — sin body, el browser envia la cookie automaticamente
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        )

        const newToken: string = data.data.accessToken
        getStore().setAccessToken(newToken)

        processQueue(null, newToken)

        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        }
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        try { getStore().logout() } catch { /* */ }
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)
