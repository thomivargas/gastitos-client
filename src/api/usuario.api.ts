import { apiClient } from './client'
import type { ApiResponse, Usuario } from '@/types'

export interface ActualizarPerfilData {
  nombre?: string
  moneda?: string
}

export async function obtenerPerfil() {
  const res = await apiClient.get<ApiResponse<Usuario>>('/usuario/perfil')
  return res.data.data
}

export async function actualizarPerfil(data: ActualizarPerfilData) {
  const res = await apiClient.patch<ApiResponse<Usuario>>('/usuario/perfil', data)
  return res.data.data
}
