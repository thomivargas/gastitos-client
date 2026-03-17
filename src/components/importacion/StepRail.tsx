import { CheckCircle2 } from 'lucide-react'
import { type Modo, type Paso, FLUJO_GENERICO, FLUJO_BANCARIO, PASO_LABEL } from './types'

export function StepRail({ paso, modo }: { paso: Paso; modo: Modo }) {
  const flujo =
    paso === 'mapeo'
      ? FLUJO_GENERICO
      : paso === 'preview-bancario'
      ? FLUJO_BANCARIO
      : modo === 'bancario'
      ? FLUJO_BANCARIO
      : FLUJO_GENERICO

  const current = flujo.indexOf(paso)

  return (
    <div className="flex items-center gap-0">
      {flujo.map((p, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={p} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold
                  transition-all duration-300
                  ${done
                    ? 'bg-foreground text-background'
                    : active
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/40'
                    : 'bg-muted text-muted-foreground'
                  }
                `}
              >
                {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
                {PASO_LABEL[p]}
              </span>
            </div>
            {i < flujo.length - 1 && (
              <div className={`w-10 sm:w-16 h-px mb-4 mx-1 transition-colors duration-500 ${i < current ? 'bg-foreground/40' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
