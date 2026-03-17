import { useEffect, useRef, useCallback } from 'react'
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
import { ArrowRight } from 'lucide-react'
import { useCuentas } from '@/hooks/use-cuentas'
import { useCrearTransferencia } from '@/hooks/use-transferencias'
import { useTasasDolar } from '@/hooks/use-reportes'
import { useUIStore } from '@/stores/ui.store'

const transferenciaSchema = z.object({
  origenId: z.string().min(1, 'Selecciona cuenta origen'),
  destinoId: z.string().min(1, 'Selecciona cuenta destino'),
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
  cotizacion: z.coerce.number().positive().optional(),
  montoDestino: z.coerce.number().positive().optional(),
  fecha: z.string().min(1),
  descripcion: z.string().max(200).optional(),
}).refine((data) => data.origenId !== data.destinoId, {
  message: 'Las cuentas deben ser diferentes',
  path: ['destinoId'],
})

type TransferenciaFormData = z.infer<typeof transferenciaSchema>

interface TransferenciaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransferenciaForm({ open, onOpenChange }: TransferenciaFormProps) {
  const crear = useCrearTransferencia()
  const { data: cuentasData } = useCuentas({ estado: 'ACTIVA', limit: 50 }, open)
  const cuentas = cuentasData?.data || []
  const { data: tasas } = useTasasDolar(open)
  const tipoDolar = useUIStore((s) => s.tipoDolar)
  const ultimoCampo = useRef<'monto' | 'cotizacion' | 'montoDestino' | null>(null)

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TransferenciaFormData>({
    resolver: formResolver(transferenciaSchema),
    defaultValues: {
      origenId: '',
      destinoId: '',
      monto: undefined,
      cotizacion: undefined,
      montoDestino: undefined,
      fecha: new Date().toISOString().split('T')[0],
      descripcion: '',
    },
  })

  const origenId = watch('origenId')
  const destinoId = watch('destinoId')
  const monto = watch('monto')
  const cotizacion = watch('cotizacion')
  const montoDestino = watch('montoDestino')

  const origen = cuentas.find((c) => c.id === origenId)
  const destino = cuentas.find((c) => c.id === destinoId)
  const diferenteMoneda = origen && destino && origen.moneda !== destino.moneda

  // Determinar si la conversion es USD→ARS (multiplicar) o ARS→USD (dividir)
  const esOrigenUsd = origen?.moneda === 'USD'

  // Pre-llenar cotizacion cuando se detecta diferente moneda
  useEffect(() => {
    if (diferenteMoneda && tasas) {
      const tasa = tasas.find((t) => t.tipo === tipoDolar)
      if (tasa) {
        setValue('cotizacion', tasa.tasa)
        ultimoCampo.current = 'cotizacion'
      }
    }
  }, [diferenteMoneda, tasas, tipoDolar, setValue])

  // Auto-calculo bidireccional
  const recalcular = useCallback((campo: 'monto' | 'cotizacion' | 'montoDestino') => {
    ultimoCampo.current = campo
  }, [])

  useEffect(() => {
    if (!diferenteMoneda || !ultimoCampo.current) return

    if (ultimoCampo.current === 'montoDestino') {
      // Recalcular cotizacion a partir de monto y montoDestino
      if (monto && montoDestino && monto > 0) {
        const nuevaCotizacion = esOrigenUsd ? montoDestino / monto : monto / montoDestino
        setValue('cotizacion', Math.round(nuevaCotizacion * 100) / 100)
      }
    } else {
      // Recalcular montoDestino a partir de monto y cotizacion
      if (monto && cotizacion && cotizacion > 0) {
        const nuevoMonto = esOrigenUsd ? monto * cotizacion : monto / cotizacion
        setValue('montoDestino', Math.round(nuevoMonto * 100) / 100)
      }
    }
  }, [monto, cotizacion, montoDestino, diferenteMoneda, esOrigenUsd, setValue])

  useEffect(() => {
    if (!open) {
      reset({
        origenId: '',
        destinoId: '',
        monto: undefined,
        cotizacion: undefined,
        montoDestino: undefined,
        fecha: new Date().toISOString().split('T')[0],
        descripcion: '',
      })
      ultimoCampo.current = null
    }
  }, [open, reset])

  function onSubmit(data: TransferenciaFormData) {
    crear.mutate(
      {
        cuentaOrigenId: data.origenId,
        cuentaDestinoId: data.destinoId,
        monto: data.monto,
        montoDestino: diferenteMoneda ? data.montoDestino : undefined,
        fecha: data.fecha,
        descripcion: data.descripcion || undefined,
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva transferencia</DialogTitle>
          <DialogDescription>Mover fondos entre cuentas.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
            <div className="space-y-2">
              <Label>Origen</Label>
              <Select value={origenId || null} onValueChange={(v) => v && setValue('origenId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Cuenta origen">
                    {(value: string) => {
                      if (!value) return 'Cuenta origen'
                      const c = cuentas.find((x) => x.id === value)
                      return c ? `${c.nombre} (${c.moneda})` : value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {cuentas.filter((c) => c.id !== destinoId).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nombre} ({c.moneda})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.origenId && <p className="text-xs text-destructive">{errors.origenId.message}</p>}
            </div>

            <ArrowRight className="h-5 w-5 text-muted-foreground mb-2.5" />

            <div className="space-y-2">
              <Label>Destino</Label>
              <Select value={destinoId || null} onValueChange={(v) => v && setValue('destinoId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Cuenta destino">
                    {(value: string) => {
                      if (!value) return 'Cuenta destino'
                      const c = cuentas.find((x) => x.id === value)
                      return c ? `${c.nombre} (${c.moneda})` : value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {cuentas.filter((c) => c.id !== origenId).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nombre} ({c.moneda})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.destinoId && <p className="text-xs text-destructive">{errors.destinoId.message}</p>}
            </div>
          </div>

          <div className={diferenteMoneda ? 'grid grid-cols-3 gap-3' : ''}>
            <div className="space-y-2">
              <Label htmlFor="tf-monto">
                Monto {origen ? `(${origen.moneda})` : ''}
              </Label>
              <MoneyInput
                id="tf-monto"
                value={watch('monto')}
                onChange={(v) => { setValue('monto', v); recalcular('monto') }}
                moneda={origen?.moneda}
              />
              {errors.monto && <p className="text-xs text-destructive">{errors.monto.message}</p>}
            </div>
            {diferenteMoneda && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="tf-cotizacion">
                    Cotizacion
                  </Label>
                  <Input
                    id="tf-cotizacion"
                    type="number"
                    step="0.01"
                    min="0.01"
                    {...register('cotizacion', { onChange: () => recalcular('cotizacion') })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tf-monto-dest">
                    Monto destino ({destino?.moneda})
                  </Label>
                  <MoneyInput
                    id="tf-monto-dest"
                    value={watch('montoDestino') ?? 0}
                    onChange={(v) => { setValue('montoDestino', v || undefined); recalcular('montoDestino') }}
                    moneda={destino?.moneda}
                  />
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tf-fecha">Fecha</Label>
              <Input
                id="tf-fecha"
                type="date"
                {...register('fecha')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tf-desc">Descripcion (opcional)</Label>
              <Input
                id="tf-desc"
                {...register('descripcion')}
                placeholder="Ej: Paso a dolares"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose>Cancelar</DialogClose>
            <Button type="submit" disabled={crear.isPending}>
              {crear.isPending ? 'Transfiriendo...' : 'Transferir'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
