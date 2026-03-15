import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CategoriaList } from '@/components/categorias/CategoriaList'
import { CategoriaForm } from '@/components/categorias/CategoriaForm'
import { useCategorias } from '@/hooks/use-categorias'
import type { Categoria, ClasificacionCategoria } from '@/types'

export default function CategoriasPage() {
  const { data: gastos, isLoading: loadingGastos } = useCategorias('GASTO')
  const { data: ingresos, isLoading: loadingIngresos } = useCategorias('INGRESO')

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
    setFormOpen(true)
  }

  return (
    <div className="space-y-6 page-transition">
      <h1 className="text-2xl font-bold">Categorias</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base">Gastos</CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleNew('GASTO')}>
              <Plus className="h-4 w-4 mr-1" />
              Nueva
            </Button>
          </CardHeader>
          <CardContent>
            {loadingGastos ? (
              <LoadingSkeleton />
            ) : (
              <CategoriaList
                categorias={gastos || []}
                onEdit={handleEdit}
                onAddSub={handleAddSub}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base">Ingresos</CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleNew('INGRESO')}>
              <Plus className="h-4 w-4 mr-1" />
              Nueva
            </Button>
          </CardHeader>
          <CardContent>
            {loadingIngresos ? (
              <LoadingSkeleton />
            ) : (
              <CategoriaList
                categorias={ingresos || []}
                onEdit={handleEdit}
                onAddSub={handleAddSub}
              />
            )}
          </CardContent>
        </Card>
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
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-8 animate-pulse bg-muted rounded" />
      ))}
    </div>
  )
}
