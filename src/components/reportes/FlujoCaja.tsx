import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFlujoDeCaja } from '@/hooks/use-reportes'
import { formatMonto } from '@/lib/formatters'

interface FlujoCajaProps {
  desde?: string
  hasta?: string
  agrupacion?: string
}

export default function FlujoCaja({ desde, hasta, agrupacion }: FlujoCajaProps) {
  const { data, isLoading } = useFlujoDeCaja(desde, hasta, agrupacion)

  const chartData = (data?.flujo || []).map((item) => ({
    periodo: item.periodo,
    Ingresos: item.ingresos,
    Gastos: item.gastos,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Flujo de caja</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] animate-pulse bg-muted rounded" />
        ) : chartData.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">Sin datos en este periodo</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatMonto(v)} />
              <Tooltip formatter={(value) => formatMonto(Number(value))} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }} />
              <Legend />
              <Bar dataKey="Ingresos" fill="#12B76A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Gastos" fill="#F04438" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
