import { apiClient } from './client'
import type { ApiResponse, TransaccionRecurrente } from '@/types'

export interface CrearRecurrenteData {
  cuentaId: string
  tipo: 'INGRESO' | 'GASTO'
  monto: number
  moneda?: string
  descripcion: string
  frecuencia: string
  categoriaId?: string
  diaDelMes?: number
  diaDeLaSemana?: number
  proximaFecha: string
  activa?: boolean
}

export interface ActualizarRecurrenteData {
  cuentaId?: string
  tipo?: 'INGRESO' | 'GASTO'
  monto?: number
  moneda?: string
  descripcion?: string
  frecuencia?: string
  categoriaId?: string | null
  diaDelMes?: number | null
  diaDeLaSemana?: number | null
  proximaFecha?: string
  activa?: boolean
}

export async function listar() {
  const res = await apiClient.get<ApiResponse<TransaccionRecurrente[]>>('/recurrentes')
  return res.data.data
}

export async function obtener(id: string) {
  const res = await apiClient.get<ApiResponse<TransaccionRecurrente>>(`/recurrentes/${id}`)
  return res.data.data
}

export async function crear(data: CrearRecurrenteData) {
  const res = await apiClient.post<ApiResponse<TransaccionRecurrente>>('/recurrentes', data)
  return res.data.data
}

export async function actualizar(id: string, data: ActualizarRecurrenteData) {
  const res = await apiClient.patch<ApiResponse<TransaccionRecurrente>>(`/recurrentes/${id}`, data)
  return res.data.data
}

export async function activar(id: string) {
  const res = await apiClient.patch<ApiResponse<TransaccionRecurrente>>(`/recurrentes/${id}/activar`)
  return res.data.data
}

export async function desactivar(id: string) {
  const res = await apiClient.patch<ApiResponse<TransaccionRecurrente>>(`/recurrentes/${id}/desactivar`)
  return res.data.data
}

export async function eliminar(id: string) {
  await apiClient.delete(`/recurrentes/${id}`)
}

export async function generar() {
  const res = await apiClient.post<ApiResponse<unknown>>('/recurrentes/generar')
  return res.data
}
