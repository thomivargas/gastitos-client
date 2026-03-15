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
import { TIPOS_CUENTA, MONEDAS } from '@/lib/constants'
import { useCrearCuenta, useActualizarCuenta } from '@/hooks/use-cuentas'
import type { Cuenta, TipoCuenta } from '@/types'

const TIPOS_CUENTA_KEYS = Object.keys(TIPOS_CUENTA) as [TipoCuenta, ...TipoCuenta[]]

const cuentaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100),
  tipo: z.enum(TIPOS_CUENTA_KEYS),
  moneda: z.string().min(1),
  balanceInicial: z.coerce.number().default(0),
  institucion: z.string().max(100).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color invalido').default('#6172F3'),
})

type CuentaFormData = z.infer<typeof cuentaSchema>

interface CuentaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cuenta?: Cuenta | null
}

export function CuentaForm({ open, onOpenChange, cuenta }: CuentaFormProps) {
  const isEditing = !!cuenta
  const crear = useCrearCuenta()
  const actualizar = useActualizarCuenta()
  const isPending = crear.isPending || actualizar.isPending

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CuentaFormData>({
    resolver: formResolver(cuentaSchema),
    defaultValues: {
      nombre: '',
      tipo: 'EFECTIVO',
      moneda: 'ARS',
      balanceInicial: 0,
      institucion: '',
      color: '#6172F3',
    },
  })

  const color = watch('color')
  const tipo = watch('tipo')
  const moneda = watch('moneda')

  useEffect(() => {
    if (!open) return
    if (cuenta) {
      reset({
        nombre: cuenta.nombre,
        tipo: cuenta.tipo,
        moneda: cuenta.moneda,
        balanceInicial: cuenta.balance,
        institucion: cuenta.institucion || '',
        color: cuenta.color || '#6172F3',
      })
    } else {
      reset({
        nombre: '',
        tipo: 'EFECTIVO',
        moneda: 'ARS',
        balanceInicial: 0,
        institucion: '',
        color: '#6172F3',
      })
    }
  }, [cuenta, open, reset])

  function onSubmit(data: CuentaFormData) {
    if (isEditing && cuenta) {
      actualizar.mutate(
        { id: cuenta.id, data: { nombre: data.nombre, moneda: data.moneda, institucion: data.institucion || null, color: data.color } },
        { onSuccess: () => onOpenChange(false) },
      )
    } else {
      crear.mutate(
        {
          nombre: data.nombre,
          tipo: data.tipo,
          moneda: data.moneda,
          balanceInicial: data.balanceInicial,
          institucion: data.institucion || undefined,
          color: data.color,
        },
        { onSuccess: () => onOpenChange(false) },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar cuenta' : 'Nueva cuenta'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos de la cuenta.' : 'Agrega una nueva cuenta para trackear tus finanzas.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              {...register('nombre')}
              placeholder="Ej: Banco Galicia"
            />
            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
          </div>

          {!isEditing && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de cuenta</Label>
                <Select value={tipo} onValueChange={(v) => setValue('tipo', v as TipoCuenta)}>
                  <SelectTrigger>
                    <SelectValue>
                      {(value: string) => {
                        if (!value) return 'Tipo'
                        return TIPOS_CUENTA[value as TipoCuenta]?.label ?? value
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_CUENTA_KEYS.map((key) => (
                      <SelectItem key={key} value={key}>
                        {TIPOS_CUENTA[key].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="institucion">Institucion</Label>
                <Input
                  id="institucion"
                  {...register('institucion')}
                  placeholder="Ej: BBVA, Brubank"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
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

            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="balance">Balance inicial</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  {...register('balanceInicial')}
                />
              </div>
            )}
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="institucion">Institucion (opcional)</Label>
              <Input
                id="institucion"
                {...register('institucion')}
                placeholder="Ej: BBVA, Brubank"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center gap-2">
              <label
                className="relative h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-input shadow-sm transition-colors hover:border-ring"
                style={{ backgroundColor: color }}
              >
                <input
                  type="color"
                  id="color"
                  value={color}
                  onChange={(e) => setValue('color', e.target.value)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </label>
              <Input
                value={color}
                onChange={(e) => setValue('color', e.target.value)}
                className="flex-1"
                maxLength={7}
              />
            </div>
            {errors.color && <p className="text-xs text-destructive">{errors.color.message}</p>}
          </div>

          <DialogFooter>
            <DialogClose>Cancelar</DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : isEditing ? 'Guardar' : 'Crear cuenta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
