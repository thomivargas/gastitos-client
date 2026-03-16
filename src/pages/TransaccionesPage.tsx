import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TransaccionFilters } from '@/components/transacciones/TransaccionFilters'
import { TransaccionList } from '@/components/transacciones/TransaccionList'
import { TransaccionForm } from '@/components/transacciones/TransaccionForm'
import { useTransacciones } from '@/hooks/use-transacciones'
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

  return (
    <div className="space-y-6 page-transition">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Transacciones</h1>
        <Button onClick={handleNew} className="shrink-0">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Nueva transaccion</span>
        </Button>
      </div>

      <TransaccionFilters filtros={filtros} onChange={setFiltros} />

      <Card>
        <CardContent className="p-2 md:p-4">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                  <div className="h-5 w-5 rounded-full shimmer" />
                  <div className="h-3 w-12 rounded shimmer" />
                  <div className="h-4 flex-1 rounded shimmer" />
                  <div className="h-4 w-20 rounded shimmer" />
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
