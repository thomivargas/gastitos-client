import { useState } from 'react'
import { ArrowRightLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useEliminarTransferencia } from '@/hooks/use-transferencias'
import { formatMonto, formatFechaCorta } from '@/lib/formatters'
import type { PaginatedMeta } from '@/types'
import type { TransferenciaDetalle } from '@/api/transferencias.api'

interface TransferenciaListProps {
  transferencias: TransferenciaDetalle[]
  meta: PaginatedMeta
  onPageChange: (page: number) => void
}

export function TransferenciaList({ transferencias, meta, onPageChange }: TransferenciaListProps) {
  const eliminar = useEliminarTransferencia()
  const [confirmId, setConfirmId] = useState<string | null>(null)

  if (transferencias.length === 0) {
    return <p className="text-muted-foreground text-center py-12">No hay transferencias</p>
  }

  return (
    <div className="space-y-2">
      <div className="divide-y">
        {transferencias.map((t) => (
          <div key={t.id} className="flex items-center gap-3 px-3 py-3 hover:bg-accent/50 group">
            <ArrowRightLeft className="h-5 w-5 text-blue-500 shrink-0" />

            <span className="text-sm text-muted-foreground w-12 shrink-0">
              {formatFechaCorta(t.transaccionOrigen.fecha)}
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {t.cuentaOrigen.nombre} → {t.cuentaDestino.nombre}
              </p>
              {t.transaccionOrigen.descripcion && (
                <p className="text-xs text-muted-foreground truncate">
                  {t.transaccionOrigen.descripcion}
                </p>
              )}
            </div>

            <div className="text-right shrink-0">
              <p className="text-sm font-semibold tabular-nums">
                {formatMonto(t.transaccionOrigen.monto, t.transaccionOrigen.moneda)}
              </p>
              {t.transaccionOrigen.moneda !== t.transaccionDestino.moneda && (
                <p className="text-xs text-muted-foreground tabular-nums">
                  → {formatMonto(t.transaccionDestino.monto, t.transaccionDestino.moneda)}
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              onClick={() => setConfirmId(t.id)}
              aria-label="Eliminar transferencia"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(open) => { if (!open) setConfirmId(null) }}
        onConfirm={() => { if (confirmId) eliminar.mutate(confirmId); setConfirmId(null) }}
        titulo="Eliminar transferencia"
        descripcion="Se eliminara esta transferencia y las transacciones asociadas. Esta accion no se puede deshacer."
      />

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            {meta.total} transferencias — Pagina {meta.page} de {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!meta.hasPrev} onClick={() => onPageChange(meta.page - 1)} aria-label="Pagina anterior">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={!meta.hasNext} onClick={() => onPageChange(meta.page + 1)} aria-label="Pagina siguiente">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
