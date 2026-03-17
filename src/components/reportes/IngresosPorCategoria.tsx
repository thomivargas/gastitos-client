import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useIngresosPorCategoria } from '@/hooks/use-reportes'
import { formatMonto } from '@/lib/formatters'

interface IngresosPorCategoriaProps {
  desde?: string
  hasta?: string
}

export default function IngresosPorCategoria({ desde, hasta }: IngresosPorCategoriaProps) {
  const { data, isLoading } = useIngresosPorCategoria(desde, hasta)

  const chartData = (data?.categorias || []).map((item) => ({
    nombre: item.categoria?.nombre || 'Sin categoria',
    valor: item.monto,
    color: item.categoria?.color || '#16a34a',
    porcentaje: item.porcentaje,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ingresos por categoria</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-75 animate-pulse bg-muted rounded" />
        ) : chartData.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">Sin ingresos en este periodo</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="valor"
                nameKey="nombre"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.nombre} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatMonto(Number(value))}
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
