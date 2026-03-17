import { apiClient } from './client'
import type { ApiResponse, PaginatedResponse, Cuenta } from '@/types'

export interface CrearCuentaData {
  nombre: string
  tipo: string
  moneda?: string
  balanceInicial?: number
  institucionId?: string
  color?: string
  icono?: string
  notas?: string
}

export interface ActualizarCuentaData {
  nombre?: string
  moneda?: string
  institucionId?: string | null
  color?: string
  icono?: string
  notas?: string | null
}

export interface ListaCuentasParams {
  page?: number
  limit?: number
  estado?: string
  tipo?: string
  clasificacion?: string
  ordenarPor?: 'nombre' | 'balance' | 'creadoEl'
  orden?: 'asc' | 'desc'
}

export interface ResumenCuentasData {
  moneda: string
  tipoDolar: string
  totalActivos: number
  totalPasivos: number
  patrimonioNeto: number
  cantidadCuentas: number
  origenes: Record<string, number>
  tasasUsadas: Record<string, number>
  sinConvertir?: Record<string, { activos: number; pasivos: number }>
}

export async function listar(params?: ListaCuentasParams) {
  const res = await apiClient.get<PaginatedResponse<Cuenta>>('/cuentas', { params })
  return res.data
}

export async function obtener(id: string) {
  const res = await apiClient.get<ApiResponse<Cuenta>>(`/cuentas/${id}`)
  return res.data.data
}

export async function crear(data: CrearCuentaData) {
  const res = await apiClient.post<ApiResponse<Cuenta>>('/cuentas', data)
  return res.data.data
}

export async function actualizar(id: string, data: ActualizarCuentaData) {
  const res = await apiClient.patch<ApiResponse<Cuenta>>(`/cuentas/${id}`, data)
  return res.data.data
}


export async function eliminar(id: string) {
  await apiClient.delete(`/cuentas/${id}`)
}

export async function obtenerResumen(moneda?: string, tipoDolar?: string, soloMoneda?: boolean) {
  const res = await apiClient.get<ApiResponse<ResumenCuentasData>>('/cuentas/resumen', {
    params: { moneda, tipoDolar, soloMoneda },
  })
  return res.data.data
}
