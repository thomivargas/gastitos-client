import { apiClient } from './client'
import type { ApiResponse, PaginatedResponse, Transaccion } from '@/types'

export interface CrearTransaccionData {
  cuentaId: string
  tipo: 'INGRESO' | 'GASTO'
  monto: number
  fecha: string
  descripcion: string
  moneda?: string
  categoriaId?: string
  notas?: string
  etiquetaIds?: string[]
  excluida?: boolean
  montoOriginal?: number
  monedaOriginal?: string
}

export interface ActualizarTransaccionData {
  tipo?: 'INGRESO' | 'GASTO'
  monto?: number
  moneda?: string
  fecha?: string
  descripcion?: string
  categoriaId?: string | null
  notas?: string | null
  etiquetaIds?: string[]
  excluida?: boolean
  montoOriginal?: number
  monedaOriginal?: string
}

export interface ListaTransaccionesParams {
  page?: number
  limit?: number
  cuentaId?: string
  categoriaId?: string
  tipo?: string
  fechaDesde?: string
  fechaHasta?: string
  montoMin?: number
  montoMax?: number
  busqueda?: string
  etiquetaIds?: string[]
  excluida?: boolean
  ordenarPor?: 'fecha' | 'monto' | 'descripcion' | 'creadoEl'
  orden?: 'asc' | 'desc'
}

export async function listar(params?: ListaTransaccionesParams) {
  const res = await apiClient.get<PaginatedResponse<Transaccion>>('/transacciones', { params })
  return res.data
}

export async function obtener(id: string) {
  const res = await apiClient.get<ApiResponse<Transaccion>>(`/transacciones/${id}`)
  return res.data.data
}

export async function crear(data: CrearTransaccionData) {
  const res = await apiClient.post<ApiResponse<Transaccion>>('/transacciones', data)
  return res.data.data
}

export async function actualizar(id: string, data: ActualizarTransaccionData) {
  const res = await apiClient.patch<ApiResponse<Transaccion>>(`/transacciones/${id}`, data)
  return res.data.data
}

export async function eliminar(id: string) {
  await apiClient.delete(`/transacciones/${id}`)
}
