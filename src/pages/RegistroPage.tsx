import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router'
import { Eye, EyeOff, UserPlus, PiggyBank, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
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
  { label: 'Una mayuscula', test: (p: string) => /[A-Z]/.test(p) },
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

  function onSubmit(data: RegistroFormData) {
    registro.mutate(data)
  }

  return (
    <AuthLayout>
      <Card className="border-0 shadow-lg lg:shadow-none lg:border">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-2 lg:hidden">
            <PiggyBank className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold">Gastitos</span>
          </div>
          <h2 className="text-xl font-semibold">Crear cuenta</h2>
          <p className="text-sm text-muted-foreground">Empeza a controlar tus finanzas</p>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Tu nombre"
                {...register('nombre')}
                autoComplete="name"
                autoFocus
              />
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                {...register('email')}
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contrasena</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Indicador visual de fuerza */}
              {password.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-1">
                    {PASSWORD_RULES.map((rule, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          rule.test(password) ? 'bg-green-500' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <ul className="space-y-0.5">
                    {PASSWORD_RULES.map((rule, i) => {
                      const passed = rule.test(password)
                      return (
                        <li key={i} className={`flex items-center gap-1.5 text-xs ${passed ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          {rule.label}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={registro.isPending}
            >
              {registro.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creando cuenta...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Crear cuenta
                </span>
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              Ya tenes cuenta?{' '}
              <Link to="/login" className="text-primary font-medium underline-offset-4 hover:underline">
                Inicia sesion
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </AuthLayout>
  )
}
