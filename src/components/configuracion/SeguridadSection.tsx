import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { extractApiError } from '@/lib/utils'
import * as authApi from '@/api/auth.api'

const passwordSchema = z.object({
  passwordActual: z.string().min(1, 'Ingresa tu contrasena actual'),
  passwordNueva: z.string().min(8, 'Minimo 8 caracteres'),
})

type PasswordFormData = z.infer<typeof passwordSchema>

export function SeguridadSection() {
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const cambiarPassword = useMutation({
    mutationFn: authApi.cambiarPassword,
    onSuccess: () => {
      toast.success('Contrasena cambiada')
      passwordForm.reset()
    },
    onError: (e) => toast.error(extractApiError(e, 'Error al cambiar contrasena')),
  })

  return (
    <div className="space-y-4">
      <h3 className="text-base font-medium">Cambiar contrasena</h3>
      <form onSubmit={passwordForm.handleSubmit((data) => cambiarPassword.mutate(data))} className="space-y-4">
        <div className="space-y-2">
          <Label>Contrasena actual</Label>
          <Input type="password" {...passwordForm.register('passwordActual')} />
          {passwordForm.formState.errors.passwordActual && (
            <p className="text-xs text-destructive">{passwordForm.formState.errors.passwordActual.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Nueva contrasena</Label>
          <Input type="password" {...passwordForm.register('passwordNueva')} />
          {passwordForm.formState.errors.passwordNueva && (
            <p className="text-xs text-destructive">{passwordForm.formState.errors.passwordNueva.message}</p>
          )}
        </div>
        <Button
          type="submit"
          variant="outline"
          disabled={cambiarPassword.isPending}
        >
          Cambiar contrasena
        </Button>
      </form>
    </div>
  )
}
