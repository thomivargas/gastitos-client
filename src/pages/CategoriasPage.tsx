import { useState } from 'react'
import { Plus, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategoriaList } from '@/components/categorias/CategoriaList'
import { CategoriaForm } from '@/components/categorias/CategoriaForm'
import { useCategorias } from '@/hooks/use-categorias'
import type { Categoria, ClasificacionCategoria } from '@/types'
import { cn } from '@/lib/utils'

export default function CategoriasPage() {
  const { data: gastos, isLoading: loadingGastos } = useCategorias('GASTO')
  const { data: ingresos, isLoading: loadingIngresos } = useCategorias('INGRESO')

  const [tab, setTab] = useState<ClasificacionCategoria>('GASTO')
  const [formOpen, setFormOpen] = useState(false)
  const [editCategoria, setEditCategoria] = useState<Categoria | null>(null)
  const [formPadreId, setFormPadreId] = useState<string | undefined>()
  const [formClasificacion, setFormClasificacion] = useState<ClasificacionCategoria>('GASTO')

  function handleNew(clasificacion: ClasificacionCategoria) {
    setEditCategoria(null)
    setFormPadreId(undefined)
    setFormClasificacion(clasificacion)
    setFormOpen(true)
  }

  function handleEdit(cat: Categoria) {
    setEditCategoria(cat)
    setFormPadreId(undefined)
    setFormOpen(true)
  }

  function handleAddSub(padreId: string) {
    setEditCategoria(null)
    setFormPadreId(padreId)
    setFormClasificacion(tab)
    setFormOpen(true)
  }

  const categoriasActivas = tab === 'GASTO' ? gastos : ingresos
  const isLoading = tab === 'GASTO' ? loadingGastos : loadingIngresos

  const cantGastos = gastos?.length ?? 0
  const cantIngresos = ingresos?.length ?? 0

  return (
    <div className="space-y-5 page-transition">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categorias</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organiza tus transacciones por tipo
          </p>
        </div>
        <Button size="sm" onClick={() => handleNew(tab)}>
          <Plus className="h-4 w-4 mr-1" />
          Nueva
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('GASTO')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer',
            tab === 'GASTO'
              ? 'bg-red-500/10 text-red-500 ring-1 ring-red-500/20'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
          )}
        >
          <ArrowDownCircle className="h-3.5 w-3.5" />
          Gastos
          <span className={cn(
            'text-[10px] tabular-nums rounded-full px-1.5 py-0.5',
            tab === 'GASTO' ? 'bg-red-500/15 text-red-400' : 'bg-muted text-muted-foreground',
          )}>
            {cantGastos}
          </span>
        </button>
        <button
          onClick={() => setTab('INGRESO')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer',
            tab === 'INGRESO'
              ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
          )}
        >
          <ArrowUpCircle className="h-3.5 w-3.5" />
          Ingresos
          <span className={cn(
            'text-[10px] tabular-nums rounded-full px-1.5 py-0.5',
            tab === 'INGRESO' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground',
          )}>
            {cantIngresos}
          </span>
        </button>
      </div>

      {/* Lista */}
      <div className="rounded-xl border border-border bg-card p-2">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <CategoriaList
            categorias={categoriasActivas || []}
            onEdit={handleEdit}
            onAddSub={handleAddSub}
          />
        )}
      </div>

      <CategoriaForm
        open={formOpen}
        onOpenChange={setFormOpen}
        categoria={editCategoria}
        padreId={formPadreId}
        clasificacionDefault={formClasificacion}
      />
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-1.5 p-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-2.5 py-2.5 rounded-lg"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="h-7 w-7 rounded-lg shimmer" />
          <div className="flex-1 space-y-1">
            <div className="h-3 w-24 rounded shimmer" />
          </div>
        </div>
      ))}
    </div>
  )
}
