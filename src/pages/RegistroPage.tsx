import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router'
import { Eye, EyeOff, ArrowRight, PiggyBank, Check, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { useRegistro } from '@/hooks/use-auth'

const registroSchema = z.object({
  nombre: z.string().min(2, 'Minimo 2 caracteres').max(100),
  email: z.string().email('Email invalido'),
  password: z.string()
    .min(8, 'Minimo 8 caracteres')
    .regex(/[A-Z]/, 'Al menos una mayuscula')
    .regex(/[0-9]/, 'Al menos un numero'),
})

type RegistroFormData = z.infer<typeof registroSchema>

const PASSWORD_RULES = [
  { label: 'Minimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Una letra mayuscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Un numero', test: (p: string) => /[0-9]/.test(p) },
]

export default function RegistroPage() {
  const [showPassword, setShowPassword] = useState(false)
  const registro = useRegistro()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegistroFormData>({
    resolver: zodResolver(registroSchema),
    mode: 'onChange',
  })

  const password = watch('password', '')
  const passedRules = PASSWORD_RULES.filter(r => r.test(password)).length
  const strengthPercent = (passedRules / PASSWORD_RULES.length) * 100

  function onSubmit(data: RegistroFormData) {
    registro.mutate(data)
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
          <h2 className="text-2xl font-bold tracking-tight">Crea tu cuenta</h2>
          <p className="text-muted-foreground">
            Empeza a controlar tus finanzas en minutos
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="nombre" className="text-sm font-medium">
              Nombre
            </Label>
            <Input
              id="nombre"
              type="text"
              placeholder="Tu nombre"
              {...register('nombre')}
              autoComplete="name"
              autoFocus
              className="h-11 bg-muted/50 border-transparent focus:border-emerald-500/50 focus:bg-background transition-all duration-200 placeholder:text-muted-foreground/50"
            />
            {errors.nombre && (
              <p className="text-xs text-destructive mt-1 animate-slide-up-fade">{errors.nombre.message}</p>
            )}
          </div>

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
                autoComplete="new-password"
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

            {/* Indicador de fuerza mejorado */}
            {password.length > 0 && (
              <div className="space-y-2.5 pt-2 animate-slide-up-fade">
                {/* Barra de progreso continua */}
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${strengthPercent}%`,
                      backgroundColor: strengthPercent < 50
                        ? 'oklch(0.65 0.2 25)'
                        : strengthPercent < 100
                          ? 'oklch(0.75 0.15 85)'
                          : 'oklch(0.65 0.2 145)',
                    }}
                  />
                </div>

                {/* Checklist */}
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {PASSWORD_RULES.map((rule, i) => {
                    const passed = rule.test(password)
                    return (
                      <span
                        key={i}
                        className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${
                          passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground/60'
                        }`}
                      >
                        {passed ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Circle className="h-2.5 w-2.5" />
                        )}
                        {rule.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-emerald-600/20 active:scale-[0.98]"
            disabled={registro.isPending}
          >
            {registro.isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creando cuenta...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Crear cuenta
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

        {/* Link a login */}
        <p className="text-center text-sm text-muted-foreground">
          Ya tenes cuenta?{' '}
          <Link
            to="/login"
            className="text-emerald-600 dark:text-emerald-400 font-medium hover:text-emerald-700 dark:hover:text-emerald-300 underline-offset-4 hover:underline transition-colors"
          >
            Inicia sesion
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
