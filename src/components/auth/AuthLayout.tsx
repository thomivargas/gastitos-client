import type { ReactNode } from 'react'
import { Shield, Globe, Sparkles } from 'lucide-react'
import logoConTexto from '@/assets/logo_con_texto_r.png'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">

      {/* Panel izquierdo — branding */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-[#100a05]">
        {/* Gradient mesh */}
        <div className="absolute inset-0">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[60%] rounded-full bg-orange-600/20 blur-[120px] animate-[drift_20s_ease-in-out_infinite]" />
          <div className="absolute bottom-[-15%] right-[-5%] w-[55%] h-[50%] rounded-full bg-amber-500/15 blur-[100px] animate-[drift_25s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-orange-400/10 blur-[80px] animate-[drift_18s_ease-in-out_infinite_2s]" />
        </div>

        {/* Grilla sutil */}
        <div className="absolute inset-0 auth-grid-pattern opacity-[0.04]" />

        {/* Monedas flotantes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[12%] left-[15%] w-10 h-10 rounded-full border border-orange-400/20 flex items-center justify-center animate-[float_6s_ease-in-out_infinite]">
            <span className="text-orange-400/40 text-sm font-bold">$</span>
          </div>
          <div className="absolute top-[25%] right-[18%] w-7 h-7 rounded-full border border-amber-300/15 flex items-center justify-center animate-[float_8s_ease-in-out_infinite_1s]">
            <span className="text-amber-300/30 text-xs font-bold">$</span>
          </div>
          <div className="absolute bottom-[30%] left-[22%] w-8 h-8 rounded-full border border-orange-400/15 flex items-center justify-center animate-[float_7s_ease-in-out_infinite_3s]">
            <span className="text-orange-400/30 text-sm font-bold">$</span>
          </div>
          <div className="absolute bottom-[18%] right-[25%] w-6 h-6 rounded-full border border-amber-500/20 flex items-center justify-center animate-[float_9s_ease-in-out_infinite_2s]">
            <span className="text-amber-500/35 text-xs font-bold">$</span>
          </div>
        </div>

        {/* Contenido central */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-12">
          {/* Logo */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-orange-500/20 rounded-2xl blur-xl scale-150" />
            <div className="relative p-5 rounded-2xl bg-orange-500/10 border border-orange-400/20 backdrop-blur-sm">
              <img src={logoConTexto} alt="Gastitos" width={200} className="object-contain brightness-[5] saturate-0 opacity-90" />
            </div>
          </div>

          <p className="text-lg text-orange-100/50 max-w-xs text-center leading-relaxed">
            Tus finanzas personales, organizadas y bajo control.
          </p>

          {/* Feature pills */}
          <div className="mt-12 flex flex-col gap-3 w-full max-w-xs">
            {[
              { icon: Shield, label: '100% privado', desc: 'Tus datos, tu control' },
              { icon: Globe, label: 'Multi moneda', desc: 'ARS, USD' },
              { icon: Sparkles, label: 'Gratis siempre', desc: 'Sin costos ocultos' },
            ].map((feat, i) => (
              <div
                key={feat.label}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/3 border border-white/6 backdrop-blur-sm"
                style={{ animationDelay: `${i * 100 + 400}ms` }}
              >
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <feat.icon className="h-4 w-4 text-orange-400/80" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">{feat.label}</p>
                  <p className="text-xs text-white/40">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 px-12 pb-8">
          <p className="text-xs text-white/20 text-center">
            Hecho con cuidado para tus finanzas
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex items-center justify-center px-6 py-12 bg-background relative">
        {/* Línea superior en mobile */}
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-primary/0 via-primary/40 to-primary/0 lg:hidden" />

        <div className="w-full max-w-105 animate-slide-up-fade">
          {children}
        </div>
      </div>
    </div>
  )
}
