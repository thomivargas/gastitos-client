import { TrendingUp, TrendingDown, PiggyBank, Percent } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useResumenMensual } from '@/hooks/use-reportes'
import { formatMonto } from '@/lib/formatters'

interface ResumenMensualProps {
  anio: number
  mes: number
  moneda?: string
}

export function ResumenMensual({ anio, mes, moneda = 'ARS' }: ResumenMensualProps) {
  const { data, isLoading } = useResumenMensual(anio, mes)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-16 animate-pulse bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) return null

  const cards = [
    {
      label: 'Ingresos',
      value: formatMonto(data.ingresos.total, moneda),
      sub: `${data.ingresos.cantidad} transacciones`,
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      label: 'Gastos',
      value: formatMonto(data.gastos.total, moneda),
      sub: `${data.gastos.cantidad} transacciones`,
      icon: TrendingDown,
      color: 'text-red-500',
    },
    {
      label: 'Ahorro neto',
      value: formatMonto(data.ahorroNeto, moneda),
      sub: data.ahorroNeto >= 0 ? 'Superavit' : 'Deficit',
      icon: PiggyBank,
      color: data.ahorroNeto >= 0 ? 'text-green-600' : 'text-red-500',
    },
    {
      label: 'Tasa de ahorro',
      value: `${Math.round(data.tasaAhorro * 100)}%`,
      sub: 'del ingreso',
      icon: Percent,
      color: 'text-blue-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, icon: Icon, color }) => (
        <Card key={label}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`p-2 rounded-lg bg-muted ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-lg font-semibold">{value}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
