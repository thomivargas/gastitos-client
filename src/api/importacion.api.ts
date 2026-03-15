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

/** Descarga el archivo de exportación con autenticación */
export async function exportar(params?: { cuentaId?: string; fechaDesde?: string; fechaHasta?: string }) {
  const query = new URLSearchParams()
  if (params?.cuentaId) query.set('cuentaId', params.cuentaId)
  if (params?.fechaDesde) query.set('fechaDesde', params.fechaDesde)
  if (params?.fechaHasta) query.set('fechaHasta', params.fechaHasta)

  const res = await apiClient.get(`/importacion/exportar?${query.toString()}`, {
    responseType: 'blob',
  })

  descargarBlob(res.data, 'gastitos-export.csv')
}

/** Descarga la plantilla con autenticación */
export async function descargarPlantilla() {
  const res = await apiClient.get('/importacion/plantilla', {
    responseType: 'blob',
  })

  descargarBlob(res.data, 'gastitos-plantilla.csv')
}

function descargarBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
