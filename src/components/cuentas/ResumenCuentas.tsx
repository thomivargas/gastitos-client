import { useResumenCuentas } from '@/hooks/use-cuentas'
import { formatMonto } from '@/lib/formatters'
import { NumberTicker } from '@/components/ui/number-ticker'
import { BorderBeam } from '@/components/ui/border-beam'
import { TrendingUp, TrendingDown, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ResumenCuentas() {
  const { data, isLoading } = useResumenCuentas()

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 animate-pulse">
        <div className="flex items-start gap-8 flex-wrap">
          <div className="space-y-2 flex-1">
            <div className="h-2.5 w-24 bg-muted rounded-full" />
            <div className="h-8 w-52 bg-muted rounded-lg" />
            <div className="h-2 w-32 bg-muted rounded-full mt-1" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 hidden sm:block">
              <div className="h-2.5 w-16 bg-muted rounded-full" />
              <div className="h-5 w-28 bg-muted rounded-lg" />
            </div>
          ))}
        </div>
        <div className="mt-4 h-1.5 w-full bg-muted rounded-full" />
      </div>
    )
  }

  if (!data) return null

  const totalBruto = data.totalActivos + Math.abs(data.totalPasivos)
  const activosRatio = totalBruto > 0 ? (data.totalActivos / totalBruto) * 100 : 100
  const isPosNeto = data.patrimonioNeto >= 0

  return (
    <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
      <BorderBeam size={280} duration={14} colorFrom="#6172F3" colorTo="#36BFFA" borderWidth={1.5} />

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          {/* Patrimonio neto — hero stat */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">
              Patrimonio neto
            </p>
            <p className={cn(
              'text-2xl font-bold tabular-nums tracking-tight',
              isPosNeto ? 'text-foreground' : 'text-red-500 dark:text-red-400',
            )}>
              {formatMonto(data.patrimonioNeto, data.moneda)}
            </p>
            <div className="flex items-center gap-1 mt-1.5">
              {isPosNeto
                ? <TrendingUp className="h-3 w-3 text-emerald-500 shrink-0" />
                : <TrendingDown className="h-3 w-3 text-red-400 shrink-0" />
              }
              <span className={cn(
                'text-[10px] font-medium',
                isPosNeto ? 'text-emerald-500' : 'text-red-400',
              )}>
                {isPosNeto ? 'Activo neto positivo' : 'Pasivos superan activos'}
              </span>
            </div>
          </div>

          <div className="h-12 w-px bg-border hidden sm:block shrink-0" />

          {/* Activos */}
          <div className="shrink-0">
            <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">
              Activos
            </p>
            <p className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatMonto(data.totalActivos, data.moneda)}
            </p>
          </div>

          {/* Pasivos */}
          <div className="shrink-0">
            <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">
              Pasivos
            </p>
            <p className="text-sm font-semibold tabular-nums text-red-500 dark:text-red-400">
              {formatMonto(Math.abs(data.totalPasivos), data.moneda)}
            </p>
          </div>

          <div className="h-12 w-px bg-border hidden sm:block shrink-0" />

          {/* Cuentas activas */}
          <div className="shrink-0">
            <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1 flex items-center gap-1">
              <LayoutGrid className="h-3 w-3" />
              Cuentas
            </p>
            <p className="text-xl font-bold tabular-nums">
              <NumberTicker value={data.cantidadCuentas} className="text-foreground" />
            </p>
          </div>
        </div>

        {/* Activos vs Pasivos ratio bar */}
        {totalBruto > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-muted-foreground">
                <span className="text-emerald-500 font-semibold">{activosRatio.toFixed(0)}%</span>{' '}
                activos
              </span>
              <span className="text-[10px] text-muted-foreground">
                pasivos{' '}
                <span className="text-red-400 font-semibold">{(100 - activosRatio).toFixed(0)}%</span>
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000 ease-out"
                style={{ width: `${activosRatio}%` }}
              />
              {data.totalPasivos > 0 && (
                <div
                  className="h-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-1000 ease-out"
                  style={{ width: `${100 - activosRatio}%` }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
