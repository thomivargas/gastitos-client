import { memo, useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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

  const hasFilters = filtros.tipo || filtros.cuentaId || filtros.categoriaId ||
    filtros.fechaDesde || filtros.fechaHasta || filtros.busqueda

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {/* Busqueda */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descripcion..."
            value={busquedaLocal}
            onChange={(e) => handleBusqueda(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Tipo */}
        <Select
          value={filtros.tipo ?? null}
          onValueChange={(v) => update({ tipo: v === '_all' ? undefined : v ?? undefined })}
        >
          <SelectTrigger className="w-[140px]">
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

        {/* Cuenta */}
        <Select
          value={filtros.cuentaId ?? null}
          onValueChange={(v) => update({ cuentaId: v === '_all' ? undefined : v ?? undefined })}
        >
          <SelectTrigger className="w-[180px]">
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

        {/* Categoria */}
        <div className="w-[180px]">
          <CategoriaSelect
            categorias={categorias}
            value={filtros.categoriaId}
            onValueChange={(v) => update({ categoriaId: v === '_none' ? undefined : v || undefined })}
            placeholder="Todas las categorias"
            allowNone
            noneLabel="Todas las categorias"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        {/* Fechas */}
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={filtros.fechaDesde || ''}
            onChange={(e) => update({ fechaDesde: e.target.value || undefined })}
            className="w-[150px]"
          />
          <span className="text-sm text-muted-foreground">a</span>
          <Input
            type="date"
            value={filtros.fechaHasta || ''}
            onChange={(e) => update({ fechaHasta: e.target.value || undefined })}
            className="w-[150px]"
          />
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange({ page: 1, limit: filtros.limit })}
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  )
})
