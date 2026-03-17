import { useState } from 'react'
import { ChevronDown, Plus, MoreHorizontal, Landmark, Smartphone, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { CuentaRow } from './CuentaRow'
import type { Cuenta, Institucion, TipoInstitucion } from '@/types'
import { formatMonto } from '@/lib/formatters'
import { cn } from '@/lib/utils'

const ICONOS_INSTITUCION: Record<TipoInstitucion, React.ComponentType<{ className?: string }>> = {
  BANCO: Landmark,
  BILLETERA_VIRTUAL: Smartphone,
  OTRA: Building2,
}

const TIPO_LABELS: Record<TipoInstitucion, string> = {
  BANCO: 'Banco',
  BILLETERA_VIRTUAL: 'Billetera virtual',
  OTRA: 'Otra',
}

interface InstitucionSectionProps {
  institucion: Institucion | null
  cuentas: Cuenta[]
  onAddCuenta: (institucion: Institucion | null) => void
  onEditInstitucion?: () => void
  onEditCuenta: (cuenta: Cuenta) => void
}

export function InstitucionSection({
  institucion,
  cuentas,
  onAddCuenta,
  onEditInstitucion,
  onEditCuenta,
}: InstitucionSectionProps) {
  const [expandido, setExpandido] = useState(true)

  const Icon = institucion ? (ICONOS_INSTITUCION[institucion.tipo] ?? Building2) : Building2
  const nombre = institucion ? institucion.nombre : 'Sin entidad'
  const esEditable = institucion !== null && !institucion.oficial

  const monedaRep = cuentas[0]?.moneda ?? 'ARS'
  const mixedCurrencies = cuentas.length > 1 && cuentas.some((c) => c.moneda !== monedaRep)
  const totalBalance = cuentas.reduce((sum, c) => sum + c.balance, 0)

  return (
    <div>
      {/* Section header */}
      <div
        className="flex items-center gap-2.5 py-2.5 px-2 rounded-xl hover:bg-muted/40 cursor-pointer transition-colors select-none"
        onClick={() => setExpandido((v) => !v)}
      >
        {/* Chevron */}
        <ChevronDown
          className="h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform duration-200"
          style={{ transform: expandido ? 'rotate(0deg)' : 'rotate(-90deg)' }}
        />

        {/* Institution icon badge */}
        <div
          className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: institucion?.color ? `${institucion.color}18` : 'hsl(var(--muted))',
            boxShadow: institucion?.color ? `0 0 0 1.5px ${institucion.color}30` : undefined,
          }}
        >
          <Icon
            className="h-4 w-4"
            style={{ color: institucion?.color || 'hsl(var(--muted-foreground))' } as React.CSSProperties}
          />
        </div>

        {/* Name + type badge + count */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-semibold text-sm truncate">{nombre}</span>
          {institucion && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wide shrink-0">
              {TIPO_LABELS[institucion.tipo]}
            </span>
          )}
          <span className="text-xs text-muted-foreground shrink-0">
            ({cuentas.length} {cuentas.length === 1 ? 'cuenta' : 'cuentas'})
          </span>
        </div>

        {/* Institution total balance */}
        {!mixedCurrencies && cuentas.length > 0 && (
          <span className={cn(
            'text-sm font-semibold tabular-nums shrink-0 mr-1',
            totalBalance >= 0 ? 'text-foreground' : 'text-red-500 dark:text-red-400',
          )}>
            {formatMonto(totalBalance, monedaRep)}
          </span>
        )}

        {/* Action buttons — stop propagation so click doesn't toggle expand */}
        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => onAddCuenta(institucion)}
            aria-label="Agregar cuenta"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>

          {esEditable && onEditInstitucion && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  aria-label="Mas opciones"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditInstitucion()}>
                  Editar entidad
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Account rows */}
      {expandido && cuentas.length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden ml-2 mt-0.5">
          <div className="divide-y divide-border/60">
            {cuentas.map((cuenta) => (
              <CuentaRow
                key={cuenta.id}
                cuenta={cuenta}
                onEdit={onEditCuenta}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
