import { useQuery } from '@tanstack/react-query'
import * as api from '@/api/reportes.api'
import * as monedasApi from '@/api/monedas.api'

export function useResumenMensual(anio: number, mes: number, moneda?: string, tipoDolar?: string, soloMoneda?: boolean) {
  return useQuery({
    queryKey: ['reportes', 'resumen-mensual', anio, mes, moneda, tipoDolar, soloMoneda],
    queryFn: () => api.resumenMensual(anio, mes, moneda, tipoDolar, soloMoneda),
  })
}

export function useGastosPorCategoria(desde?: string, hasta?: string) {
  return useQuery({
    queryKey: ['reportes', 'gastos-por-categoria', desde, hasta],
    queryFn: () => api.gastosPorCategoria(desde, hasta),
  })
}

export function useIngresosPorCategoria(desde?: string, hasta?: string) {
  return useQuery({
    queryKey: ['reportes', 'ingresos-por-categoria', desde, hasta],
    queryFn: () => api.ingresosPorCategoria(desde, hasta),
  })
}

export function useTendenciaMensual(meses: number = 12) {
  return useQuery({
    queryKey: ['reportes', 'tendencia-mensual', meses],
    queryFn: () => api.tendenciaMensual(meses),
  })
}

export function useFlujoDeCaja(desde?: string, hasta?: string, agrupacion?: string) {
  return useQuery({
    queryKey: ['reportes', 'flujo-de-caja', desde, hasta, agrupacion],
    queryFn: () => api.flujoDeCaja(desde, hasta, agrupacion),
  })
}

export function useTopGastos(desde?: string, hasta?: string, limit?: number) {
  return useQuery({
    queryKey: ['reportes', 'top-gastos', desde, hasta, limit],
    queryFn: () => api.topGastos(desde, hasta, limit),
  })
}

export function useTasasDolar(enabled = true) {
  return useQuery({
    queryKey: ['monedas', 'tasas'],
    queryFn: monedasApi.obtenerTasas,
    staleTime: 10 * 60 * 1000, // 10 min
    enabled,
  })
}
