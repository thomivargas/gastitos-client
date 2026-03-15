import { apiClient } from './client'
import type { ApiResponse, PaginatedResponse } from '@/types'

export interface TransferenciaDetalle {
  id: string
  creadoEl: string
  cuentaOrigen: { id: string; nombre: string; moneda: string }
  cuentaDestino: { id: string; nombre: string; moneda: string }
  transaccionOrigen: { id: string; monto: number; moneda: string; fecha: string; descripcion: string }
  transaccionDestino: { id: string; monto: number; moneda: string; fecha: string; descripcion: string }
}

export interface CrearTransferenciaData {
  cuentaOrigenId: string
  cuentaDestinoId: string
  monto: number
  montoDestino?: number
  fecha: string
  descripcion?: string
  notas?: string
}

export interface ListaTransferenciasParams {
  page?: number
  limit?: number
  cuentaId?: string
  fechaDesde?: string
  fechaHasta?: string
  ordenarPor?: 'fecha' | 'monto' | 'creadoEl'
  orden?: 'asc' | 'desc'
}

export async function listar(params?: ListaTransferenciasParams) {
  const res = await apiClient.get<PaginatedResponse<TransferenciaDetalle>>('/transferencias', { params })
  return res.data
}

export async function obtener(id: string) {
  const res = await apiClient.get<ApiResponse<TransferenciaDetalle>>(`/transferencias/${id}`)
  return res.data.data
}

export async function crear(data: CrearTransferenciaData) {
  const res = await apiClient.post<ApiResponse<TransferenciaDetalle>>('/transferencias', data)
  return res.data.data
}

export async function eliminar(id: string) {
  await apiClient.delete(`/transferencias/${id}`)
}
