import { apiClient } from './client'
import type { ApiResponse, TasaCambio } from '@/types'

export interface ConversionData {
  de: string
  a: string
  tipo: string
  montoOriginal: number
  montoConvertido: number
  tasa: number
}

export async function obtenerTasas() {
  const res = await apiClient.get<ApiResponse<TasaCambio[]>>('/monedas/tasas')
  return res.data.data
}

export async function convertir(de: string, a: string, monto: number, tipo?: string) {
  const res = await apiClient.get<ApiResponse<ConversionData>>('/monedas/convertir', {
    params: { de, a, monto, tipo },
  })
  return res.data.data
}
