import { useMemo, lazy, Suspense } from 'react'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'
import { useResumenMensual, useTasasDolar } from '@/hooks/use-reportes'
import { useResumenCuentas } from '@/hooks/use-cuentas'
import { formatMonto } from '@/lib/formatters'
import { TopGastos } from '@/components/reportes/TopGastos'
import { UltimasTransacciones } from '@/components/reportes/UltimasTransacciones'

const GraficoTendencia = lazy(() => import('@/components/reportes/GraficoTendencia'))
const GraficoCategoria = lazy(() => import('@/components/reportes/GraficoCategoria'))

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

export default function DashboardPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const moneda = useUIStore((s) => s.monedaDisplay)
  const tipoDolar = useUIStore((s) => s.tipoDolar)
  const { anio, mes, mesNombre } = useMemo(() => {
    const now = new Date()
    return { anio: now.getFullYear(), mes: now.getMonth() + 1, mesNombre: MESES[now.getMonth()] }
  }, [])

  const { data: resumenMes, isLoading: loadingMes } = useResumenMensual(anio, mes, moneda, tipoDolar, true)
  const { data: resumenCuentas, isLoading: loadingCuentas } = useResumenCuentas(moneda, tipoDolar, true)
  const { data: tasas } = useTasasDolar()

  const isLoading = loadingMes || loadingCuentas

  const tasaActual = moneda === 'USD' ? tasas?.find((t) => t.tipo === tipoDolar)?.tasa : undefined

  const statCards = [
    {
      label: `Ingresos`,
      value: formatMonto(resumenMes?.ingresos.total ?? 0, moneda),
      arsEquivalent: tasaActual ? formatMonto((resumenMes?.ingresos.total ?? 0) * tasaActual, 'ARS') : undefined,
      fallback: `${resumenMes?.ingresos.cantidad ?? 0} transacciones`,
      icon: TrendingUp,
      gradient: 'from-green-50 to-transparent dark:from-green-950/20 dark:to-transparent',
      iconBg: 'bg-green-100 dark:bg-green-950/40',
      iconColor: 'text-green-600',
    },
    {
      label: `Gastos`,
      value: formatMonto(resumenMes?.gastos.total ?? 0, moneda),
      arsEquivalent: tasaActual ? formatMonto((resumenMes?.gastos.total ?? 0) * tasaActual, 'ARS') : undefined,
      fallback: `${resumenMes?.gastos.cantidad ?? 0} transacciones`,
      icon: TrendingDown,
      gradient: 'from-red-50 to-transparent dark:from-red-950/20 dark:to-transparent',
      iconBg: 'bg-red-100 dark:bg-red-950/40',
      iconColor: 'text-red-500',
    },
    {
      label: 'Balance total',
      value: formatMonto(resumenCuentas?.patrimonioNeto ?? 0, moneda),
      arsEquivalent: tasaActual ? formatMonto((resumenCuentas?.patrimonioNeto ?? 0) * tasaActual, 'ARS') : undefined,
      fallback: `${resumenCuentas?.cantidadCuentas ?? 0} cuentas`,
      icon: Wallet,
      gradient: 'from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent',
      iconBg: 'bg-blue-100 dark:bg-blue-950/40',
      iconColor: 'text-blue-600',
    },
  ]

  return (
    <div className="space-y-6 page-transition">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">
          Hola{usuario?.nombre ? `, ${usuario.nombre.split(' ')[0]}` : ''}
        </h1>
        <p className="text-sm text-muted-foreground">
          Resumen de {mesNombre} {anio}
        </p>
      </div>

      {/* Cards principales */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg shimmer" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-16 rounded shimmer" />
                    <div className="h-5 w-24 rounded shimmer" />
                    <div className="h-2.5 w-20 rounded shimmer" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card, i) => (
            <Card key={card.label} className={`bg-linear-to-br ${card.gradient} card-interactive stagger-item`} style={{ animationDelay: `${i * 50}ms` }}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-2.5 rounded-lg ${card.iconBg}`}>
                  <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{card.label}</p>
                  <p className="text-xl font-bold tabular-nums">{card.value}</p>
                  {card.arsEquivalent && <p className="text-[11px] text-muted-foreground">≈ {card.arsEquivalent}</p>}
                  <p className="text-xs text-muted-foreground">{card.fallback}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Graficos */}
      <Suspense fallback={
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 rounded-lg shimmer" />
          <div className="h-72 rounded-lg shimmer" />
        </div>
      }>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GraficoTendencia />
          <GraficoCategoria />
        </div>
      </Suspense>

      {/* Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UltimasTransacciones />
        <TopGastos />
      </div>
    </div>
  )
}
