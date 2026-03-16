import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Link } from 'react-router'
import { Eye, EyeOff, ArrowRight, PiggyBank } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { useLogin } from '@/hooks/use-auth'

const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(1, 'La contrasena es requerida'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const login = useLogin()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  function onSubmit(data: LoginFormData) {
    login.mutate(data)
  }

  return (
    <AuthLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 mb-6 lg:hidden">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <PiggyBank className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Gastitos</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Bienvenido de vuelta</h2>
          <p className="text-muted-foreground">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              {...register('email')}
              autoComplete="email"
              autoFocus
              className="h-11 bg-muted/50 border-transparent focus:border-emerald-500/50 focus:bg-background transition-all duration-200 placeholder:text-muted-foreground/50"
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1 animate-slide-up-fade">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">
              Contrasena
            </Label>
            <div className="relative group">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                autoComplete="current-password"
                className="h-11 pr-11 bg-muted/50 border-transparent focus:border-emerald-500/50 focus:bg-background transition-all duration-200 placeholder:text-muted-foreground/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors p-0.5 rounded"
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive mt-1 animate-slide-up-fade">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-emerald-600/20 active:scale-[0.98]"
            disabled={login.isPending}
          >
            {login.isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Ingresando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Iniciar sesion
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>

        {/* Separador */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/60" />
          </div>
        </div>

        {/* Link a registro */}
        <p className="text-center text-sm text-muted-foreground">
          No tenes cuenta?{' '}
          <Link
            to="/registro"
            className="text-emerald-600 dark:text-emerald-400 font-medium hover:text-emerald-700 dark:hover:text-emerald-300 underline-offset-4 hover:underline transition-colors"
          >
            Crea una gratis
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
