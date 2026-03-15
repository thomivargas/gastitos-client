import { memo } from 'react'
import { useNavigate } from 'react-router'
import { ArrowRight, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTransacciones } from '@/hooks/use-transacciones'
import { formatMonto, formatFechaCorta } from '@/lib/formatters'

export const UltimasTransacciones = memo(function UltimasTransacciones() {
  const navigate = useNavigate()
  const { data, isLoading } = useTransacciones({ limit: 5, page: 1 })
  const transacciones = data?.data || []

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base">Ultimas transacciones</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('/transacciones')}>
          Ver todas
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5">
                <div className="h-4 w-4 rounded-full shimmer" />
                <div className="h-3 w-10 rounded shimmer" />
                <div className="h-3 flex-1 rounded shimmer" />
                <div className="h-4 w-20 rounded shimmer" />
              </div>
            ))}
          </div>
        ) : transacciones.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No hay transacciones aun</p>
        ) : (
          <ul className="space-y-1">
            {transacciones.map((t, i) => {
              const isIngreso = t.tipo === 'INGRESO'
              return (
                <li key={t.id} className="flex items-center gap-3 py-1.5 stagger-item" style={{ animationDelay: `${i * 40}ms` }}>
                  <span className={isIngreso ? 'text-green-600' : 'text-red-500'}>
                    {isIngreso ? (
                      <ArrowUpCircle className="h-4 w-4" />
                    ) : (
                      <ArrowDownCircle className="h-4 w-4" />
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground w-10 shrink-0">
                    {formatFechaCorta(t.fecha)}
                  </span>
                  <span className="flex-1 text-sm truncate">{t.descripcion}</span>
                  <span className={`text-sm font-semibold tabular-nums ${isIngreso ? 'text-green-600' : 'text-red-500'}`}>
                    {isIngreso ? '+' : '-'}{formatMonto(t.monto, t.moneda)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
})
