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
    <div className="flex items-center gap-3 px-3 py-3 sm:px-4 rounded-lg hover:bg-accent/40 group transition-colors">
      {/* Icono tipo con fondo */}
      <div className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-full ${
        isIngreso
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          : 'bg-red-500/10 text-red-500 dark:text-red-400'
      }`}>
        {isIngreso ? (
          <ArrowUpCircle className="h-4 w-4" />
        ) : (
          <ArrowDownCircle className="h-4 w-4" />
        )}
      </div>

      {/* Descripcion + categoria + etiquetas */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{t.descripcion}</p>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
            {formatFechaCorta(t.fecha)}
          </span>
          {t.categoria && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: t.categoria.color }}
                />
                <span className="truncate">{t.categoria.nombre}</span>
              </span>
            </>
          )}
          {t.etiquetas.slice(0, 2).map((et) => (
            <Badge key={et.id} variant="secondary" className="text-[10px] px-1.5 py-0 hidden sm:inline-flex">
              {et.nombre}
            </Badge>
          ))}
          {t.etiquetas.length > 2 && (
            <span className="text-[10px] text-muted-foreground hidden sm:inline">
              +{t.etiquetas.length - 2}
            </span>
          )}
        </div>
      </div>

      {/* Cuenta */}
      <span className="text-xs text-muted-foreground hidden md:block shrink-0 truncate max-w-25 bg-muted/50 px-2 py-0.5 rounded">
        {t.cuenta.nombre}
      </span>

      {/* Monto */}
      <span className={`text-sm font-semibold tabular-nums shrink-0 ${
        isIngreso ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
      }`}>
        {isIngreso ? '+' : '-'}{formatMonto(t.monto, t.moneda)}
      </span>

      {/* Acciones */}
      <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1.5 rounded-md hover:bg-accent cursor-pointer" aria-label="Mas opciones">
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
