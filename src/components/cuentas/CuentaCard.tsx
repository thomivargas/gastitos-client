import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Banknote, Landmark, PiggyBank, CreditCard,
  TrendingUp, HandCoins, PlusCircle, MinusCircle,
  MoreVertical, Archive, RotateCcw, Trash2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Cuenta, TipoCuenta } from '@/types'
import { formatMonto } from '@/lib/formatters'
import { TIPOS_CUENTA } from '@/lib/constants'
import { useArchivarCuenta, useReactivarCuenta, useEliminarCuenta } from '@/hooks/use-cuentas'
import { ConfirmDialog } from '@/components/ConfirmDialog'

const ICONOS: Record<TipoCuenta, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  EFECTIVO: Banknote,
  BANCO_CORRIENTE: Landmark,
  BANCO_AHORRO: PiggyBank,
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
  const archivar = useArchivarCuenta()
  const reactivar = useReactivarCuenta()
  const eliminar = useEliminarCuenta()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const Icon = ICONOS[cuenta.tipo] || Banknote
  const isArchivada = cuenta.estado === 'ARCHIVADA'
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
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{cuenta.nombre}</h3>
                {isArchivada && (
                  <Badge variant="secondary" className="text-xs">Archivada</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{TIPOS_CUENTA[cuenta.tipo].label}</p>
              {cuenta.institucion && (
                <p className="text-xs text-muted-foreground">{cuenta.institucion}</p>
              )}
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
                {isArchivada ? (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); reactivar.mutate(cuenta.id) }}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reactivar
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); archivar.mutate(cuenta.id) }}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archivar
                  </DropdownMenuItem>
                )}
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
