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
import { MONEDAS } from '@/lib/constants'
import { useCrearPresupuesto } from '@/hooks/use-presupuestos'

const presupuestoSchema = z.object({
  fechaInicio: z.string().min(1, 'Fecha inicio requerida'),
  fechaFin: z.string().min(1, 'Fecha fin requerida'),
  gastoPresupuestado: z.coerce.number().min(0).optional(),
  ingresoEsperado: z.coerce.number().min(0).optional(),
  moneda: z.string().min(1),
}).refine((data) => data.fechaFin >= data.fechaInicio, {
  message: 'La fecha fin debe ser posterior a la fecha inicio',
  path: ['fechaFin'],
})

type PresupuestoFormData = z.infer<typeof presupuestoSchema>

function getDefaultDates() {
  const now = new Date()
  const inicio = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const fin = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${lastDay}`
  return { inicio, fin }
}

interface PresupuestoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PresupuestoForm({ open, onOpenChange }: PresupuestoFormProps) {
  const crear = useCrearPresupuesto()
  const { inicio, fin } = getDefaultDates()

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<PresupuestoFormData>({
    resolver: formResolver(presupuestoSchema),
    defaultValues: {
      fechaInicio: inicio,
      fechaFin: fin,
      gastoPresupuestado: undefined,
      ingresoEsperado: undefined,
      moneda: 'ARS',
    },
  })

  const moneda = watch('moneda')

  useEffect(() => {
    if (!open) return
    reset({
      fechaInicio: inicio,
      fechaFin: fin,
      gastoPresupuestado: undefined,
      ingresoEsperado: undefined,
      moneda: 'ARS',
    })
  }, [open, reset, inicio, fin])

  function onSubmit(data: PresupuestoFormData) {
    crear.mutate(
      {
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
        gastoPresupuestado: data.gastoPresupuestado || undefined,
        ingresoEsperado: data.ingresoEsperado || undefined,
        moneda: data.moneda,
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo presupuesto</DialogTitle>
          <DialogDescription>Define un presupuesto para un periodo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-inicio">Fecha inicio</Label>
              <Input id="p-inicio" type="date" {...register('fechaInicio')} />
              {errors.fechaInicio && <p className="text-xs text-destructive">{errors.fechaInicio.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-fin">Fecha fin</Label>
              <Input id="p-fin" type="date" {...register('fechaFin')} />
              {errors.fechaFin && <p className="text-xs text-destructive">{errors.fechaFin.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="p-gasto">Gasto presupuestado</Label>
              <Input
                id="p-gasto"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                {...register('gastoPresupuestado')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-ingreso">Ingreso esperado</Label>
              <Input
                id="p-ingreso"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                {...register('ingresoEsperado')}
              />
            </div>
            <div className="space-y-2">
              <Label>Moneda</Label>
              <Select value={moneda} onValueChange={(v) => v && setValue('moneda', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONEDAS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <DialogClose>Cancelar</DialogClose>
            <Button type="submit" disabled={crear.isPending}>
              {crear.isPending ? 'Creando...' : 'Crear presupuesto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
