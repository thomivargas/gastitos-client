import { format, parseISO, isValid } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Formatea un monto como moneda.
 * formatMonto(1500.5, 'ARS')  → "$ 1.501"
 * formatMonto(150.75, 'USD')  → "US$ 150,75"
 */
export function formatMonto(monto: number, moneda: string = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: moneda === 'ARS' ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(monto)
}

/**
 * Formatea una fecha ISO a formato legible.
 * formatFecha('2025-03-15') → "15 mar 2025"
 */
export function formatFecha(fecha: string, formato: string = 'dd MMM yyyy'): string {
  const parsed = parseISO(fecha)
  if (!isValid(parsed)) return fecha
  return format(parsed, formato, { locale: es })
}

/**
 * Formatea fecha relativa corta: "15/03"
 */
export function formatFechaCorta(fecha: string): string {
  return formatFecha(fecha, 'dd/MM')
}

/**
 * Formatea un porcentaje: 0.642 → "64%"
 */
export function formatPorcentaje(valor: number): string {
  return `${Math.round(valor * 100)}%`
}
