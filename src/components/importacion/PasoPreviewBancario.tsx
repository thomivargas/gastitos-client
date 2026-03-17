import { Ban, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type * as importApi from '@/api/importacion.api'

interface Props {
  previewBancario: importApi.PreviewBancarioData
  excluirCargos: boolean
  loading: boolean
  onImportar: () => void
  onCancelar: () => void
}

export function PasoPreviewBancario({ previewBancario, excluirCargos, loading, onImportar, onCancelar }: Props) {
  const aImportar = previewBancario.totalTransacciones - (excluirCargos ? previewBancario.metadatos.filasExcluidas : 0)

  return (
    <div className="space-y-5 animate-slide-up-fade">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border p-4 space-y-0.5">
          <div className="text-2xl font-bold tabular-nums">{previewBancario.totalTransacciones}</div>
          <div className="text-xs text-muted-foreground">transacciones</div>
        </div>
        {previewBancario.metadatos.periodo && (
          <div className="rounded-2xl border border-border p-4 space-y-0.5">
            <div className="text-lg font-bold">{previewBancario.metadatos.periodo}</div>
            <div className="text-xs text-muted-foreground">período</div>
          </div>
        )}
        {(() => {
          const ars = previewBancario.transacciones.filter(t => t.moneda === 'ARS' && !t.excluida).length
          return (
            <>
              {ars > 0 && (
                <div className="rounded-2xl border border-border p-4 space-y-0.5">
                  <div className="text-2xl font-bold tabular-nums">{aImportar}</div>
                  <div className="text-xs text-muted-foreground">a importar</div>
                </div>
              )}
              {excluirCargos && previewBancario.metadatos.filasExcluidas > 0 && (
                <div className="rounded-2xl border border-dashed border-border p-4 space-y-0.5 opacity-60">
                  <div className="text-2xl font-bold tabular-nums">{previewBancario.metadatos.filasExcluidas}</div>
                  <div className="text-xs text-muted-foreground">cargos excluidos</div>
                </div>
              )}
            </>
          )
        })()}
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="px-4 py-3 bg-muted/40 border-b border-border flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Vista previa — primeras {previewBancario.transacciones.length} transacciones
          </p>
          <div className="flex gap-1.5">
            {(['ARS', 'USD'] as const).map(m => {
              const count = previewBancario.transacciones.filter(t => t.moneda === m && !t.excluida).length
              if (!count) return null
              return (
                <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                  {count} {m}
                </span>
              )
            })}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase tracking-wide">Fecha</th>
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase tracking-wide">Descripción</th>
                <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground uppercase tracking-wide">Monto</th>
                <th className="px-4 py-2.5 text-center font-semibold text-muted-foreground uppercase tracking-wide">Moneda</th>
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase tracking-wide">Notas</th>
              </tr>
            </thead>
            <tbody>
              {previewBancario.transacciones.map((t, i) => (
                <tr
                  key={i}
                  className={`
                    border-b border-border/50 last:border-0 transition-colors
                    ${t.excluida
                      ? 'opacity-30'
                      : i % 2 !== 0 ? 'bg-muted/20' : ''
                    }
                  `}
                >
                  <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground tabular-nums">
                    {new Date(t.fecha).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-2.5 max-w-50 truncate">
                    {t.excluida && <Ban className="inline h-3 w-3 mr-1 text-muted-foreground" />}
                    {t.descripcion}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums font-medium">
                    {t.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`
                      inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold
                      ${t.moneda === 'USD'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                      }
                    `}>
                      {t.moneda}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground italic">
                    {t.notas ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button onClick={onCancelar} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← Cancelar
        </button>
        <Button
          onClick={onImportar}
          disabled={loading}
          className="gap-2 bg-foreground text-background hover:bg-foreground/85 px-6"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border border-background/40 border-t-background rounded-full animate-spin" />
              Importando…
            </>
          ) : (
            <>
              Importar {aImportar} transacciones
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
