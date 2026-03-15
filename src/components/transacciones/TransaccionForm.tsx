import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { useCuentas } from '@/hooks/use-cuentas'
import { useCategorias } from '@/hooks/use-categorias'
import { useEtiquetas } from '@/hooks/use-etiquetas'
import { useCrearTransaccion, useActualizarTransaccion } from '@/hooks/use-transacciones'
import type { Transaccion, ClasificacionCategoria } from '@/types'

const transaccionSchema = z.object({
  tipo: z.enum(['INGRESO', 'GASTO']),
  cuentaId: z.string().min(1, 'Selecciona una cuenta'),
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  descripcion: z.string().min(1, 'La descripcion es requerida').max(200),
  categoriaId: z.string().optional(),
  notas: z.string().max(500).optional(),
  etiquetaIds: z.array(z.string()).default([]),
})

type TransaccionFormData = z.infer<typeof transaccionSchema>

interface TransaccionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaccion?: Transaccion | null
}

export function TransaccionForm({ open, onOpenChange, transaccion }: TransaccionFormProps) {
  const isEditing = !!transaccion
  const crear = useCrearTransaccion()
  const actualizar = useActualizarTransaccion()
  const isPending = crear.isPending || actualizar.isPending

  const { data: cuentasData } = useCuentas({ estado: 'ACTIVA', limit: 50 }, open)
  const cuentas = cuentasData?.data ?? []
  const primerCuentaId = cuentas[0]?.id ?? ''

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TransaccionFormData>({
    resolver: formResolver(transaccionSchema),
    defaultValues: {
      tipo: 'GASTO',
      cuentaId: '',
      monto: undefined,
      fecha: new Date().toISOString().split('T')[0],
      descripcion: '',
      categoriaId: '',
      notas: '',
      etiquetaIds: [],
    },
  })

  const tipo = watch('tipo')
  const cuentaId = watch('cuentaId')
  const categoriaId = watch('categoriaId')
  const etiquetaIds = watch('etiquetaIds')

  const clasificacion: ClasificacionCategoria = tipo === 'INGRESO' ? 'INGRESO' : 'GASTO'
  const { data: categorias } = useCategorias(clasificacion)
  const { data: etiquetas } = useEtiquetas()

  const categoriasLista = categorias || []

  useEffect(() => {
    if (!open) return
    if (transaccion) {
      reset({
        tipo: transaccion.tipo as 'INGRESO' | 'GASTO',
        cuentaId: transaccion.cuenta.id,
        monto: Number(transaccion.monto),
        fecha: transaccion.fecha.split('T')[0],
        descripcion: transaccion.descripcion,
        categoriaId: transaccion.categoria?.id || '',
        notas: transaccion.notas || '',
        etiquetaIds: transaccion.etiquetas.map((e) => e.id),
      })
    } else {
      reset({
        tipo: 'GASTO',
        cuentaId: primerCuentaId,
        monto: undefined,
        fecha: new Date().toISOString().split('T')[0],
        descripcion: '',
        categoriaId: '',
        notas: '',
        etiquetaIds: [],
      })
    }
  }, [transaccion, open, primerCuentaId, reset])

  function toggleEtiqueta(id: string) {
    const current = etiquetaIds || []
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    setValue('etiquetaIds', next)
  }

  function onSubmit(data: TransaccionFormData) {
    const categoriaIdFinal = data.categoriaId === '_none' ? '' : data.categoriaId

    if (isEditing && transaccion) {
      actualizar.mutate(
        {
          id: transaccion.id,
          data: {
            tipo: data.tipo,
            monto: data.monto,
            fecha: data.fecha,
            descripcion: data.descripcion,
            categoriaId: categoriaIdFinal || null,
            notas: data.notas || null,
            etiquetaIds: data.etiquetaIds,
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
          fecha: data.fecha,
          descripcion: data.descripcion,
          categoriaId: categoriaIdFinal || undefined,
          notas: data.notas || undefined,
          etiquetaIds: data.etiquetaIds.length ? data.etiquetaIds : undefined,
        },
        { onSuccess: () => onOpenChange(false) },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar transaccion' : 'Nueva transaccion'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos de la transaccion.' : 'Registra un ingreso o gasto.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* Tipo - Segmented control */}
          <div className="rounded-lg border border-input p-1 flex gap-1">
            <button
              type="button"
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${tipo === 'GASTO' ? 'bg-destructive/90 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => { setValue('tipo', 'GASTO'); setValue('categoriaId', '') }}
            >
              Gasto
            </button>
            <button
              type="button"
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${tipo === 'INGRESO' ? 'bg-emerald-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => { setValue('tipo', 'INGRESO'); setValue('categoriaId', '') }}
            >
              Ingreso
            </button>
          </div>

          {/* Cuenta + Categoria */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
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
                  {cuentas.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.cuentaId && <p className="text-xs text-destructive">{errors.cuentaId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <CategoriaSelect
                categorias={categoriasLista}
                value={categoriaId}
                onValueChange={(v) => setValue('categoriaId', v === '_none' ? '' : v)}
                allowNone
              />
            </div>
          </div>

          {/* Monto + Fecha */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="t-monto">Monto</Label>
              <Input
                id="t-monto"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                {...register('monto')}
              />
              {errors.monto && <p className="text-xs text-destructive">{errors.monto.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-fecha">Fecha</Label>
              <Input
                id="t-fecha"
                type="date"
                {...register('fecha')}
              />
            </div>
          </div>

          {/* Descripcion */}
          <div className="space-y-2">
            <Label htmlFor="t-desc">Descripcion</Label>
            <Input
              id="t-desc"
              {...register('descripcion')}
              placeholder="Ej: Supermercado"
            />
            {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion.message}</p>}
          </div>

          {/* Etiquetas */}
          {etiquetas && etiquetas.length > 0 && (
            <div className="space-y-2">
              <Label>Etiquetas</Label>
              <div className="flex flex-wrap gap-1.5">
                {etiquetas.map((et) => {
                  const selected = etiquetaIds.includes(et.id)
                  return (
                    <Badge
                      key={et.id}
                      variant={selected ? 'default' : 'outline'}
                      className="cursor-pointer select-none"
                      onClick={() => toggleEtiqueta(et.id)}
                    >
                      {et.nombre}
                      {selected && <X className="h-3 w-3 ml-1" />}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="t-notas">Notas (opcional)</Label>
            <Input
              id="t-notas"
              {...register('notas')}
              placeholder="Notas adicionales"
            />
          </div>

          <DialogFooter>
            <DialogClose>Cancelar</DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : isEditing ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
