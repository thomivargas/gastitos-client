import { useState } from 'react'
import { Plus, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TransaccionFilters } from '@/components/transacciones/TransaccionFilters'
import { TransaccionList } from '@/components/transacciones/TransaccionList'
import { TransaccionForm } from '@/components/transacciones/TransaccionForm'
import { useTransacciones } from '@/hooks/use-transacciones'
import { formatMonto } from '@/lib/formatters'
import type { Transaccion } from '@/types'
import type { ListaTransaccionesParams } from '@/api/transacciones.api'

export default function TransaccionesPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editTransaccion, setEditTransaccion] = useState<Transaccion | null>(null)
  const [filtros, setFiltros] = useState<ListaTransaccionesParams>({ page: 1, limit: 20 })

  const { data, isLoading } = useTransacciones(filtros)

  function handleEdit(t: Transaccion) {
    setEditTransaccion(t)
    setFormOpen(true)
  }

  function handleNew() {
    setEditTransaccion(null)
    setFormOpen(true)
  }

  function handlePageChange(page: number) {
    setFiltros((prev) => ({ ...prev, page }))
  }

  // Calcular resumen de la pagina actual
  const transacciones = data?.data ?? []
  const totalIngresos = transacciones
    .filter((t) => t.tipo === 'INGRESO')
    .reduce((sum, t) => sum + Number(t.monto), 0)
  const totalGastos = transacciones
    .filter((t) => t.tipo === 'GASTO')
    .reduce((sum, t) => sum + Number(t.monto), 0)

  return (
    <div className="space-y-5 page-transition">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transacciones</h1>
          {data && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {data.meta.total} registros
            </p>
          )}
        </div>
        <Button onClick={handleNew} className="shrink-0">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Nueva transaccion</span>
        </Button>
      </div>

      {/* Mini resumen */}
      {!isLoading && transacciones.length > 0 && (
        <div className="flex gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-red-500/5 border border-red-500/10 px-3 py-2 flex-1 sm:flex-none">
            <ArrowDownCircle className="h-4 w-4 text-red-500 shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground leading-none">Gastos</p>
              <p className="text-sm font-semibold tabular-nums text-red-600 dark:text-red-400 mt-0.5">
                {formatMonto(totalGastos)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 px-3 py-2 flex-1 sm:flex-none">
            <ArrowUpCircle className="h-4 w-4 text-emerald-500 shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground leading-none">Ingresos</p>
              <p className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatMonto(totalIngresos)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <TransaccionFilters filtros={filtros} onChange={setFiltros} />

      {/* Lista */}
      <Card>
        <CardContent className="p-1.5 sm:p-3">
          {isLoading ? (
            <div className="space-y-1 py-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-lg" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="h-8 w-8 rounded-full shimmer" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-32 rounded shimmer" />
                    <div className="h-2.5 w-20 rounded shimmer" />
                  </div>
                  <div className="h-4 w-24 rounded shimmer" />
                </div>
              ))}
            </div>
          ) : data ? (
            <TransaccionList
              transacciones={data.data}
              meta={data.meta}
              onEdit={handleEdit}
              onPageChange={handlePageChange}
            />
          ) : null}
        </CardContent>
      </Card>

      <TransaccionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        transaccion={editTransaccion}
      />
    </div>
  )
}
