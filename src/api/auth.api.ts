import { apiClient } from './client'
import type { ApiResponse, Usuario } from '@/types'

interface AuthResponse {
  accessToken: string
  usuario: Usuario
}

interface LoginData {
  email: string
  password: string
}

interface RegistroData {
  email: string
  nombre: string
  password: string
}

export async function login(data: LoginData) {
  const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data)
  return res.data.data
}

export async function registro(data: RegistroData) {
  const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/registro', data)
  return res.data.data
}

export async function refresh() {
  const res = await apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh')
  return res.data.data
}

export async function logout() {
  await apiClient.post('/auth/logout')
}

export async function cambiarPassword(data: { passwordActual: string; passwordNueva: string }) {
  const res = await apiClient.post('/auth/cambiar-password', data)
  return res.data
}

export interface SesionActiva {
  id: string
  ipAddress: string | null
  userAgent: string | null
  creadoEl: string
}

export async function listarSesiones() {
  const res = await apiClient.get<ApiResponse<SesionActiva[]>>('/auth/sesiones')
  return res.data.data
}

export async function cerrarSesion(id: string) {
  await apiClient.delete(`/auth/sesiones/${id}`)
}
