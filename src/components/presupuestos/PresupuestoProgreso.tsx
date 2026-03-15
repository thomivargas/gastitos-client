import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProgresoPresupuesto } from '@/hooks/use-presupuestos'
import { formatMonto, formatPorcentaje } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface PresupuestoProgresoProps {
  presupuestoId: string
  moneda?: string
}

export function PresupuestoProgreso({ presupuestoId, moneda = 'ARS' }: PresupuestoProgresoProps) {
  const { data, isLoading } = useProgresoPresupuesto(presupuestoId)

  if (isLoading) {
    return <div className="h-64 animate-pulse bg-muted rounded-lg" />
  }

  if (!data) return null

  const { resumen, categorias } = data

  return (
    <div className="space-y-6">
      {/* Resumen general */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progreso general</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Gastado</span>
              <span className="font-medium">
                {formatMonto(resumen.gastoReal, moneda)} / {formatMonto(resumen.gastoPresupuestado, moneda)}
              </span>
            </div>
            <ProgressBar porcentaje={resumen.gastoPorcentaje} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Restante</p>
              <p className={cn('font-semibold', resumen.gastoRestante >= 0 ? 'text-green-600' : 'text-red-500')}>
                {formatMonto(resumen.gastoRestante, moneda)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Ahorro real</p>
              <p className={cn('font-semibold', resumen.ahorroReal >= 0 ? 'text-green-600' : 'text-red-500')}>
                {formatMonto(resumen.ahorroReal, moneda)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progreso por categoria */}
      {categorias.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por categoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categorias.map((cat) => (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.categoria.color }}
                    />
                    <span className="font-medium">{cat.categoria.nombre}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {formatMonto(cat.gastoReal, moneda)} / {formatMonto(cat.montoPresupuestado, moneda)}
                    {cat.excedido && <span className="text-red-500 ml-1">⚠</span>}
                  </span>
                </div>
                <ProgressBar
                  porcentaje={cat.porcentaje}
                  color={cat.excedido ? 'bg-red-500' : undefined}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formatPorcentaje(cat.porcentaje)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ProgressBar({ porcentaje, color }: { porcentaje: number; color?: string }) {
  const pct = Math.min(Math.max(porcentaje, 0), 100)
  const isOver = porcentaje > 100

  return (
    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
      <div
        className={cn(
          'h-full rounded-full transition-all',
          color || (isOver ? 'bg-red-500' : 'bg-primary'),
        )}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  )
}
