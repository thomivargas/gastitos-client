import { memo, useState } from 'react'
import { ArrowUpCircle, ArrowDownCircle, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatMonto, formatFechaCorta } from '@/lib/formatters'
import type { Transaccion } from '@/types'

interface TransaccionRowProps {
  transaccion: Transaccion
  onEdit: (t: Transaccion) => void
  onEliminar: (id: string) => void
}

export const TransaccionRow = memo(function TransaccionRow({ transaccion: t, onEdit, onEliminar }: TransaccionRowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isIngreso = t.tipo === 'INGRESO'

  return (
    <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2.5 rounded-md hover:bg-accent/50 group">
      {/* Icono tipo */}
      <div className={`shrink-0 ${isIngreso ? 'text-green-600' : 'text-red-500'}`}>
        {isIngreso ? (
          <ArrowUpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <ArrowDownCircle className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </div>

      {/* Fecha */}
      <span className="text-xs sm:text-sm text-muted-foreground shrink-0">
        {formatFechaCorta(t.fecha)}
      </span>

      {/* Descripcion + categoria + etiquetas */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{t.descripcion}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {t.categoria && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: t.categoria.color }}
              />
              <span className="truncate max-w-[80px] sm:max-w-none">{t.categoria.nombre}</span>
            </span>
          )}
          {t.etiquetas.slice(0, 2).map((et) => (
            <Badge key={et.id} variant="secondary" className="text-[10px] px-1.5 py-0 hidden sm:inline-flex">
              {et.nombre}
            </Badge>
          ))}
        </div>
      </div>

      {/* Cuenta */}
      <span className="text-xs text-muted-foreground hidden md:block shrink-0 truncate max-w-[100px]">
        {t.cuenta.nombre}
      </span>

      {/* Monto */}
      <span className={`text-xs sm:text-sm font-semibold tabular-nums shrink-0 ${isIngreso ? 'text-green-600' : 'text-red-500'}`}>
        {isIngreso ? '+' : '-'}{formatMonto(t.monto, t.moneda)}
      </span>

      {/* Acciones */}
      <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1 rounded hover:bg-accent cursor-pointer" aria-label="Mas opciones">
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(t)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={() => { onEliminar(t.id); setConfirmOpen(false) }}
        titulo="Eliminar transaccion"
        descripcion={`Se eliminara "${t.descripcion}". Esta accion no se puede deshacer.`}
      />
    </div>
  )
})
