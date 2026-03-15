import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form'
import { z } from 'zod'
import { Plus, Play, Pause, Trash2, Repeat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import { useRecurrentes, useCrearRecurrente, useActivarRecurrente, useDesactivarRecurrente, useEliminarRecurrente } from '@/hooks/use-recurrentes'
import { useCuentas } from '@/hooks/use-cuentas'
import { useCategorias } from '@/hooks/use-categorias'
import { formatMonto, formatFecha } from '@/lib/formatters'
import { FRECUENCIA_LABELS } from '@/lib/constants'
import type { TransaccionRecurrente, FrecuenciaRecurrencia } from '@/types'

export default function RecurrentesPage() {
  const { data: recurrentes, isLoading } = useRecurrentes()
  const activar = useActivarRecurrente()
  const desactivar = useDesactivarRecurrente()
  const eliminar = useEliminarRecurrente()
  const [formOpen, setFormOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  return (
    <div className="space-y-6 page-transition">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recurrentes</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva recurrente
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-2 md:p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded shimmer" />
                  <div className="h-3 w-48 rounded shimmer" />
                </div>
                <div className="h-4 w-20 rounded shimmer" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : !recurrentes?.length ? (
        <EmptyState
          icono={Repeat}
          titulo="Sin recurrentes"
          descripcion="Automatiza tus transacciones que se repiten cada mes"
          accion={{ label: 'Crear recurrente', onClick: () => setFormOpen(true) }}
        />
      ) : (
        <Card>
          <CardContent className="p-2 md:p-4 divide-y">
            {recurrentes.map((r) => (
              <RecurrenteRow
                key={r.id}
                recurrente={r}
                onActivar={() => activar.mutate(r.id)}
                onDesactivar={() => desactivar.mutate(r.id)}
                onEliminar={() => setConfirmId(r.id)}
              />
            ))}
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(open) => { if (!open) setConfirmId(null) }}
        onConfirm={() => { if (confirmId) eliminar.mutate(confirmId); setConfirmId(null) }}
        titulo="Eliminar recurrente"
        descripcion="Se eliminara esta transaccion recurrente. No afecta transacciones ya creadas."
      />
      <RecurrenteFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}

function RecurrenteRow({
  recurrente: r,
  onActivar,
  onDesactivar,
  onEliminar,
}: {
  recurrente: TransaccionRecurrente
  onActivar: () => void
  onDesactivar: () => void
  onEliminar: () => void
}) {
  const isIngreso = r.tipo === 'INGRESO'

  return (
    <div className="flex items-center gap-3 px-3 py-3 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{r.descripcion}</p>
          <Badge variant={r.activa ? 'default' : 'secondary'} className="text-[10px]">
            {r.activa ? 'Activa' : 'Pausada'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {FRECUENCIA_LABELS[r.frecuencia as FrecuenciaRecurrencia] || r.frecuencia}
          {' · Proxima: '}
          {formatFecha(r.proximaFecha)}
        </p>
      </div>

      <span className={`text-sm font-semibold tabular-nums ${isIngreso ? 'text-green-600' : 'text-red-500'}`}>
        {isIngreso ? '+' : '-'}{formatMonto(r.monto, r.moneda)}
      </span>

      <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={r.activa ? onDesactivar : onActivar} aria-label={r.activa ? 'Pausar' : 'Activar'}>
          {r.activa ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEliminar} aria-label="Eliminar">
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
    </div>
  )
}

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

function RecurrenteFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const crear = useCrearRecurrente()
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
    reset({
      tipo: 'GASTO',
      cuentaId: '',
      monto: undefined,
      descripcion: '',
      frecuencia: 'MENSUAL',
      categoriaId: '',
      proximaFecha: new Date().toISOString().split('T')[0],
    })
  }, [open, reset])

  function onSubmit(data: RecurrenteFormData) {
    const catId = data.categoriaId === '_none' ? '' : data.categoriaId
    crear.mutate(
      {
        cuentaId: data.cuentaId,
        tipo: data.tipo,
        monto: data.monto,
        descripcion: data.descripcion,
        frecuencia: data.frecuencia,
        categoriaId: catId || undefined,
        proximaFecha: data.proximaFecha,
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva recurrente</DialogTitle>
          <DialogDescription>Programa una transaccion automatica.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
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

          <div className="space-y-2">
            <Label>Cuenta</Label>
            <Select value={cuentaId || null} onValueChange={(v) => v && setValue('cuentaId', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar">
                  {(value: string) => {
                    if (!value) return 'Seleccionar'
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Monto</Label>
              <Input type="number" step="0.01" min="0.01" {...register('monto')} />
              {errors.monto && <p className="text-xs text-destructive">{errors.monto.message}</p>}
            </div>
            <div className="space-y-2">
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

          <div className="space-y-2">
            <Label>Descripcion</Label>
            <Input {...register('descripcion')} maxLength={255} />
            {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <CategoriaSelect
                categorias={categorias}
                value={categoriaId}
                onValueChange={(v) => setValue('categoriaId', v === '_none' ? '' : v)}
                allowNone
              />
            </div>
            <div className="space-y-2">
              <Label>Proxima fecha</Label>
              <Input type="date" {...register('proximaFecha')} />
            </div>
          </div>

          <DialogFooter>
            <DialogClose>Cancelar</DialogClose>
            <Button type="submit" disabled={crear.isPending}>
              {crear.isPending ? 'Creando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
