import { memo, useState, useEffect, useRef } from 'react'
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { CategoriaSelect } from '@/components/CategoriaSelect'
import { useCuentas } from '@/hooks/use-cuentas'
import { useCategorias } from '@/hooks/use-categorias'
import type { ListaTransaccionesParams } from '@/api/transacciones.api'

interface TransaccionFiltersProps {
  filtros: ListaTransaccionesParams
  onChange: (filtros: ListaTransaccionesParams) => void
}

export const TransaccionFilters = memo(function TransaccionFilters({ filtros, onChange }: TransaccionFiltersProps) {
  const { data: cuentasData } = useCuentas({ estado: 'ACTIVA', limit: 50 })
  const { data: categoriasGasto } = useCategorias('GASTO')
  const { data: categoriasIngreso } = useCategorias('INGRESO')
  const [expandido, setExpandido] = useState(false)

  const cuentas = cuentasData?.data || []
  const categorias = [...(categoriasGasto || []), ...(categoriasIngreso || [])]

  // Debounce busqueda para evitar request por cada tecla
  const [busquedaLocal, setBusquedaLocal] = useState(filtros.busqueda || '')
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    setBusquedaLocal(filtros.busqueda || '')
  }, [filtros.busqueda])

  useEffect(() => {
    return () => clearTimeout(debounceRef.current)
  }, [])

  function handleBusqueda(value: string) {
    setBusquedaLocal(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onChange({ ...filtros, busqueda: value || undefined, page: 1 })
    }, 300)
  }

  function update(partial: Partial<ListaTransaccionesParams>) {
    onChange({ ...filtros, ...partial, page: 1 })
  }

  const filtrosActivos = [
    filtros.tipo,
    filtros.cuentaId,
    filtros.categoriaId,
    filtros.fechaDesde,
    filtros.fechaHasta,
    filtros.busqueda,
  ].filter(Boolean).length

  const hasFilters = filtrosActivos > 0

  // Auto-expandir si hay filtros avanzados activos
  const tieneAvanzados = !!(filtros.cuentaId || filtros.categoriaId || filtros.fechaDesde || filtros.fechaHasta)

  return (
    <div className="space-y-3">
      {/* Fila principal: busqueda + tipo + boton filtros */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar transacciones..."
            value={busquedaLocal}
            onChange={(e) => handleBusqueda(e.target.value)}
            className="pl-9"
          />
          {busquedaLocal && (
            <button
              type="button"
              onClick={() => handleBusqueda('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Tipo - inline pills */}
        <div className="hidden sm:flex rounded-lg border border-input p-0.5 gap-0.5">
          {([undefined, 'GASTO', 'INGRESO'] as const).map((valor) => {
            const activo = filtros.tipo === valor
            const label = valor === 'GASTO' ? 'Gastos' : valor === 'INGRESO' ? 'Ingresos' : 'Todos'
            return (
              <button
                key={label}
                type="button"
                onClick={() => update({ tipo: valor })}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  activo
                    ? valor === 'GASTO'
                      ? 'bg-red-500/10 text-red-600 dark:text-red-400 shadow-sm'
                      : valor === 'INGRESO'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'bg-foreground/5 text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Tipo mobile */}
        <div className="sm:hidden">
          <Select
            value={filtros.tipo ?? null}
            onValueChange={(v) => update({ tipo: v === '_all' ? undefined : v ?? undefined })}
          >
            <SelectTrigger className="w-27.5">
              <SelectValue placeholder="Todos">
                {(value: string) => {
                  if (!value) return 'Todos'
                  const labels: Record<string, string> = { _all: 'Todos', INGRESO: 'Ingresos', GASTO: 'Gastos' }
                  return labels[value] ?? value
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Todos</SelectItem>
              <SelectItem value="INGRESO">Ingresos</SelectItem>
              <SelectItem value="GASTO">Gastos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Boton filtros avanzados */}
        <Button
          variant={expandido || tieneAvanzados ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setExpandido(!expandido)}
          className="shrink-0 gap-1.5"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Filtros</span>
          {filtrosActivos > 0 && (
            <Badge variant="default" className="h-4 min-w-4 px-1 text-[10px] rounded-full">
              {filtrosActivos}
            </Badge>
          )}
          <ChevronDown className={`h-3 w-3 transition-transform ${expandido ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Filtros avanzados colapsables */}
      <div
        className={`grid transition-all duration-200 ease-out ${
          expandido || tieneAvanzados ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-3">
            <div className="flex flex-wrap gap-3">
              {/* Cuenta */}
              <div className="w-full sm:w-auto sm:min-w-45">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Cuenta</label>
                <Select
                  value={filtros.cuentaId ?? null}
                  onValueChange={(v) => update({ cuentaId: v === '_all' ? undefined : v ?? undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las cuentas">
                      {(value: string) => {
                        if (!value || value === '_all') return 'Todas las cuentas'
                        return cuentas.find((x) => x.id === value)?.nombre ?? value
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Todas las cuentas</SelectItem>
                    {cuentas.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Categoria */}
              <div className="w-full sm:w-auto sm:min-w-45">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Categoria</label>
                <CategoriaSelect
                  categorias={categorias}
                  value={filtros.categoriaId}
                  onValueChange={(v) => update({ categoriaId: v === '_none' ? undefined : v || undefined })}
                  placeholder="Todas las categorias"
                  allowNone
                  noneLabel="Todas las categorias"
                />
              </div>

              {/* Rango de fechas */}
              <div className="w-full sm:w-auto">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Periodo</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={filtros.fechaDesde || ''}
                    onChange={(e) => update({ fechaDesde: e.target.value || undefined })}
                    className="w-full sm:w-36.25"
                  />
                  <span className="text-xs text-muted-foreground shrink-0">—</span>
                  <Input
                    type="date"
                    value={filtros.fechaHasta || ''}
                    onChange={(e) => update({ fechaHasta: e.target.value || undefined })}
                    className="w-full sm:w-36.25"
                  />
                </div>
              </div>
            </div>

            {hasFilters && (
              <div className="flex justify-end pt-1 border-t border-border/40">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onChange({ page: 1, limit: filtros.limit })
                    setExpandido(false)
                  }}
                  className="h-7 text-xs text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
