import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type * as importApi from '@/api/importacion.api'

interface Props {
  resultadoBancario?: importApi.ResultadoBancario
  onReset: () => void
}

export function PasoResultado({ resultadoBancario, onReset }: Props) {
  return (
    <div className="animate-slide-up-fade space-y-6">

      {/* Success header */}
      <div className="rounded-2xl border border-green-200 dark:border-green-900/60 bg-green-50/60 dark:bg-green-950/20 p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <div className="font-semibold text-green-900 dark:text-green-300">Importación completada</div>
          <div className="text-sm text-green-700/70 dark:text-green-400/60 mt-0.5">
            Las transacciones fueron agregadas y los balances actualizados.
          </div>
        </div>
      </div>

      {/* Stats del resultado */}
      {resultadoBancario && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border p-4 space-y-0.5">
            <div className="text-3xl font-bold tabular-nums">{resultadoBancario.importadas}</div>
            <div className="text-xs text-muted-foreground">transacciones importadas</div>
          </div>
          {resultadoBancario.excluidas > 0 && (
            <div className="rounded-2xl border border-dashed border-border p-4 space-y-0.5 opacity-60">
              <div className="text-3xl font-bold tabular-nums">{resultadoBancario.excluidas}</div>
              <div className="text-xs text-muted-foreground">cargos excluidos</div>
            </div>
          )}
          {resultadoBancario.periodo && (
            <div className="rounded-2xl border border-border p-4 space-y-0.5">
              <div className="text-xl font-bold">{resultadoBancario.periodo}</div>
              <div className="text-xs text-muted-foreground">período importado</div>
            </div>
          )}
        </div>
      )}

      {/* Conversiones USD */}
      {resultadoBancario && resultadoBancario.convertidas > 0 && (
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
            {resultadoBancario.convertidas} convertidas de USD a ARS
          </span>
        </div>
      )}

      {resultadoBancario?.errores && resultadoBancario.errores.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {resultadoBancario.errores.length} filas con errores fueron omitidas.
        </p>
      )}

      <div className="flex gap-3">
        <Button onClick={onReset} className="bg-foreground text-background hover:bg-foreground/85">
          Importar otro archivo
        </Button>
      </div>
    </div>
  )
}
