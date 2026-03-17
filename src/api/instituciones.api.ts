import { apiClient } from './client'
import type { ApiResponse, Institucion, TipoInstitucion } from '@/types'

export interface CrearInstitucionData {
  nombre: string
  tipo?: TipoInstitucion
  color?: string
  icono?: string
}

export interface ActualizarInstitucionData {
  nombre?: string
  tipo?: TipoInstitucion
  color?: string
  icono?: string
}

export interface ListarInstitucionesParams {
  tipo?: TipoInstitucion
  search?: string
}

export async function listar(params?: ListarInstitucionesParams): Promise<Institucion[]> {
  const res = await apiClient.get<ApiResponse<Institucion[]>>('/instituciones', { params })
  return res.data.data
}

export async function crear(data: CrearInstitucionData): Promise<Institucion> {
  const res = await apiClient.post<ApiResponse<Institucion>>('/instituciones', data)
  return res.data.data
}

export async function actualizar(id: string, data: ActualizarInstitucionData): Promise<Institucion> {
  const res = await apiClient.patch<ApiResponse<Institucion>>(`/instituciones/${id}`, data)
  return res.data.data
}

export async function eliminar(id: string): Promise<void> {
  await apiClient.delete(`/instituciones/${id}`)
}
