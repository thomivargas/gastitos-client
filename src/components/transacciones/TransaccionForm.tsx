import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MoneyInput } from '@/components/ui/money-input'
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
import { X, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
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
  montoOriginal: z.coerce.number().positive().optional(),
  monedaOriginal: z.string().length(3).toUpperCase().optional(),
  tipoCotizacion: z.enum(['blue', 'tarjeta', 'oficial']).optional(),
})

type TransaccionFormData = z.infer<typeof transaccionSchema>

interface TransaccionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaccion?: Transaccion | null
}

export function TransaccionForm({ open, onOpenChange, transaccion }: TransaccionFormProps) {
  const isEditing = !!transaccion
  const [showMonedaOriginal, setShowMonedaOriginal] = useState(false)
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
  const monedaOriginal = watch('monedaOriginal')
  const tipoCotizacion = watch('tipoCotizacion')

  const cuentaSeleccionada = cuentas.find((c) => c.id === cuentaId)
  const monedaCuenta = cuentaSeleccionada?.moneda ?? 'ARS'

  const clasificacion: ClasificacionCategoria = tipo === 'INGRESO' ? 'INGRESO' : 'GASTO'
  const { data: categorias } = useCategorias(clasificacion, open)
  const { data: etiquetas } = useEtiquetas(open)

  const categoriasLista = categorias || []
  const isGasto = tipo === 'GASTO'

  useEffect(() => {
    if (!open) {
      setShowMonedaOriginal(false)
      return
    }
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
    setShowMonedaOriginal(false)
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
            montoOriginal: showMonedaOriginal ? data.montoOriginal : undefined,
            monedaOriginal: showMonedaOriginal ? data.monedaOriginal : undefined,
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
          montoOriginal: showMonedaOriginal ? data.montoOriginal : undefined,
          monedaOriginal: showMonedaOriginal ? data.monedaOriginal : undefined,
        },
        { onSuccess: () => onOpenChange(false) },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? (
              'Editar transaccion'
            ) : (
              <>
                {isGasto ? (
                  <ArrowDownCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <ArrowUpCircle className="h-5 w-5 text-emerald-500" />
                )}
                Nueva transaccion
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos de la transaccion.' : 'Registra un ingreso o gasto.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Tipo - Segmented control mejorado */}
          <div className="rounded-lg border border-input p-1 flex gap-1 bg-muted/30">
            <button
              type="button"
              className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                isGasto
                  ? 'bg-red-500/15 text-red-600 dark:text-red-400 shadow-sm ring-1 ring-red-500/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
              onClick={() => { setValue('tipo', 'GASTO'); setValue('categoriaId', '') }}
            >
              <ArrowDownCircle className="h-4 w-4" />
              Gasto
            </button>
            <button
              type="button"
              className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                !isGasto
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
              onClick={() => { setValue('tipo', 'INGRESO'); setValue('categoriaId', '') }}
            >
              <ArrowUpCircle className="h-4 w-4" />
              Ingreso
            </button>
          </div>

          {/* Monto - prominente */}
          <div className="space-y-2">
            <Label htmlFor="t-monto">Monto</Label>
            <MoneyInput
              id="t-monto"
              value={watch('monto')}
              onChange={(v) => setValue('monto', v)}
              moneda={monedaCuenta}
              className="text-lg font-semibold h-10"
            />
            {errors.monto && <p className="text-xs text-destructive">{errors.monto.message}</p>}
          </div>

          {/* Toggle doble moneda */}
          {!showMonedaOriginal ? (
            <button
              type="button"
              onClick={() => setShowMonedaOriginal(true)}
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
            >
              + Importe en moneda extranjera
            </button>
          ) : (
            <div className="rounded-lg border border-border p-3 space-y-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Moneda original</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowMonedaOriginal(false)
                    setValue('montoOriginal', undefined)
                    setValue('monedaOriginal', undefined)
                    setValue('tipoCotizacion', undefined)
                  }}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Cancelar
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Moneda</Label>
                  <Select
                    value={monedaOriginal ?? 'USD'}
                    onValueChange={(v) => setValue('monedaOriginal', v!)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Monto original</Label>
                  <MoneyInput
                    value={watch('montoOriginal') ?? 0}
                    onChange={(v) => setValue('montoOriginal', v || undefined)}
                    moneda={monedaOriginal ?? 'USD'}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tipo de cotizacion</Label>
                <Select
                  value={tipoCotizacion ?? 'blue'}
                  onValueChange={(v) => setValue('tipoCotizacion', v as 'blue' | 'tarjeta' | 'oficial')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Dolar blue</SelectItem>
                    <SelectItem value="tarjeta">Dolar tarjeta</SelectItem>
                    <SelectItem value="oficial">Dolar oficial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-[10px] text-muted-foreground">
                El monto principal ({monedaCuenta}) se calcula automaticamente al ingresar el importe y la cotizacion.
              </p>
            </div>
          )}

          {/* Descripcion */}
          <div className="space-y-2">
            <Label htmlFor="t-desc">Descripcion</Label>
            <Input
              id="t-desc"
              {...register('descripcion')}
              placeholder="Ej: Supermercado, alquiler, sueldo..."
            />
            {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion.message}</p>}
          </div>

          {/* Cuenta + Fecha */}
          <div className="grid grid-cols-2 gap-3">
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
                  {cuentas.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.cuentaId && <p className="text-xs text-destructive">{errors.cuentaId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-fecha">Fecha</Label>
              <div className="relative">
                <Input
                  id="t-fecha"
                  type="date"
                  {...register('fecha')}
                />
              </div>
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <CategoriaSelect
              categorias={categoriasLista}
              value={categoriaId}
              onValueChange={(v) => setValue('categoriaId', v === '_none' ? '' : v)}
              allowNone
            />
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
                      className={`cursor-pointer select-none transition-all ${
                        selected
                          ? 'ring-1 ring-primary/30'
                          : 'opacity-60 hover:opacity-100'
                      }`}
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
            <Label htmlFor="t-notas">
              Notas <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <textarea
              id="t-notas"
              {...register('notas')}
              placeholder="Notas adicionales..."
              rows={2}
              className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none dark:bg-input/30"
            />
          </div>

          <DialogFooter>
            <DialogClose>Cancelar</DialogClose>
            <Button
              type="submit"
              disabled={isPending}
              className={isGasto ? '' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}
            >
              {isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : isGasto ? 'Registrar gasto' : 'Registrar ingreso'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
