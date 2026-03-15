import type { ReactNode } from 'react'
import { PiggyBank } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Panel izquierdo — branding */}
      <div className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="auth-pattern absolute inset-0 opacity-30" />
        <div className="relative z-10 flex flex-col items-center gap-6 px-12 text-center">
          <div className="p-4 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm">
            <PiggyBank className="h-16 w-16" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Gastitos</h1>
          <p className="text-lg text-primary-foreground/80 max-w-sm">
            Tus finanzas personales, organizadas y bajo control.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold">100%</p>
              <p className="text-xs text-primary-foreground/60">Privado</p>
            </div>
            <div>
              <p className="text-2xl font-bold">Multi</p>
              <p className="text-xs text-primary-foreground/60">Moneda</p>
            </div>
            <div>
              <p className="text-2xl font-bold">Gratis</p>
              <p className="text-xs text-primary-foreground/60">Siempre</p>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex items-center justify-center px-4 py-12 bg-background">
        <div className="w-full max-w-md animate-slide-up-fade">
          {children}
        </div>
      </div>
    </div>
  )
}
