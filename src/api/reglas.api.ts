import { apiClient } from './client'
import type { ApiResponse, ReglaCategorizacion } from '@/types'

export interface CrearReglaData {
  nombre: string
  patron: string
  categoriaId: string
  prioridad?: number
  activa?: boolean
}

export interface ActualizarReglaData {
  nombre?: string
  patron?: string
  categoriaId?: string
  prioridad?: number
  activa?: boolean
}

export async function listar() {
  const res = await apiClient.get<ApiResponse<ReglaCategorizacion[]>>('/reglas')
  return res.data.data
}

export async function obtener(id: string) {
  const res = await apiClient.get<ApiResponse<ReglaCategorizacion>>(`/reglas/${id}`)
  return res.data.data
}

export async function crear(data: CrearReglaData) {
  const res = await apiClient.post<ApiResponse<ReglaCategorizacion>>('/reglas', data)
  return res.data.data
}

export async function actualizar(id: string, data: ActualizarReglaData) {
  const res = await apiClient.patch<ApiResponse<ReglaCategorizacion>>(`/reglas/${id}`, data)
  return res.data.data
}

export async function eliminar(id: string) {
  await apiClient.delete(`/reglas/${id}`)
}

export async function aplicar() {
  const res = await apiClient.post<ApiResponse<unknown>>('/reglas/aplicar')
  return res.data
}

export async function sugerir(descripcion: string) {
  const res = await apiClient.post<ApiResponse<unknown>>('/reglas/sugerir', { descripcion })
  return res.data.data
}
