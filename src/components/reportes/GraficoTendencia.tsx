import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTendenciaMensual } from '@/hooks/use-reportes'
import { formatMonto } from '@/lib/formatters'

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export default function GraficoTendencia() {
  const { data, isLoading } = useTendenciaMensual(12)

  const chartData = (data || []).map((item) => ({
    label: `${MESES_CORTOS[item.mes - 1]} ${item.anio.toString().slice(2)}`,
    Ingresos: item.ingresos,
    Gastos: item.gastos,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tendencia mensual</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-75 animate-pulse bg-muted rounded" />
        ) : chartData.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">Sin datos suficientes</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatMonto(v)} className="text-muted-foreground" />
              <Tooltip
                formatter={(value) => formatMonto(Number(value))}
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
              />
              <Legend />
              <Area type="monotone" dataKey="Ingresos" stroke="#12B76A" fill="#12B76A" fillOpacity={0.1} />
              <Area type="monotone" dataKey="Gastos" stroke="#F04438" fill="#F04438" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
