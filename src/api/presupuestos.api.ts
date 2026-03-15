import { apiClient } from './client'
import type { ApiResponse, PaginatedResponse, Presupuesto } from '@/types'

export interface CrearPresupuestoData {
  fechaInicio: string
  fechaFin: string
  gastoPresupuestado?: number
  ingresoEsperado?: number
  moneda: string
  categorias?: Array<{ categoriaId: string; montoPresupuestado: number }>
}

export interface ActualizarPresupuestoData {
  gastoPresupuestado?: number
  ingresoEsperado?: number
  moneda?: string
}

export interface ListaPresupuestosParams {
  page?: number
  limit?: number
  anio?: number
  mes?: number
}

export interface ProgresoCategoria {
  id: string
  categoria: { id: string; nombre: string; color: string; icono: string; clasificacion: string }
  montoPresupuestado: number
  gastoReal: number
  restante: number
  porcentaje: number
  excedido: boolean
}

export interface ProgresoData {
  presupuesto: { id: string; fechaInicio: string; fechaFin: string; moneda: string }
  resumen: {
    gastoPresupuestado: number
    presupuestoAsignado: number
    disponibleAsignar: number
    porcentajeAsignado: number
    gastoReal: number
    gastoRestante: number
    gastoPorcentaje: number
    ingresoEsperado: number
    ingresoReal: number
    ahorroReal: number
  }
  categorias: ProgresoCategoria[]
}

export async function listar(params?: ListaPresupuestosParams) {
  const res = await apiClient.get<PaginatedResponse<Presupuesto>>('/presupuestos', { params })
  return res.data
}

export async function obtener(id: string) {
  const res = await apiClient.get<ApiResponse<Presupuesto>>(`/presupuestos/${id}`)
  return res.data.data
}

export async function obtenerActual() {
  const res = await apiClient.get<ApiResponse<Presupuesto>>('/presupuestos/actual')
  return res.data.data
}

export async function crear(data: CrearPresupuestoData) {
  const res = await apiClient.post<ApiResponse<Presupuesto>>('/presupuestos', data)
  return res.data.data
}

export async function actualizar(id: string, data: ActualizarPresupuestoData) {
  const res = await apiClient.patch<ApiResponse<Presupuesto>>(`/presupuestos/${id}`, data)
  return res.data.data
}

export async function obtenerProgreso(id: string) {
  const res = await apiClient.get<ApiResponse<ProgresoData>>(`/presupuestos/${id}/progreso`)
  return res.data.data
}

export async function asignarCategoria(id: string, categoriaId: string, montoPresupuestado: number) {
  const res = await apiClient.post<ApiResponse<unknown>>(`/presupuestos/${id}/categorias`, {
    categoriaId,
    montoPresupuestado,
  })
  return res.data.data
}

export async function eliminarCategoria(id: string, categoriaId: string) {
  await apiClient.delete(`/presupuestos/${id}/categorias/${categoriaId}`)
}

export async function copiar(id: string, fechaInicio: string, fechaFin: string) {
  const res = await apiClient.post<ApiResponse<Presupuesto>>(`/presupuestos/${id}/copiar`, {
    fechaInicio,
    fechaFin,
  })
  return res.data.data
}

export async function eliminar(id: string) {
  await apiClient.delete(`/presupuestos/${id}`)
}
