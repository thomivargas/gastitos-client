import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form'
import { z } from 'zod'
import { useParams, useNavigate, Navigate } from 'react-router'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { PresupuestoProgreso } from '@/components/presupuestos/PresupuestoProgreso'
import { usePresupuesto, useAsignarCategoria, useEliminarCategoriaPresupuesto } from '@/hooks/use-presupuestos'
import { useCategorias } from '@/hooks/use-categorias'
import { formatFecha, formatMonto } from '@/lib/formatters'

export default function PresupuestoDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) return <Navigate to="/presupuestos" replace />

  const { data: presupuesto, isLoading } = usePresupuesto(id)
  const [addCatOpen, setAddCatOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse bg-muted rounded" />
        <div className="h-64 animate-pulse bg-muted rounded-lg" />
      </div>
    )
  }

  if (!presupuesto) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Presupuesto no encontrado</p>
        <Button variant="link" onClick={() => navigate('/presupuestos')}>Volver</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 page-transition">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/presupuestos')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {formatFecha(presupuesto.fechaInicio, 'dd MMM')} - {formatFecha(presupuesto.fechaFin, 'dd MMM yyyy')}
          </h1>
          <p className="text-sm text-muted-foreground">{presupuesto.moneda}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setAddCatOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Asignar categoria
        </Button>
      </div>

      {/* Categorias asignadas */}
      {presupuesto.categorias.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Categorias asignadas</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoriasList presupuestoId={presupuesto.id} categorias={presupuesto.categorias} moneda={presupuesto.moneda} />
          </CardContent>
        </Card>
      )}

      {/* Progreso */}
      <PresupuestoProgreso presupuestoId={presupuesto.id} moneda={presupuesto.moneda} />

      <AsignarCategoriaDialog
        open={addCatOpen}
        onOpenChange={setAddCatOpen}
        presupuestoId={presupuesto.id}
        categoriasExistentes={presupuesto.categorias.map((c) => c.categoriaId)}
      />
    </div>
  )
}

function CategoriasList({
  presupuestoId,
  categorias,
  moneda,
}: {
  presupuestoId: string
  categorias: Array<{ id: string; categoriaId: string; categoria?: { nombre: string; color: string }; montoPresupuestado: number }>
  moneda: string
}) {
  const eliminar = useEliminarCategoriaPresupuesto()

  return (
    <ul className="space-y-2">
      {categorias.map((c) => (
        <li key={c.id} className="flex items-center gap-3 py-1">
          <span
            className="h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: c.categoria?.color || '#667085' }}
          />
          <span className="flex-1 text-sm font-medium">{c.categoria?.nombre || 'Categoria'}</span>
          <span className="text-sm text-muted-foreground tabular-nums">
            {formatMonto(c.montoPresupuestado, moneda)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => eliminar.mutate({ id: presupuestoId, categoriaId: c.categoriaId })}
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </li>
      ))}
    </ul>
  )
}

const asignarCategoriaSchema = z.object({
  categoriaId: z.string().min(1, 'Selecciona una categoria'),
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
})

type AsignarCategoriaFormData = z.infer<typeof asignarCategoriaSchema>

function AsignarCategoriaDialog({
  open,
  onOpenChange,
  presupuestoId,
  categoriasExistentes,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  presupuestoId: string
  categoriasExistentes: string[]
}) {
  const { data: categorias } = useCategorias('GASTO')
  const asignar = useAsignarCategoria()

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<AsignarCategoriaFormData>({
    resolver: formResolver(asignarCategoriaSchema),
    defaultValues: { categoriaId: '', monto: undefined },
  })

  const categoriaId = watch('categoriaId')
  const disponibles = (categorias || []).filter((c) => !categoriasExistentes.includes(c.id))

  useEffect(() => {
    if (!open) return
    reset({ categoriaId: '', monto: undefined })
  }, [open, reset])

  function onSubmit(data: AsignarCategoriaFormData) {
    asignar.mutate(
      { id: presupuestoId, categoriaId: data.categoriaId, monto: data.monto },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar categoria</DialogTitle>
          <DialogDescription>Asigna un monto presupuestado a una categoria.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoriaId || null} onValueChange={(v) => v && setValue('categoriaId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoria">
                    {(value: string) => {
                      if (!value) return 'Seleccionar categoria'
                      return disponibles.find((x) => x.id === value)?.nombre ?? value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {disponibles.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoriaId && <p className="text-xs text-destructive">{errors.categoriaId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ac-monto">Monto presupuestado</Label>
              <Input
                id="ac-monto"
                type="number"
                step="0.01"
                min="0.01"
                {...register('monto')}
              />
              {errors.monto && <p className="text-xs text-destructive">{errors.monto.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <DialogClose>Cancelar</DialogClose>
            <Button type="submit" disabled={asignar.isPending}>
              {asignar.isPending ? 'Asignando...' : 'Asignar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
