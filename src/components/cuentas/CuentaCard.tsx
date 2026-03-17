import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Banknote, Landmark, PiggyBank, CreditCard,
  TrendingUp, HandCoins, PlusCircle, MinusCircle,
  MoreVertical, Trash2,
  Smartphone,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Cuenta, TipoCuenta } from '@/types'
import { formatMonto } from '@/lib/formatters'
import { useEliminarCuenta } from '@/hooks/use-cuentas'
import { ConfirmDialog } from '@/components/ConfirmDialog'

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

interface CuentaCardProps {
  cuenta: Cuenta
  onEdit: (cuenta: Cuenta) => void
}

export function CuentaCard({ cuenta, onEdit }: CuentaCardProps) {
  const navigate = useNavigate()
  const eliminar = useEliminarCuenta()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const Icon = ICONOS[cuenta.tipo] || Banknote
  const balanceColor = cuenta.balance >= 0 ? 'text-green-600' : 'text-red-500'

  return (
    <Card
      className="cursor-pointer card-interactive"
      onClick={() => navigate(`/cuentas/${cuenta.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: cuenta.color ? `${cuenta.color}20` : undefined }}
            >
              <Icon
                className="h-5 w-5"
                style={{ color: cuenta.color || undefined }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className={`text-lg font-semibold ${balanceColor}`}>
                {formatMonto(cuenta.balance, cuenta.moneda)}
              </p>
              <p className="text-xs text-muted-foreground">{cuenta.moneda}</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                className="p-1 rounded hover:bg-accent cursor-pointer"
                onClick={(e) => e.stopPropagation()}
                aria-label="Mas opciones"
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(cuenta) }}>
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
        </div>
      </CardContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={() => { eliminar.mutate(cuenta.id); setConfirmOpen(false) }}
        titulo="Eliminar cuenta"
        descripcion={`Se eliminara "${cuenta.nombre}" permanentemente.`}
      />
    </Card>
  )
}
