import { useEffect, useState } from 'react'
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
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select'
import { TIPOS_CUENTA, TIPOS_CUENTA_FORM, MONEDAS } from '@/lib/constants'
import { useCrearCuenta, useActualizarCuenta } from '@/hooks/use-cuentas'
import { useInstituciones } from '@/hooks/use-instituciones'
import { InstitucionForm } from './InstitucionForm'
import type { Cuenta, Institucion, TipoCuenta, TipoInstitucion } from '@/types'

const TIPOS_POR_INSTITUCION: Record<TipoInstitucion, TipoCuenta[]> = {
  BILLETERA_VIRTUAL: ['BILLETERA_VIRTUAL'],
  BANCO: ['BANCO_CORRIENTE', 'BANCO_AHORRO', 'TARJETA_CREDITO', 'INVERSION', 'PRESTAMO'],
  OTRA: ['BANCO_CORRIENTE', 'BANCO_AHORRO', 'TARJETA_CREDITO', 'INVERSION', 'PRESTAMO'],
}

const DEFAULT_TIPO_POR_INSTITUCION: Record<TipoInstitucion, TipoCuenta> = {
  BILLETERA_VIRTUAL: 'BILLETERA_VIRTUAL',
  BANCO: 'BANCO_CORRIENTE',
  OTRA: 'BANCO_CORRIENTE',
}

const TIPOS_CUENTA_FORM_ENUM = TIPOS_CUENTA_FORM as [TipoCuenta, ...TipoCuenta[]]

const cuentaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100),
  tipo: z.enum(TIPOS_CUENTA_FORM_ENUM),
  moneda: z.string().min(1),
  balanceInicial: z.coerce.number().default(0),
  institucionId: z.string().uuid().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color invalido').default('#6172F3'),
})

type CuentaFormData = z.infer<typeof cuentaSchema>

interface CuentaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cuenta?: Cuenta | null
  defaultInstitucion?: Institucion | null
}

export function CuentaForm({ open, onOpenChange, cuenta, defaultInstitucion }: CuentaFormProps) {
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
      institucionId: undefined,
      color: '#6172F3',
    },
  })

  const [institucionFormOpen, setInstitucionFormOpen] = useState(false)
  const { data: instituciones = [] } = useInstituciones()

  const color = watch('color')
  const tipo = watch('tipo')
  const moneda = watch('moneda')
  const nombre = watch('nombre')
  const institucionId = watch('institucionId')

  // Tipos de cuenta disponibles según la institución de contexto (solo en creación)
  const tiposDisponibles = !isEditing && defaultInstitucion
    ? TIPOS_POR_INSTITUCION[defaultInstitucion.tipo]
    : TIPOS_CUENTA_FORM

  // Solo EFECTIVO no tiene institución
  const mostrarInstitucion = tipo !== 'EFECTIVO'

  // Filtrar instituciones según el tipo de cuenta:
  // - BILLETERA_VIRTUAL → solo billeteras; resto → bancos + otras
  const tipoInstFiltro = tipo === 'BILLETERA_VIRTUAL' ? 'BILLETERA_VIRTUAL' : 'BANCO'
  const institucionesFiltradas = instituciones.filter(i => i.tipo === tipoInstFiltro)
  const institucionesOtras = tipo === 'BILLETERA_VIRTUAL' ? [] : instituciones.filter(i => i.tipo === 'OTRA')

  // Auto-sugerir nombre basado en tipo + moneda (solo en creación, solo si no fue editado manualmente)
  useEffect(() => {
    if (isEditing) return
    const esSugerencia = TIPOS_CUENTA_FORM.some(t => {
      const base = TIPOS_CUENTA[t].label
      return nombre === base || nombre.startsWith(`${base} (`)
    })
    if (!nombre || esSugerencia) {
      const base = TIPOS_CUENTA[tipo]?.label ?? ''
      setValue('nombre', moneda !== 'ARS' ? `${base} (${moneda})` : base)
    }
  }, [tipo, moneda]) // eslint-disable-line react-hooks/exhaustive-deps

  // Limpiar institución al cambiar de tipo si la nueva selección es incompatible
  useEffect(() => {
    if (!mostrarInstitucion) {
      setValue('institucionId', undefined)
    } else {
      // Si cambia entre banco↔billetera, limpiar para no quedar con una institución del tipo incorrecto
      const instActual = instituciones.find(i => i.id === institucionId)
      if (instActual && instActual.tipo !== tipoInstFiltro && instActual.tipo !== 'OTRA') {
        setValue('institucionId', undefined)
      }
    }
  }, [tipo]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return
    if (cuenta) {
      reset({
        nombre: cuenta.nombre,
        tipo: cuenta.tipo as TipoCuenta,
        moneda: cuenta.moneda,
        balanceInicial: cuenta.balance,
        institucionId: cuenta.institucion?.id || undefined,
        color: cuenta.color || '#6172F3',
      })
    } else {
      const tipoInicial = defaultInstitucion
        ? DEFAULT_TIPO_POR_INSTITUCION[defaultInstitucion.tipo]
        : 'EFECTIVO'
      reset({
        nombre: '',
        tipo: tipoInicial,
        moneda: 'ARS',
        balanceInicial: 0,
        institucionId: defaultInstitucion?.id ?? undefined,
        color: '#6172F3',
      })
    }
  }, [cuenta, open, reset])

  function onSubmit(data: CuentaFormData) {
    if (isEditing && cuenta) {
      actualizar.mutate(
        { id: cuenta.id, data: { nombre: data.nombre, moneda: data.moneda, institucionId: data.institucionId || null, color: data.color } },
        { onSuccess: () => onOpenChange(false) },
      )
    } else {
      crear.mutate(
        {
          nombre: data.nombre,
          tipo: data.tipo,
          moneda: data.moneda,
          balanceInicial: data.balanceInicial,
          institucionId: data.institucionId || undefined,
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
              placeholder={TIPOS_CUENTA[tipo]?.label ?? 'Nombre de la cuenta'}
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
                    {tiposDisponibles.map((key) => (
                      <SelectItem key={key} value={key}>
                        {TIPOS_CUENTA[key].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {mostrarInstitucion && (
                <div className="space-y-2">
                  <Label>Institución</Label>
                  <Select
                    value={institucionId ?? ''}
                    onValueChange={(v) => {
                      if (v === '__nueva__') { setInstitucionFormOpen(true); return }
                      setValue('institucionId', v || undefined)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sin entidad">
                        {(value: string) => value
                          ? (instituciones.find(i => i.id === value)?.nombre ?? value)
                          : 'Sin entidad'
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin entidad</SelectItem>
                      {institucionesFiltradas.length > 0 && (
                        <SelectGroup>
                          <SelectLabel>{tipo === 'BILLETERA_VIRTUAL' ? 'Billeteras virtuales' : 'Bancos'}</SelectLabel>
                          {institucionesFiltradas.map(i => (
                            <SelectItem key={i.id} value={i.id}>{i.nombre}</SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      {institucionesOtras.length > 0 && (
                        <SelectGroup>
                          <SelectLabel>Otras</SelectLabel>
                          {institucionesOtras.map(i => (
                            <SelectItem key={i.id} value={i.id}>{i.nombre}</SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      <SelectItem value="__nueva__" className="text-primary font-medium">+ Nueva entidad...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
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

          {isEditing && mostrarInstitucion && (
            <div className="space-y-2">
              <Label>Institución (opcional)</Label>
              <Select
                value={institucionId ?? ''}
                onValueChange={(v) => {
                  if (v === '__nueva__') { setInstitucionFormOpen(true); return }
                  setValue('institucionId', v || undefined)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin entidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin entidad</SelectItem>
                  {institucionesFiltradas.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Bancos</SelectLabel>
                      {institucionesFiltradas.map(i => (
                        <SelectItem key={i.id} value={i.id}>{i.nombre}</SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {institucionesOtras.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Otras</SelectLabel>
                      {institucionesOtras.map(i => (
                        <SelectItem key={i.id} value={i.id}>{i.nombre}</SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  <SelectItem value="__nueva__" className="text-primary font-medium">+ Nueva entidad...</SelectItem>
                </SelectContent>
              </Select>
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
        <InstitucionForm
          open={institucionFormOpen}
          onOpenChange={setInstitucionFormOpen}
          onSuccess={(inst) => setValue('institucionId', inst.id)}
        />
      </DialogContent>
    </Dialog>
  )
}
