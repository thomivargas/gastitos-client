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
import { useCrearInstitucion, useActualizarInstitucion } from '@/hooks/use-instituciones'
import type { Institucion, TipoInstitucion } from '@/types'

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100),
  tipo: z.enum(['BANCO', 'BILLETERA_VIRTUAL', 'OTRA']),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color invalido').default('#6172F3'),
})

type InstitucionFormData = z.infer<typeof schema>

interface InstitucionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  institucion?: Institucion | null
  onSuccess?: (institucion: Institucion) => void
}

const TIPO_OPTIONS: { value: TipoInstitucion; label: string }[] = [
  { value: 'BANCO', label: 'Banco' },
  { value: 'BILLETERA_VIRTUAL', label: 'Billetera virtual' },
  { value: 'OTRA', label: 'Otra' },
]

export function InstitucionForm({ open, onOpenChange, institucion, onSuccess }: InstitucionFormProps) {
  const isEditing = !!institucion
  const crear = useCrearInstitucion()
  const actualizar = useActualizarInstitucion()
  const isPending = crear.isPending || actualizar.isPending

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<InstitucionFormData>({
    resolver: formResolver(schema),
    defaultValues: {
      nombre: '',
      tipo: 'BANCO',
      color: '#6172F3',
    },
  })

  const color = watch('color')
  const tipo = watch('tipo')

  useEffect(() => {
    if (!open) return
    if (institucion) {
      reset({
        nombre: institucion.nombre,
        tipo: institucion.tipo,
        color: institucion.color || '#6172F3',
      })
    } else {
      reset({
        nombre: '',
        tipo: 'BANCO',
        color: '#6172F3',
      })
    }
  }, [institucion, open, reset])

  function onSubmit(data: InstitucionFormData) {
    if (isEditing && institucion) {
      actualizar.mutate(
        { id: institucion.id, data: { nombre: data.nombre, tipo: data.tipo, color: data.color } },
        {
          onSuccess: (result) => {
            onSuccess?.(result)
            onOpenChange(false)
          },
        },
      )
    } else {
      crear.mutate(
        { nombre: data.nombre, tipo: data.tipo, color: data.color },
        {
          onSuccess: (result) => {
            onSuccess?.(result)
            onOpenChange(false)
          },
        },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar entidad' : 'Nueva entidad'}</DialogTitle>
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

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setValue('tipo', v as TipoInstitucion)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPO_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            <DialogClose>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : isEditing ? 'Guardar' : 'Crear entidad'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
