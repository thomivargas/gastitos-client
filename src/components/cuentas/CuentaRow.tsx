import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Banknote, Landmark, PiggyBank, CreditCard,
  TrendingUp, HandCoins, PlusCircle, MinusCircle,
  MoreHorizontal, Trash2, Smartphone, Pencil,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useEliminarCuenta } from '@/hooks/use-cuentas'
import { formatMonto } from '@/lib/formatters'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { TIPOS_CUENTA } from '@/lib/constants'
import type { Cuenta, TipoCuenta } from '@/types'
import { cn } from '@/lib/utils'

const ICONOS: Record<TipoCuenta, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  EFECTIVO: Banknote,
  BANCO_CORRIENTE: Landmark,
  BANCO_AHORRO: PiggyBank,
  BILLETERA_VIRTUAL: Smartphone,
  TARJETA_CREDITO: CreditCard,
  INVERSION: TrendingUp,
  PRESTAMO: HandCoins,
  OTRO_ACTIVO: PlusCircle,
  OTRO_PASIVO: MinusCircle,
}

interface CuentaRowProps {
  cuenta: Cuenta
  onEdit: (cuenta: Cuenta) => void
}

export function CuentaRow({ cuenta, onEdit }: CuentaRowProps) {
  const navigate = useNavigate()
  const eliminar = useEliminarCuenta()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const Icon = ICONOS[cuenta.tipo] || Banknote
  const isPasivo = cuenta.clasificacion === 'PASIVO'
  const isPositive = (!isPasivo && cuenta.balance >= 0) || (isPasivo && cuenta.balance <= 0)
  const accentColor = cuenta.color || '#6172F3'

  return (
    <>
      <div
        className="group relative flex items-center gap-3 hover:bg-muted/30 cursor-pointer px-3 py-3 transition-colors"
        onClick={() => navigate(`/cuentas/${cuenta.id}`)}
      >
        {/* Left color accent strip */}
        <div
          className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full opacity-50 group-hover:opacity-90 transition-opacity"
          style={{ backgroundColor: accentColor }}
        />

        {/* Icon */}
        <div
          className="p-1.5 rounded-lg shrink-0 ml-2"
          style={{ backgroundColor: `${accentColor}18` }}
        >
          <Icon
            className="h-4 w-4"
            style={{ color: accentColor }}
          />
        </div>

        {/* Name + tipo label */}
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium block truncate">{cuenta.nombre}</span>
          <span className="text-[11px] text-muted-foreground leading-none">
            {TIPOS_CUENTA[cuenta.tipo]?.label}
          </span>
        </div>

        {/* Balance */}
        <div className="text-right shrink-0">
          <p className={cn(
            'text-sm font-semibold tabular-nums',
            isPositive ? 'text-foreground' : 'text-red-500 dark:text-red-400',
          )}>
            {formatMonto(cuenta.balance, cuenta.moneda)}
          </p>
          {cuenta.moneda !== 'ARS' && (
            <span className="text-[10px] text-muted-foreground">{cuenta.moneda}</span>
          )}
        </div>

        {/* Actions — appear on hover */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="p-1.5 rounded-lg hover:bg-accent cursor-pointer shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
            aria-label="Mas opciones"
          >
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(cuenta) }}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => { e.stopPropagation(); setConfirmOpen(true) }}
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
        onConfirm={() => { eliminar.mutate(cuenta.id); setConfirmOpen(false) }}
        titulo="Eliminar cuenta"
        descripcion={`Se eliminara "${cuenta.nombre}" permanentemente.`}
      />
    </>
  )
}
