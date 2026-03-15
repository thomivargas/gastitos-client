import { apiClient } from './client'
import type { ApiResponse } from '@/types'

// ─── Tipos de respuesta ────────────────────────────────

export interface ResumenMensualData {
  moneda: string
  tipoDolar: string
  periodo: { anio: number; mes: number; desde: string; hasta: string }
  ingresos: { total: number; cantidad: number; origenes: Record<string, number> }
  gastos: { total: number; cantidad: number; origenes: Record<string, number> }
  ahorroNeto: number
  tasaAhorro: number
  tasasUsadas: Record<string, number>
}

export interface CategoriaReporte {
  categoria: { id: string; nombre: string; color: string; icono: string } | null
  monto: number
  cantidad: number
  porcentaje: number
}

export interface GastosPorCategoriaData {
  periodo: { desde: string; hasta: string }
  total: number
  categorias: CategoriaReporte[]
}

export interface TendenciaMensualItem {
  anio: number
  mes: number
  ingresos: number
  gastos: number
  ahorro: number
}

export interface FlujoDeCajaData {
  periodo: { desde: string; hasta: string; agrupacion: string }
  flujo: Array<{ periodo: string; ingresos: number; gastos: number; neto: number }>
}

export interface TopGastoItem {
  id: string
  monto: number
  moneda: string
  fecha: string
  descripcion: string
  categoria: { id: string; nombre: string; color: string; icono: string } | null
  cuenta: { id: string; nombre: string }
}

export interface TopGastosData {
  periodo: { desde: string; hasta: string }
  transacciones: TopGastoItem[]
}

// ─── API calls ─────────────────────────────────────────

export async function resumenMensual(anio: number, mes: number, moneda?: string, tipoDolar?: string, soloMoneda?: boolean) {
  const res = await apiClient.get<ApiResponse<ResumenMensualData>>('/reportes/resumen-mensual', {
    params: { anio, mes, moneda, tipoDolar, soloMoneda },
  })
  return res.data.data
}

export async function gastosPorCategoria(desde?: string, hasta?: string) {
  const res = await apiClient.get<ApiResponse<GastosPorCategoriaData>>('/reportes/gastos-por-categoria', {
    params: { desde, hasta },
  })
  return res.data.data
}

export async function ingresosPorCategoria(desde?: string, hasta?: string) {
  const res = await apiClient.get<ApiResponse<GastosPorCategoriaData>>('/reportes/ingresos-por-categoria', {
    params: { desde, hasta },
  })
  return res.data.data
}

export async function tendenciaMensual(meses: number = 12) {
  const res = await apiClient.get<ApiResponse<TendenciaMensualItem[]>>('/reportes/tendencia-mensual', {
    params: { meses },
  })
  return res.data.data
}

export async function flujoDeCaja(desde?: string, hasta?: string, agrupacion?: string) {
  const res = await apiClient.get<ApiResponse<FlujoDeCajaData>>('/reportes/flujo-de-caja', {
    params: { desde, hasta, agrupacion },
  })
  return res.data.data
}

export async function topGastos(desde?: string, hasta?: string, limit: number = 10) {
  const res = await apiClient.get<ApiResponse<TopGastosData>>('/reportes/top-gastos', {
    params: { desde, hasta, limit },
  })
  return res.data.data
}
