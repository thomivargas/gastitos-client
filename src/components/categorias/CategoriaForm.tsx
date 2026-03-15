import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { COLORES_CATEGORIAS } from '@/lib/constants'
import { useCrearCategoria, useActualizarCategoria } from '@/hooks/use-categorias'
import type { Categoria, ClasificacionCategoria } from '@/types'

const categoriaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(50),
  clasificacion: z.enum(['GASTO', 'INGRESO']),
  color: z.string().min(1),
  icono: z.string().max(50).optional(),
})

type CategoriaFormData = z.infer<typeof categoriaSchema>

interface CategoriaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoria?: Categoria | null
  padreId?: string
  clasificacionDefault?: ClasificacionCategoria
}

export function CategoriaForm({
  open,
  onOpenChange,
  categoria,
  padreId,
  clasificacionDefault = 'GASTO',
}: CategoriaFormProps) {
  const isEditing = !!categoria
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const isPending = crear.isPending || actualizar.isPending

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nombre: '',
      clasificacion: clasificacionDefault,
      color: COLORES_CATEGORIAS[0],
      icono: '',
    },
  })

  const clasificacion = watch('clasificacion')
  const color = watch('color')

  useEffect(() => {
    if (!open) return
    if (categoria) {
      reset({
        nombre: categoria.nombre,
        clasificacion: categoria.clasificacion,
        color: categoria.color || COLORES_CATEGORIAS[0],
        icono: categoria.icono || '',
      })
    } else {
      reset({
        nombre: '',
        clasificacion: clasificacionDefault,
        color: COLORES_CATEGORIAS[Math.floor(Math.random() * COLORES_CATEGORIAS.length)],
        icono: '',
      })
    }
  }, [categoria, clasificacionDefault, open, reset])

  function onSubmit(data: CategoriaFormData) {
    if (isEditing && categoria) {
      actualizar.mutate(
        { id: categoria.id, data: { nombre: data.nombre, color: data.color, icono: data.icono || undefined } },
        { onSuccess: () => onOpenChange(false) },
      )
    } else {
      crear.mutate(
        {
          nombre: data.nombre,
          clasificacion: data.clasificacion,
          color: data.color,
          icono: data.icono || undefined,
          padreId: padreId || undefined,
        },
        { onSuccess: () => onOpenChange(false) },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar categoria' : padreId ? 'Nueva subcategoria' : 'Nueva categoria'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos de la categoria.' : 'Crea una categoria para clasificar tus transacciones.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="cat-nombre">Nombre</Label>
            <Input
              id="cat-nombre"
              {...register('nombre')}
              placeholder="Ej: Alimentacion"
            />
            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
          </div>

          {!isEditing && !padreId && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Clasificacion</Label>
                <Select value={clasificacion} onValueChange={(v) => setValue('clasificacion', v as ClasificacionCategoria)}>
                  <SelectTrigger>
                    <SelectValue>
                      {(value: string) => {
                        if (!value) return 'Clasificacion'
                        return value === 'INGRESO' ? 'Ingreso' : 'Gasto'
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GASTO">Gasto</SelectItem>
                    <SelectItem value="INGRESO">Ingreso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-icono">Icono (opcional)</Label>
                <Input
                  id="cat-icono"
                  {...register('icono')}
                  placeholder="Ej: shopping-cart"
                />
              </div>
            </div>
          )}

          {(isEditing || padreId) && (
            <div className="space-y-2">
              <Label htmlFor="cat-icono">Icono (opcional)</Label>
              <Input
                id="cat-icono"
                {...register('icono')}
                placeholder="Ej: shopping-cart"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="rounded-lg border border-input/50 bg-muted/30 p-2.5">
              <div className="flex flex-wrap gap-2">
                {COLORES_CATEGORIAS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setValue('color', c)}
                    className="h-8 w-8 rounded-full border-2 transition-transform"
                    style={{
                      backgroundColor: c,
                      borderColor: color === c ? 'var(--foreground)' : 'transparent',
                      transform: color === c ? 'scale(1.15)' : undefined,
                    }}
                  />
                ))}
              </div>
            </div>
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
