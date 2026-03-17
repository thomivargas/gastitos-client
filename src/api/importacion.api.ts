import { apiClient } from './client'
import type { ApiResponse } from '@/types'

export interface MapeoColumnas {
  fecha: string
  monto: string
  descripcion: string
  tipo?: string
  categoria?: string
  notas?: string
}

export interface ConfigImport {
  cuentaId: string
  mapeo: MapeoColumnas
  formatoFecha?: string
  separadorDecimal?: string
  aplicarReglas?: boolean
}

export interface PreviewData {
  columnas: string[]
  filas: Record<string, string>[]
  totalFilas: number
}

export async function preview(archivo: File) {
  const formData = new FormData()
  formData.append('archivo', archivo)
  const res = await apiClient.post<ApiResponse<PreviewData>>('/importacion/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data
}

export async function ejecutar(archivo: File, config: ConfigImport) {
  const formData = new FormData()
  formData.append('archivo', archivo)
  formData.append('config', JSON.stringify(config))
  const res = await apiClient.post<ApiResponse<unknown>>('/importacion/ejecutar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

// ── Bancario ──────────────────────────────────────────────────────────────

export interface ParserInfo {
  id: string
  nombre: string
  banco: string
  tipoArchivo: string[]
}

export interface TransaccionParseada {
  fecha: string // ISO string desde servidor
  monto: number
  tipo: 'INGRESO' | 'GASTO'
  descripcion: string
  notas: string | null
  moneda: string
  excluida: boolean
}

export interface PreviewBancarioData {
  transacciones: TransaccionParseada[]
  metadatos: {
    banco: string
    periodo?: string
    totalFilas: number
    filasExcluidas: number
  }
  totalTransacciones: number
}

export interface ConfigImportBancario {
  parserId: string
  cuentaId: string
  tipoCambioUsd?: 'tarjeta' | 'blue' | 'mep' | 'oficial'
  aplicarReglas?: boolean
  excluirCargosBancarios?: boolean
  fechaResumen?: string // YYYY-MM-DD, primer día del período del resumen
}

export interface ResultadoBancario {
  importadas: number
  excluidas: number
  convertidas: number
  errores: { fila: number; error: string }[]
  totalFilas: number
  periodo?: string
}

export async function listarParsers() {
  const res = await apiClient.get<ApiResponse<ParserInfo[]>>('/importacion/parsers')
  return res.data.data
}

export async function previewBancario(archivo: File, parserId: string) {
  const formData = new FormData()
  formData.append('archivo', archivo)
  formData.append('config', JSON.stringify({ parserId }))
  const res = await apiClient.post<ApiResponse<PreviewBancarioData>>('/importacion/preview-bancario', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data
}

export async function ejecutarBancario(archivo: File, config: ConfigImportBancario) {
  const formData = new FormData()
  formData.append('archivo', archivo)
  formData.append('config', JSON.stringify(config))
  const res = await apiClient.post<ApiResponse<ResultadoBancario>>('/importacion/ejecutar-bancario', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

