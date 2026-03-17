import { useState, useMemo, useRef, useEffect } from 'react'
import { Popover } from '@base-ui/react/popover'
import { Search, ChevronDownIcon, CheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Categoria } from '@/types'

interface CategoriaSelectProps {
  categorias: Categoria[]
  value: string | null | undefined
  onValueChange: (value: string) => void
  placeholder?: string
  /** Mostrar opcion "Sin categoria" con value "_none" */
  allowNone?: boolean
  noneLabel?: string
}

export function CategoriaSelect({
  categorias,
  value,
  onValueChange,
  placeholder = 'Seleccionar categoria',
  allowNone = false,
  noneLabel = 'Sin categoria',
}: CategoriaSelectProps) {
  const [open, setOpen] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Aplanar categorias con sus subcategorias para buscar y mostrar
  const categoriasFlat = useMemo(() => {
    const result: Array<Categoria & { esSub: boolean }> = []
    for (const cat of categorias) {
      result.push({ ...cat, esSub: false })
      if (cat.subcategorias?.length) {
        for (const sub of cat.subcategorias) {
          result.push({ ...sub, esSub: true })
        }
      }
    }
    return result
  }, [categorias])

  // Filtrar por busqueda
  const filtradas = useMemo(() => {
    if (!busqueda.trim()) return categoriasFlat
    const term = busqueda.toLowerCase()
    // Si matchea una padre, mostrar tambien sus subcategorias
    const padresMatch = new Set<string>()
    for (const cat of categoriasFlat) {
      if (cat.nombre.toLowerCase().includes(term)) {
        if (!cat.esSub) padresMatch.add(cat.id)
        if (cat.esSub && cat.padreId) padresMatch.add(cat.padreId)
      }
    }
    return categoriasFlat.filter(
      (cat) =>
        cat.nombre.toLowerCase().includes(term) ||
        (cat.esSub && cat.padreId && padresMatch.has(cat.padreId)) ||
        (!cat.esSub && padresMatch.has(cat.id)),
    )
  }, [categoriasFlat, busqueda])

  // Encontrar categoria seleccionada para mostrar en el trigger
  const seleccionada = categoriasFlat.find((c) => c.id === value)

  useEffect(() => {
    if (open) {
      setBusqueda('')
      // Focus input al abrir
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  function handleSelect(id: string) {
    onValueChange(id)
    setOpen(false)
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        className={cn(
          'flex w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none',
          'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          'dark:bg-input/30 dark:hover:bg-input/50',
          'h-8',
          !seleccionada && (!value || value === '_none') && 'text-muted-foreground',
        )}
      >
        <span className="flex flex-1 items-center gap-1.5 text-left line-clamp-1">
          {seleccionada ? (
            <>
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: seleccionada.color }}
              />
              {seleccionada.nombre}
            </>
          ) : (
            allowNone && (value === '_none' || value === '') ? noneLabel : placeholder
          )}
        </span>
        <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground shrink-0" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner side="bottom" sideOffset={4} align="start" className="z-50">
          <Popover.Popup
            className="w-(--anchor-width) min-w-50 rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 origin-(--transform-origin) data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
          >
            {/* Busqueda */}  
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Buscar categoria..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {/* Lista */}
            <div className="max-h-60 overflow-y-auto p-1">
              {allowNone && (
                <button
                  type="button"
                  className={cn(
                    'relative flex w-full cursor-pointer items-center gap-1.5 rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden select-none',
                    'hover:bg-accent hover:text-accent-foreground',
                    (!value || value === '_none' || value === '') && 'bg-accent/50',
                  )}
                  onClick={() => handleSelect('_none')}
                >
                  <span className="h-2.5 w-2.5 rounded-full shrink-0 border border-dashed border-muted-foreground" />
                  {noneLabel}
                  {(!value || value === '_none' || value === '') && (
                    <CheckIcon className="absolute right-2 h-4 w-4" />
                  )}
                </button>
              )}

              {filtradas.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Sin resultados
                </p>
              )}

              {filtradas.map((cat) => {
                const isSelected = value === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={cn(
                      'relative flex w-full cursor-pointer items-center gap-1.5 rounded-md py-1.5 pr-8 text-sm outline-hidden select-none',
                      'hover:bg-accent hover:text-accent-foreground',
                      cat.esSub ? 'pl-6' : 'pl-2',
                      isSelected && 'bg-accent/50',
                    )}
                    onClick={() => handleSelect(cat.id)}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className={cn(cat.esSub && 'text-muted-foreground')}>
                      {cat.nombre}
                    </span>
                    {isSelected && (
                      <CheckIcon className="absolute right-2 h-4 w-4" />
                    )}
                  </button>
                )
              })}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
