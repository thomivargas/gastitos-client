import { useState, lazy, Suspense } from 'react'
import { Download, TrendingUp, TrendingDown, Minus, Hash } from 'lucide-react'
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
import { useCuentas } from '@/hooks/use-cuentas'
import { useGastosPorCategoria, useIngresosPorCategoria } from '@/hooks/use-reportes'
import * as reportesApi from '@/api/reportes.api'

const GraficoTendencia = lazy(() => import('@/components/reportes/GraficoTendencia'))
const GraficoCategoria = lazy(() => import('@/components/reportes/GraficoCategoria'))
const IngresosPorCategoria = lazy(() => import('@/components/reportes/IngresosPorCategoria'))
const FlujoCaja = lazy(() => import('@/components/reportes/FlujoCaja'))

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-base font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  )
}

function formatCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toFixed(0)
}

export default function ReportesPage() {
  const now = new Date()
  const primerDiaMes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const hoy = now.toISOString().split('T')[0]!

  const [desde, setDesde] = useState(primerDiaMes)
  const [hasta, setHasta] = useState(hoy)
  const [agrupacion, setAgrupacion] = useState('mes')
  const [cuentaId, setCuentaId] = useState('')

  const { data: cuentasData } = useCuentas({ estado: 'ACTIVA', limit: 50 })
  const cuentas = cuentasData?.data || []

  const { data: gastos } = useGastosPorCategoria(desde, hasta)
  const { data: ingresos } = useIngresosPorCategoria(desde, hasta)

  const totalGastos = gastos?.total ?? 0
  const totalIngresos = ingresos?.total ?? 0
  const ahorroNeto = totalIngresos - totalGastos
  const cantTransacciones = (gastos?.categorias.reduce((a, c) => a + c.cantidad, 0) ?? 0) +
    (ingresos?.categorias.reduce((a, c) => a + c.cantidad, 0) ?? 0)

  function handleExportar() {
    reportesApi.exportar({
      ...(desde && { fechaDesde: desde }),
      ...(hasta && { fechaHasta: hasta }),
      ...(cuentaId && { cuentaId }),
    })
  }

  return (
    <div className="space-y-6 page-transition">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleExportar}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
              border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30
              transition-colors duration-150"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* ── Filtros ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4 items-end">
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Desde</Label>
          <Input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="bg-muted/40 border-0 h-9"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Hasta</Label>
          <Input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="bg-muted/40 border-0 h-9"
          />
        </div>
        <div className="space-y-1 col-span-2 sm:col-span-1">
          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Agrupacion</Label>
          <Select value={agrupacion} onValueChange={(v) => v && setAgrupacion(v)}>
            <SelectTrigger className="sm:w-32.5 bg-muted/40 border-0 h-9">
              <SelectValue placeholder="Agrupacion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dia">Diaria</SelectItem>
              <SelectItem value="semana">Semanal</SelectItem>
              <SelectItem value="mes">Mensual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {cuentas.length > 1 && (
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Cuenta</Label>
            <Select value={cuentaId} onValueChange={(v) => setCuentaId(v === '_todas' || !v ? '' : v)} itemToStringLabel={(v) => cuentas.find(c => c.id === v)?.nombre ?? v}>
              <SelectTrigger className="sm:w-40 bg-muted/40 border-0 h-9">
                <SelectValue placeholder="Todas las cuentas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_todas">Todas las cuentas</SelectItem>
                {cuentas.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* ── Stat cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total ingresos"
          value={`$${formatCompact(totalIngresos)}`}
          icon={TrendingUp}
          color="bg-green-500/10 text-green-600"
        />
        <StatCard
          label="Total gastos"
          value={`$${formatCompact(totalGastos)}`}
          icon={TrendingDown}
          color="bg-red-500/10 text-red-600"
        />
        <StatCard
          label="Ahorro neto"
          value={`$${formatCompact(ahorroNeto)}`}
          icon={Minus}
          color={ahorroNeto >= 0 ? 'bg-blue-500/10 text-blue-600' : 'bg-orange-500/10 text-orange-600'}
        />
        <StatCard
          label="Transacciones"
          value={String(cantTransacciones)}
          icon={Hash}
          color="bg-muted text-muted-foreground"
        />
      </div>

      {/* ── Gráficos ───────────────────────────────────────── */}
      <Suspense fallback={
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 rounded-lg shimmer" />
          <div className="h-72 rounded-lg shimmer" />
          <div className="h-72 rounded-lg shimmer" />
          <div className="h-72 rounded-lg shimmer" />
        </div>
      }>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GraficoTendencia />
          <GraficoCategoria desde={desde} hasta={hasta} />
          <IngresosPorCategoria desde={desde} hasta={hasta} />
          <FlujoCaja desde={desde} hasta={hasta} agrupacion={agrupacion} />
        </div>

        <TopGastos desde={desde} hasta={hasta} />
      </Suspense>
    </div>
  )
}
