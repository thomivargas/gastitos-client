import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TransaccionRow } from './TransaccionRow'
import { useEliminarTransaccion } from '@/hooks/use-transacciones'
import type { Transaccion, PaginatedMeta } from '@/types'

interface TransaccionListProps {
  transacciones: Transaccion[]
  meta: PaginatedMeta
  onEdit: (t: Transaccion) => void
  onPageChange: (page: number) => void
}

export function TransaccionList({ transacciones, meta, onEdit, onPageChange }: TransaccionListProps) {
  const eliminar = useEliminarTransaccion()
  if (transacciones.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-12">No hay transacciones con estos filtros</p>
    )
  }

  return (
    <div className="space-y-2">
      <div className="divide-y">
        {transacciones.map((t) => (
          <TransaccionRow key={t.id} transaccion={t} onEdit={onEdit} onEliminar={(id) => eliminar.mutate(id)} />
        ))}
      </div>

      {/* Paginacion */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            {meta.total} transacciones — Pagina {meta.page} de {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPrev}
              onClick={() => onPageChange(meta.page - 1)}
              aria-label="Pagina anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNext}
              onClick={() => onPageChange(meta.page + 1)}
              aria-label="Pagina siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
