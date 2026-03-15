import { useState, lazy, Suspense } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { TopGastos } from '@/components/reportes/TopGastos'

const GraficoTendencia = lazy(() => import('@/components/reportes/GraficoTendencia'))
const GraficoCategoria = lazy(() => import('@/components/reportes/GraficoCategoria'))
const FlujoCaja = lazy(() => import('@/components/reportes/FlujoCaja'))

export default function ReportesPage() {
  const now = new Date()
  const primerDiaMes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const hoy = now.toISOString().split('T')[0]

  const [desde, setDesde] = useState(primerDiaMes)
  const [hasta, setHasta] = useState(hoy)
  const [agrupacion, setAgrupacion] = useState('mes')

  return (
    <div className="space-y-6 page-transition">
      <h1 className="text-2xl font-bold">Reportes</h1>

      {/* Filtros de periodo */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1">
          <Label>Desde</Label>
          <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="w-[160px]" />
        </div>
        <div className="space-y-1">
          <Label>Hasta</Label>
          <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="w-[160px]" />
        </div>
        <div className="space-y-1">
          <Label>Agrupacion</Label>
          <Select value={agrupacion} onValueChange={(v) => v && setAgrupacion(v)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue>
                {(value: string) => {
                  if (!value) return 'Agrupacion'
                  const labels: Record<string, string> = { dia: 'Diaria', semana: 'Semanal', mes: 'Mensual' }
                  return labels[value] ?? value
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dia">Diaria</SelectItem>
              <SelectItem value="semana">Semanal</SelectItem>
              <SelectItem value="mes">Mensual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Suspense fallback={
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 rounded-lg shimmer" />
          <div className="h-72 rounded-lg shimmer" />
        </div>
      }>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GraficoTendencia />
          <GraficoCategoria desde={desde} hasta={hasta} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FlujoCaja desde={desde} hasta={hasta} agrupacion={agrupacion} />
          <TopGastos desde={desde} hasta={hasta} />
        </div>
      </Suspense>
    </div>
  )
}
