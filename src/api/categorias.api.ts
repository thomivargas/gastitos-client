import { apiClient } from './client'
import type { ApiResponse, Categoria, ClasificacionCategoria } from '@/types'

export interface CrearCategoriaData {
  nombre: string
  clasificacion: ClasificacionCategoria
  color?: string
  icono?: string
  padreId?: string
}

export interface ActualizarCategoriaData {
  nombre?: string
  color?: string
  icono?: string
}

export async function listar(clasificacion?: ClasificacionCategoria) {
  const params = clasificacion ? { clasificacion } : undefined
  const res = await apiClient.get<ApiResponse<Categoria[]>>('/categorias', { params })
  return res.data.data
}

export async function obtener(id: string) {
  const res = await apiClient.get<ApiResponse<Categoria>>(`/categorias/${id}`)
  return res.data.data
}

export async function crear(data: CrearCategoriaData) {
  const res = await apiClient.post<ApiResponse<Categoria>>('/categorias', data)
  return res.data.data
}

export async function actualizar(id: string, data: ActualizarCategoriaData) {
  const res = await apiClient.patch<ApiResponse<Categoria>>(`/categorias/${id}`, data)
  return res.data.data
}

export async function eliminar(id: string) {
  await apiClient.delete(`/categorias/${id}`)
}
