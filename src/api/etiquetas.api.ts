import { apiClient } from './client'
import type { ApiResponse, Etiqueta } from '@/types'

export interface CrearEtiquetaData {
  nombre: string
  color?: string
}

export interface ActualizarEtiquetaData {
  nombre?: string
  color?: string
}

export async function listar() {
  const res = await apiClient.get<ApiResponse<Etiqueta[]>>('/etiquetas')
  return res.data.data
}

export async function crear(data: CrearEtiquetaData) {
  const res = await apiClient.post<ApiResponse<Etiqueta>>('/etiquetas', data)
  return res.data.data
}

export async function actualizar(id: string, data: ActualizarEtiquetaData) {
  const res = await apiClient.patch<ApiResponse<Etiqueta>>(`/etiquetas/${id}`, data)
  return res.data.data
}

export async function eliminar(id: string) {
  await apiClient.delete(`/etiquetas/${id}`)
}
