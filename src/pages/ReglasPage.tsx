import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form'
import { z } from 'zod'
import { Plus, Trash2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { CategoriaSelect } from '@/components/CategoriaSelect'
import { useReglas, useCrearRegla, useEliminarRegla, useAplicarReglas } from '@/hooks/use-reglas'
import { useCategorias } from '@/hooks/use-categorias'

export default function ReglasPage() {
  const { data: reglas, isLoading } = useReglas()
  const eliminar = useEliminarRegla()
  const aplicar = useAplicarReglas()
  const [formOpen, setFormOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  return (
    <div className="space-y-6 page-transition">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reglas de categorizacion</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => aplicar.mutate()} disabled={aplicar.isPending}>
            <Zap className="h-4 w-4 mr-2" />
            Aplicar reglas
          </Button>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva regla
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse bg-muted rounded-lg" />
          ))}
        </div>
      ) : !reglas?.length ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No tenes reglas de categorizacion</p>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear la primera
          </Button>
        </div>
      ) : (
        <Card>
          <CardContent className="p-2 md:p-4 divide-y">
            {reglas.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-3 py-3 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{r.nombre}</p>
                    <Badge variant={r.activa ? 'default' : 'secondary'} className="text-[10px]">
                      {r.activa ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">/{r.patron}/</p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: r.categoria.color }}
                  />
                  <span className="text-sm text-muted-foreground">{r.categoria.nombre}</span>
                </div>

                <span className="text-xs text-muted-foreground">P:{r.prioridad}</span>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  onClick={() => setConfirmId(r.id)}
                  aria-label="Eliminar regla"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(open) => { if (!open) setConfirmId(null) }}
        onConfirm={() => { if (confirmId) eliminar.mutate(confirmId); setConfirmId(null) }}
        titulo="Eliminar regla"
        descripcion="Se eliminara esta regla de categorizacion."
      />
      <ReglaFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}

const reglaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100),
  patron: z.string().min(1, 'El patron es requerido').max(200),
  categoriaId: z.string().min(1, 'Selecciona una categoria'),
  prioridad: z.coerce.number().int().min(0).max(1000).default(0),
})

type ReglaFormData = z.infer<typeof reglaSchema>

function ReglaFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const crear = useCrearRegla()
  const { data: categorias = [] } = useCategorias()

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ReglaFormData>({
    resolver: formResolver(reglaSchema),
    defaultValues: {
      nombre: '',
      patron: '',
      categoriaId: '',
      prioridad: 0,
    },
  })

  const categoriaId = watch('categoriaId')

  useEffect(() => {
    if (!open) return
    reset({ nombre: '', patron: '', categoriaId: '', prioridad: 0 })
  }, [open, reset])

  function onSubmit(data: ReglaFormData) {
    crear.mutate(
      { nombre: data.nombre, patron: data.patron, categoriaId: data.categoriaId, prioridad: data.prioridad },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva regla</DialogTitle>
          <DialogDescription>Auto-categoriza transacciones cuya descripcion coincida con el patron.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input {...register('nombre')} placeholder="Ej: Supermercados" />
            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Patron (regex)</Label>
            <Input {...register('patron')} placeholder="Ej: super|mercado|carrefour" className="font-mono" />
            {errors.patron && <p className="text-xs text-destructive">{errors.patron.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <CategoriaSelect
                categorias={categorias}
                value={categoriaId}
                onValueChange={(v) => v && setValue('categoriaId', v)}
              />
              {errors.categoriaId && <p className="text-xs text-destructive">{errors.categoriaId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Input type="number" min="0" max="1000" {...register('prioridad')} />
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
