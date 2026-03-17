import type { TipoCuenta, ClasificacionCategoria, FrecuenciaRecurrencia } from '@/types'

export const TIPOS_CUENTA: Record<TipoCuenta, { label: string; icono: string }> = {
  EFECTIVO: { label: 'Efectivo', icono: 'banknote' },
  BANCO_CORRIENTE: { label: 'Cuenta corriente', icono: 'landmark' },
  BANCO_AHORRO: { label: 'Caja de ahorro', icono: 'piggy-bank' },
  BILLETERA_VIRTUAL: { label: 'Billetera virtual', icono: 'smartphone' },
  TARJETA_CREDITO: { label: 'Tarjeta de crédito', icono: 'credit-card' },
  INVERSION: { label: 'Inversión', icono: 'trending-up' },
  PRESTAMO: { label: 'Préstamo', icono: 'hand-coins' },
  OTRO_ACTIVO: { label: 'Otro activo', icono: 'plus-circle' },
  OTRO_PASIVO: { label: 'Otro pasivo', icono: 'minus-circle' },
}

// Tipos visibles en el form de crear cuenta (excluye OTRO_*)
export const TIPOS_CUENTA_FORM: TipoCuenta[] = [
  'EFECTIVO', 'BANCO_CORRIENTE', 'BANCO_AHORRO', 'BILLETERA_VIRTUAL',
  'TARJETA_CREDITO', 'INVERSION', 'PRESTAMO',
]

export const CLASIFICACION_LABELS: Record<ClasificacionCategoria, string> = {
  INGRESO: 'Ingreso',
  GASTO: 'Gasto',
}

export const FRECUENCIA_LABELS: Record<FrecuenciaRecurrencia, string> = {
  DIARIA: 'Diaria',
  SEMANAL: 'Semanal',
  QUINCENAL: 'Quincenal',
  MENSUAL: 'Mensual',
  BIMESTRAL: 'Bimestral',
  TRIMESTRAL: 'Trimestral',
  SEMESTRAL: 'Semestral',
  ANUAL: 'Anual',
}

export const COLORES_CATEGORIAS = [
  '#6172F3', '#F04438', '#12B76A', '#F79009',
  '#7A5AF8', '#2E90FA', '#EE46BC', '#667085',
  '#15B79E', '#FF6C40', '#6938EF', '#36BFFA',
]

export const MONEDAS = ['ARS', 'USD'] as const
