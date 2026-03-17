// ─── Enums ──────────────────────────────────────────────

export type TipoCuenta =
  | 'EFECTIVO' | 'BANCO_CORRIENTE' | 'BANCO_AHORRO' | 'BILLETERA_VIRTUAL'
  | 'TARJETA_CREDITO' | 'INVERSION' | 'PRESTAMO'
  | 'OTRO_ACTIVO' | 'OTRO_PASIVO'

export type TipoInstitucion = 'BANCO' | 'BILLETERA_VIRTUAL' | 'OTRA'

export type ClasificacionCuenta = 'ACTIVO' | 'PASIVO'
export type EstadoCuenta = 'ACTIVA' | 'INACTIVA'
export type ClasificacionCategoria = 'INGRESO' | 'GASTO'
export type TipoTransaccion = 'INGRESO' | 'GASTO' | 'TRANSFERENCIA'
export type Rol = 'USUARIO' | 'ADMIN'

export type FrecuenciaRecurrencia =
  | 'DIARIA' | 'SEMANAL' | 'QUINCENAL' | 'MENSUAL'
  | 'BIMESTRAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL'

// ─── Modelos ────────────────────────────────────────────

export interface Usuario {
  id: string
  email: string
  nombre: string
  rol: Rol
  moneda: string
  creadoEl: string
}

export interface Institucion {
  id: string
  nombre: string
  tipo: TipoInstitucion
  color: string
  icono: string
  oficial: boolean
}

export interface Cuenta {
  id: string
  nombre: string
  tipo: TipoCuenta
  clasificacion: ClasificacionCuenta
  moneda: string
  balance: number
  estado: EstadoCuenta
  institucion: Institucion | null
  color: string
  icono: string
  notas: string | null
  creadoEl: string
}

export interface Categoria {
  id: string
  nombre: string
  color: string
  icono: string
  clasificacion: ClasificacionCategoria
  padreId: string | null
  subcategorias?: Categoria[]
}

export interface Etiqueta {
  id: string
  nombre: string
  color: string
}

export interface Transaccion {
  id: string
  tipo: TipoTransaccion
  monto: number
  moneda: string
  tasaCambio: number | null
  fecha: string
  descripcion: string
  notas: string | null
  excluida: boolean
  montoOriginal: number | null
  monedaOriginal: string | null
  creadoEl: string
  actualizadoEl: string
  cuenta: { id: string; nombre: string; tipo: TipoCuenta }
  categoria: { id: string; nombre: string; color: string; icono: string } | null
  etiquetas: Etiqueta[]
}

export interface Transferencia {
  id: string
  transaccionOrigen: Transaccion
  transaccionDestino: Transaccion
  cuentaOrigen: { id: string; nombre: string }
  cuentaDestino: { id: string; nombre: string }
  creadoEl: string
}

export interface Presupuesto {
  id: string
  fechaInicio: string
  fechaFin: string
  gastoPresupuestado: number | null
  ingresoEsperado: number | null
  moneda: string
  categorias: PresupuestoCategoria[]
  creadoEl: string
}

export interface PresupuestoCategoria {
  id: string
  categoriaId: string
  categoria?: { id: string; nombre: string; color: string; icono: string }
  montoPresupuestado: number
}

export interface TransaccionRecurrente {
  id: string
  cuentaId: string
  categoriaId: string | null
  tipo: TipoTransaccion
  monto: number
  moneda: string
  descripcion: string
  frecuencia: FrecuenciaRecurrencia
  diaDelMes: number | null
  diaDeLaSemana: number | null
  proximaFecha: string
  activa: boolean
  creadoEl: string
}

export interface ReglaCategorizacion {
  id: string
  nombre: string
  patron: string
  prioridad: number
  activa: boolean
  creadoEl: string
  categoria: { id: string; nombre: string; color: string; icono: string; clasificacion: ClasificacionCategoria }
}

export interface TasaCambio {
  tipo: string
  monedaOrigen: string
  monedaDestino: string
  tasa: number
  fecha: string
}

// ─── Respuestas API ─────────────────────────────────────

export interface ApiResponse<T> {
  status: 'ok' | 'error'
  data: T
  message?: string
}

export interface PaginatedMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  status: 'ok'
  data: T[]
  meta: PaginatedMeta
}

// ─── Reportes ───────────────────────────────────────────

