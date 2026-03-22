import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth.store'
import { extractApiError } from '@/lib/utils'
import * as usuarioApi from '@/api/usuario.api'

const perfilSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100),
  moneda: z.string().min(1),
})

type PerfilFormData = z.infer<typeof perfilSchema>

export function PerfilSection() {
  const usuario = useAuthStore((s) => s.usuario)
  const setUsuario = useAuthStore((s) => s.setUsuario)

  const perfilForm = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nombre: usuario?.nombre || '',
      moneda: usuario?.moneda || 'ARS',
    },
  })

  const actualizar = useMutation({
    mutationFn: (data: PerfilFormData) => usuarioApi.actualizarPerfil(data),
    onSuccess: (data) => {
      setUsuario(data)
      toast.success('Perfil actualizado')
    },
    onError: (e) => toast.error(extractApiError(e, 'Error al actualizar')),
  })

  return (
    <div className="space-y-4">
      <h3 className="text-base font-medium">Perfil</h3>
      <form onSubmit={perfilForm.handleSubmit((data) => actualizar.mutate(data))} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 sm:items-end">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={usuario?.email || ''} disabled />
          </div>
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input {...perfilForm.register('nombre')} />
            {perfilForm.formState.errors.nombre && (
              <p className="text-xs text-destructive">{perfilForm.formState.errors.nombre.message}</p>
            )}
          </div>
        </div>
        <Button type="submit" disabled={actualizar.isPending}>
          {actualizar.isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </form>
    </div>
  )
}
