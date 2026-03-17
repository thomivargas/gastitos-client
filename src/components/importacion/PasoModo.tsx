import { Table2, Building2, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Modo } from './types'
import type * as importApi from '@/api/importacion.api'

interface Props {
  modo: Modo
  onModoChange: (m: Modo) => void
  parsers: importApi.ParserInfo[]
  onContinuar: () => void
}

export function PasoModo({ modo, onModoChange, parsers, onContinuar }: Props) {
  return (
    <div className="space-y-5 animate-slide-up-fade">
      <p className="text-sm text-card-foreground">¿Qué tipo de archivo vas a importar?</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Genérico */}
        <button
          onClick={() => onModoChange('generico')}
          className={`
            group text-left p-5 rounded-2xl border-2 transition-all duration-200 relative overflow-hidden
            ${modo === 'generico'
              ? 'border-amber-500/60 bg-amber-50/60 dark:bg-amber-950/20'
              : 'border-border hover:border-border/80 hover:bg-muted/30'
            }
          `}
        >
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '16px 16px' }}
          />
          {modo === 'generico' && (
            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
              <CheckCircle2 className="h-3 w-3 text-white" />
            </div>
          )}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
            modo === 'generico' ? 'bg-amber-500/15 text-amber-600' : 'bg-muted text-muted-foreground group-hover:bg-accent'
          }`}>
            <Table2 className="h-5 w-5" />
          </div>
          <div className="font-semibold text-sm">CSV / Excel genérico</div>
          <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Cualquier archivo con columnas personalizadas. Mapeo manual.
          </div>
          <div className="flex gap-1 mt-3">
            {['.csv', '.xlsx', '.xls'].map(ext => (
              <span key={ext} className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-mono text-muted-foreground">{ext}</span>
            ))}
          </div>
        </button>

        {/* Bancario */}
        <button
          onClick={() => onModoChange('bancario')}
          className={`
            group text-left p-5 rounded-2xl border-2 transition-all duration-200 relative overflow-hidden
            ${modo === 'bancario'
              ? 'border-amber-500/60 bg-amber-50/60 dark:bg-amber-950/20'
              : 'border-border hover:border-border/80 hover:bg-muted/30'
            }
          `}
        >
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '16px 16px' }}
          />
          {modo === 'bancario' && (
            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
              <CheckCircle2 className="h-3 w-3 text-white" />
            </div>
          )}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
            modo === 'bancario' ? 'bg-amber-500/15 text-amber-600' : 'bg-muted text-muted-foreground group-hover:bg-accent'
          }`}>
            <Building2 className="h-5 w-5" />
          </div>
          <div className="font-semibold text-sm">Resumen bancario</div>
          <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Detección automática de columnas. Separa ARS y USD. Filtra cargos.
          </div>
          <div className="flex gap-1 mt-3">
            {parsers.map(p => p.banco).filter((v, i, a) => a.indexOf(v) === i).map(banco => (
              <span key={banco} className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-mono text-muted-foreground">{banco}</span>
            ))}
            {parsers.length === 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-mono text-muted-foreground">BBVA</span>
            )}
          </div>
        </button>
      </div>

      <div className="flex justify-end pt-1">
        <Button
          onClick={onContinuar}
          className="gap-2 bg-foreground text-background hover:bg-foreground/85 px-6"
        >
          Continuar <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
