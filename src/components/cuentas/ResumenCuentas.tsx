import { Wallet, TrendingUp, TrendingDown, Scale } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useResumenCuentas } from '@/hooks/use-cuentas'
import { formatMonto } from '@/lib/formatters'

export function ResumenCuentas() {
  const { data, isLoading } = useResumenCuentas()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg shimmer" />
                <div className="space-y-2">
                  <div className="h-3 w-20 rounded shimmer" />
                  <div className="h-5 w-24 rounded shimmer" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) return null

  const cards = [
    {
      label: 'Patrimonio neto',
      value: formatMonto(data.patrimonioNeto, data.moneda),
      icon: Scale,
      iconBg: 'bg-primary/10 dark:bg-primary/20',
      color: 'text-primary',
    },
    {
      label: 'Total activos',
      value: formatMonto(data.totalActivos, data.moneda),
      icon: TrendingUp,
      iconBg: 'bg-green-100 dark:bg-green-950/40',
      color: 'text-green-600',
    },
    {
      label: 'Total pasivos',
      value: formatMonto(data.totalPasivos, data.moneda),
      icon: TrendingDown,
      iconBg: 'bg-red-100 dark:bg-red-950/40',
      color: 'text-red-500',
    },
    {
      label: 'Cuentas activas',
      value: data.cantidadCuentas.toString(),
      icon: Wallet,
      iconBg: 'bg-blue-100 dark:bg-blue-950/40',
      color: 'text-blue-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color, iconBg }, i) => (
        <Card key={label} className="stagger-item" style={{ animationDelay: `${i * 50}ms` }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`p-2.5 rounded-lg ${iconBg} ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
              <p className="text-lg font-bold tabular-nums">{value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
