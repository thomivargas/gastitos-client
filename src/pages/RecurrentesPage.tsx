import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form'
import { z } from 'zod'
import {
  Plus, Play, Pause, Trash2, Repeat, Pencil,
  CalendarClock, Wallet, TrendingDown, TrendingUp, Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MoneyInput } from '@/components/ui/money-input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { CategoriaSelect } from '@/components/CategoriaSelect'
import { EmptyState } from '@/components/EmptyState'
import {
  useRecurrentes,
  useCrearRecurrente,
  useActualizarRecurrente,
  useActivarRecurrente,
  useDesactivarRecurrente,
  useEliminarRecurrente,
} from '@/hooks/use-recurrentes'
import { useCuentas } from '@/hooks/use-cuentas'
import { useCategorias } from '@/hooks/use-categorias'
import { formatMonto, formatFecha } from '@/lib/formatters'
import { FRECUENCIA_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { TransaccionRecurrente, FrecuenciaRecurrencia, Categoria } from '@/types'

// Factores para normalizar a mensual (aproximado)
const FACTOR_MENSUAL: Record<FrecuenciaRecurrencia, number> = {
  DIARIA: 30,
  SEMANAL: 4.33,
  QUINCENAL: 2,
  MENSUAL: 1,
  BIMESTRAL: 0.5,
  TRIMESTRAL: 0.33,
  SEMESTRAL: 0.17,
  ANUAL: 0.083,
}

export default function RecurrentesPage() {
  const { data: recurrentes, isLoading } = useRecurrentes()
  const activar = useActivarRecurrente()
  const desactivar = useDesactivarRecurrente()
  const eliminar = useEliminarRecurrente()
  const [formOpen, setFormOpen] = useState(false)
  const [editRecurrente, setEditRecurrente] = useState<TransaccionRecurrente | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const { data: cuentasData } = useCuentas({ estado: 'ACTIVA', limit: 50 })
  const cuentas = cuentasData?.data || []
  const { data: categoriasGasto = [] } = useCategorias('GASTO')
  const { data: categoriasIngreso = [] } = useCategorias('INGRESO')

  const todasCategorias = useMemo(() => {
    const flat: Categoria[] = []
    for (const c of [...categoriasGasto, ...categoriasIngreso]) {
      flat.push(c)
      if (c.subcategorias) flat.push(...c.subcategorias)
    }
    return flat
  }, [categoriasGasto, categoriasIngreso])

  const stats = useMemo(() => {
    if (!recurrentes) return { activas: 0, pausadas: 0, compromisoMensual: 0 }
    const activas = recurrentes.filter((r) => r.activa).length
    const pausadas = recurrentes.length - activas
    const compromisoMensual = recurrentes
      .filter((r) => r.activa && r.tipo === 'GASTO')
      .reduce((sum, r) => sum + Number(r.monto) * (FACTOR_MENSUAL[r.frecuencia as FrecuenciaRecurrencia] ?? 1), 0)
    return { activas, pausadas, compromisoMensual }
  }, [recurrentes])

  function handleEditar(r: TransaccionRecurrente) {
    setEditRecurrente(r)
    setFormOpen(true)
  }

  function handleFormClose(open: boolean) {
    setFormOpen(open)
    if (!open) setEditRecurrente(null)
  }

  return (
    <div className="space-y-6 page-transition">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Gastos Recurrentes</h1>
          <p className="text-sm text-muted-foreground max-w-md">
            Automatiza tus pagos fijos y suscripciones. El sistema los registra automaticamente segun la frecuencia configurada.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="shrink-0 self-start">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Nueva recurrente</span>
        </Button>
      </div>

      {/* ── Stats ────────────────────────────────────────────── */}
      {!isLoading && !!recurrentes?.length && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Activity className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground truncate">Activas</p>
              <p className="text-lg font-semibold tabular-nums leading-tight">{stats.activas}</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Pause className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground truncate">Pausadas</p>
              <p className="text-lg font-semibold tabular-nums leading-tight">{stats.pausadas}</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground truncate">Compromiso/mes</p>
              <p className="text-base font-semibold tabular-nums leading-tight text-red-500">
                {formatMonto(stats.compromisoMensual, 'ARS')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Lista ────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="rounded-xl border bg-card divide-y">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4">
              <div className="w-8 h-8 rounded-lg shimmer shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-36 rounded shimmer" />
                <div className="h-3 w-52 rounded shimmer" />
              </div>
              <div className="h-4 w-20 rounded shimmer" />
            </div>
          ))}
        </div>
      ) : !recurrentes?.length ? (
        <EmptyState
          icono={Repeat}
          titulo="Sin recurrentes"
          descripcion="Automatiza tus transacciones que se repiten periodicamente"
          accion={{ label: 'Crear recurrente', onClick: () => setFormOpen(true) }}
        />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          {/* Encabezado de columnas */}
          <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2.5 border-b bg-muted/30">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Descripcion</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider w-24 text-center">Frecuencia</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider w-28 text-right">Monto</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider w-20 text-right">Acciones</span>
          </div>

          <div className="divide-y">
            {recurrentes.map((r, i) => {
              const cuenta = cuentas.find((c) => c.id === r.cuentaId)
              const categoria = todasCategorias.find((c) => c.id === r.categoriaId)
              return (
                <RecurrenteRow
                  key={r.id}
                  recurrente={r}
                  cuenta={cuenta?.nombre}
                  categoria={categoria}
                  index={i}
                  onActivar={() => activar.mutate(r.id)}
                  onDesactivar={() => desactivar.mutate(r.id)}
                  onEliminar={() => setConfirmId(r.id)}
                  onEditar={() => handleEditar(r)}
                />
              )
            })}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(open) => { if (!open) setConfirmId(null) }}
        onConfirm={() => { if (confirmId) eliminar.mutate(confirmId); setConfirmId(null) }}
        titulo="Eliminar recurrente"
        descripcion="Se eliminara esta transaccion recurrente. No afecta transacciones ya creadas."
      />
      <RecurrenteFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        recurrente={editRecurrente}
      />
    </div>
  )
}

// ── Row ───────────────────────────────────────────────────────

function RecurrenteRow({
  recurrente: r,
  cuenta,
  categoria,
  index,
  onActivar,
  onDesactivar,
  onEliminar,
  onEditar,
}: {
  recurrente: TransaccionRecurrente
  cuenta?: string
  categoria?: Categoria
  index: number
  onActivar: () => void
  onDesactivar: () => void
  onEliminar: () => void
  onEditar: () => void
}) {
  const isIngreso = r.tipo === 'INGRESO'

  return (
    <div
      className={cn(
        'group grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-x-4 gap-y-1 px-4 py-3.5 transition-colors hover:bg-muted/30',
        !r.activa && 'opacity-60',
      )}
      style={{ animationDelay: `${index * 35}ms` }}
    >
      {/* Descripción + metadatos */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Indicador tipo */}
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
          isIngreso ? 'bg-emerald-500/10' : 'bg-red-500/10',
        )}>
          {isIngreso
            ? <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            : <TrendingDown className="h-3.5 w-3.5 text-red-500" />
          }
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium truncate">{r.descripcion}</span>
            {!r.activa && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 shrink-0">Pausada</Badge>
            )}
          </div>
          <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
            {cuenta && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Wallet className="h-2.5 w-2.5 shrink-0" />
                {cuenta}
              </span>
            )}
            {categoria && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: categoria.color }}
                />
                {categoria.nombre}
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <CalendarClock className="h-2.5 w-2.5 shrink-0" />
              Próx: {formatFecha(r.proximaFecha)}
            </span>
          </div>
        </div>
      </div>

      {/* Frecuencia — solo desktop */}
      <div className="hidden sm:flex items-center justify-center w-24">
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          {FRECUENCIA_LABELS[r.frecuencia as FrecuenciaRecurrencia] || r.frecuencia}
        </span>
      </div>

      {/* Monto */}
      <div className="flex items-center justify-end w-28 self-center">
        <span className={cn(
          'text-sm font-semibold tabular-nums',
          isIngreso ? 'text-emerald-600' : 'text-foreground',
        )}>
          {isIngreso ? '+' : ''}{formatMonto(r.monto, r.moneda)}
        </span>
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-end gap-0.5 w-20 self-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={r.activa ? onDesactivar : onActivar}
          aria-label={r.activa ? 'Pausar' : 'Activar'}
        >
          {r.activa ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-emerald-600" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onEditar}
          aria-label="Editar"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onEliminar}
          aria-label="Eliminar"
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
    </div>
  )
}

// ── Formulario ───────────────────────────────────────────────

const recurrenteSchema = z.object({
  tipo: z.enum(['INGRESO', 'GASTO']),
  cuentaId: z.string().min(1, 'Selecciona una cuenta'),
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
  descripcion: z.string().min(1, 'La descripcion es requerida').max(255),
  frecuencia: z.string().min(1),
  categoriaId: z.string().optional(),
  proximaFecha: z.string().min(1, 'La fecha es requerida'),
})

type RecurrenteFormData = z.infer<typeof recurrenteSchema>

function RecurrenteFormDialog({
  open,
  onOpenChange,
  recurrente,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  recurrente?: TransaccionRecurrente | null
}) {
  const isEditing = !!recurrente
  const crear = useCrearRecurrente()
  const actualizar = useActualizarRecurrente()
  const isPending = crear.isPending || actualizar.isPending
  const { data: cuentasData } = useCuentas({ estado: 'ACTIVA', limit: 50 })
  const cuentas = cuentasData?.data || []

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<RecurrenteFormData>({
    resolver: formResolver(recurrenteSchema),
    defaultValues: {
      tipo: 'GASTO',
      cuentaId: '',
      monto: undefined,
      descripcion: '',
      frecuencia: 'MENSUAL',
      categoriaId: '',
      proximaFecha: new Date().toISOString().split('T')[0],
    },
  })

  const tipo = watch('tipo')
  const cuentaId = watch('cuentaId')
  const frecuencia = watch('frecuencia')
  const categoriaId = watch('categoriaId')

  const clasificacion = tipo === 'INGRESO' ? 'INGRESO' : 'GASTO'
  const { data: categorias = [] } = useCategorias(clasificacion)

  useEffect(() => {
    if (!open) return
    if (recurrente) {
      reset({
        tipo: recurrente.tipo as 'INGRESO' | 'GASTO',
        cuentaId: recurrente.cuentaId,
        monto: Number(recurrente.monto),
        descripcion: recurrente.descripcion,
        frecuencia: recurrente.frecuencia,
        categoriaId: recurrente.categoriaId || '',
        proximaFecha: recurrente.proximaFecha.split('T')[0],
      })
    } else {
      reset({
        tipo: 'GASTO',
        cuentaId: '',
        monto: undefined,
        descripcion: '',
        frecuencia: 'MENSUAL',
        categoriaId: '',
        proximaFecha: new Date().toISOString().split('T')[0],
      })
    }
  }, [open, recurrente, reset])

  function onSubmit(data: RecurrenteFormData) {
    const catId = data.categoriaId === '_none' ? undefined : data.categoriaId || undefined
    if (isEditing && recurrente) {
      actualizar.mutate(
        {
          id: recurrente.id,
          data: {
            cuentaId: data.cuentaId,
            tipo: data.tipo,
            monto: data.monto,
            descripcion: data.descripcion,
            frecuencia: data.frecuencia,
            categoriaId: catId ?? null,
            proximaFecha: data.proximaFecha,
          },
        },
        { onSuccess: () => onOpenChange(false) },
      )
    } else {
      crear.mutate(
        {
          cuentaId: data.cuentaId,
          tipo: data.tipo,
          monto: data.monto,
          descripcion: data.descripcion,
          frecuencia: data.frecuencia,
          categoriaId: catId,
          proximaFecha: data.proximaFecha,
        },
        { onSuccess: () => onOpenChange(false) },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar recurrente' : 'Nueva recurrente'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos de la transaccion recurrente.'
              : 'Programa una transaccion automatica.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Tipo */}
          <div className="rounded-lg border border-input p-1 flex gap-1">
            <button
              type="button"
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${tipo === 'GASTO' ? 'bg-destructive/90 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setValue('tipo', 'GASTO')}
            >
              Gasto
            </button>
            <button
              type="button"
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${tipo === 'INGRESO' ? 'bg-emerald-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setValue('tipo', 'INGRESO')}
            >
              Ingreso
            </button>
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label>Descripcion</Label>
            <Input {...register('descripcion')} maxLength={255} placeholder="Ej: Netflix, Alquiler..." />
            {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion.message}</p>}
          </div>

          {/* Cuenta */}
          <div className="space-y-1.5">
            <Label>Cuenta</Label>
            <Select value={cuentaId || null} onValueChange={(v) => v && setValue('cuentaId', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cuenta">
                  {(value: string) => {
                    if (!value) return 'Seleccionar cuenta'
                    return cuentas.find((x) => x.id === value)?.nombre ?? value
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {cuentas.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.cuentaId && <p className="text-xs text-destructive">{errors.cuentaId.message}</p>}
          </div>

          {/* Monto + Frecuencia */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Monto</Label>
              <MoneyInput value={watch('monto')} onChange={(v) => setValue('monto', v)} />
              {errors.monto && <p className="text-xs text-destructive">{errors.monto.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Frecuencia</Label>
              <Select value={frecuencia} onValueChange={(v) => v && setValue('frecuencia', v)}>
                <SelectTrigger>
                  <SelectValue>
                    {(value: string) => {
                      if (!value) return 'Frecuencia'
                      return FRECUENCIA_LABELS[value as FrecuenciaRecurrencia] ?? value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FRECUENCIA_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Categoría + Próxima fecha */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <CategoriaSelect
                categorias={categorias}
                value={categoriaId}
                onValueChange={(v) => setValue('categoriaId', v === '_none' ? '' : v)}
                allowNone
              />
            </div>
            <div className="space-y-1.5">
              <Label>Proxima fecha</Label>
              <Input type="date" {...register('proximaFecha')} />
              {errors.proximaFecha && <p className="text-xs text-destructive">{errors.proximaFecha.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <DialogClose>Cancelar</DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
