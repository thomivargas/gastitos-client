import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Receipt } from 'lucide-react'
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
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center">
          <Receipt className="h-6 w-6 text-muted-foreground/60" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">Sin resultados</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">No hay transacciones con estos filtros</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="divide-y divide-border/50">
        {transacciones.map((t, i) => (
          <div key={t.id} className="stagger-item" style={{ animationDelay: `${Math.min(i * 30, 240)}ms` }}>
            <TransaccionRow transaccion={t} onEdit={onEdit} onEliminar={(id) => eliminar.mutate(id)} />
          </div>
        ))}
      </div>

      {/* Paginacion */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-border/40 px-3">
          <p className="text-xs text-muted-foreground tabular-nums">
            {meta.total} transacciones — Pagina {meta.page} de {meta.totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={!meta.hasPrev}
              onClick={() => onPageChange(meta.page - 1)}
              aria-label="Pagina anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Numeros de pagina */}
            {generatePageNumbers(meta.page, meta.totalPages).map((p, i) => (
              p === '...' ? (
                <span key={`dots-${i}`} className="px-1 text-xs text-muted-foreground">...</span>
              ) : (
                <Button
                  key={p}
                  variant={p === meta.page ? 'secondary' : 'ghost'}
                  size="icon-sm"
                  onClick={() => onPageChange(p as number)}
                  className="text-xs tabular-nums"
                >
                  {p}
                </Button>
              )
            ))}

            <Button
              variant="ghost"
              size="icon-sm"
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

function generatePageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}
