import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTopGastos } from '@/hooks/use-reportes'
import { formatMonto, formatFechaCorta } from '@/lib/formatters'

interface TopGastosProps {
  desde?: string
  hasta?: string
}

export const TopGastos = memo(function TopGastos({ desde, hasta }: TopGastosProps) {
  const { data, isLoading } = useTopGastos(desde, hasta, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top gastos</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5">
                <div className="h-2.5 w-2.5 rounded-full shimmer" />
                <div className="flex-1 space-y-1">
                  <div className="h-3.5 w-24 rounded shimmer" />
                  <div className="h-2.5 w-32 rounded shimmer" />
                </div>
                <div className="h-4 w-20 rounded shimmer" />
              </div>
            ))}
          </div>
        ) : !data?.transacciones.length ? (
          <p className="text-muted-foreground text-center py-8">Sin gastos en este periodo</p>
        ) : (
          <ul className="space-y-2">
            {data.transacciones.map((t, i) => (
              <li key={t.id} className="flex items-center gap-3 py-1.5 stagger-item" style={{ animationDelay: `${i * 40}ms` }}>
                {t.categoria && (
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: t.categoria.color }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{t.descripcion}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFechaCorta(t.fecha)} · {t.cuenta.nombre}
                  </p>
                </div>
                <span className="text-sm font-semibold text-red-500 tabular-nums shrink-0">
                  -{formatMonto(t.monto, t.moneda)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
})
