import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Trash2, PieChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { PresupuestoForm } from '@/components/presupuestos/PresupuestoForm'
import { usePresupuestos, useEliminarPresupuesto } from '@/hooks/use-presupuestos'
import { formatMonto, formatFecha } from '@/lib/formatters'

export default function PresupuestosPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const { data, isLoading } = usePresupuestos({ limit: 20 })
  const eliminar = useEliminarPresupuesto()
  const navigate = useNavigate()

  const presupuestos = data?.data || []
  const now = new Date()

  function isActivo(inicio: string, fin: string) {
    const d = now.toISOString().split('T')[0]
    return d >= inicio.split('T')[0] && d <= fin.split('T')[0]
  }

  return (
    <div className="space-y-6 page-transition">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Presupuestos</h1>
        <Button onClick={() => setFormOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Nuevo presupuesto</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-40 rounded shimmer" />
                <div className="h-5 w-14 rounded shimmer" />
              </div>
              <div className="flex gap-6">
                <div className="h-3 w-24 rounded shimmer" />
                <div className="h-3 w-24 rounded shimmer" />
              </div>
            </Card>
          ))}
        </div>
      ) : presupuestos.length === 0 ? (
        <EmptyState
          icono={PieChart}
          titulo="Sin presupuestos"
          descripcion="Crea un presupuesto para controlar tus gastos por categoria"
          accion={{ label: 'Crear presupuesto', onClick: () => setFormOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {presupuestos.map((p) => {
            const activo = isActivo(p.fechaInicio, p.fechaFin)
            return (
              <Card
                key={p.id}
                className="cursor-pointer card-interactive"
                onClick={() => navigate(`/presupuestos/${p.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {formatFecha(p.fechaInicio, 'dd MMM')} - {formatFecha(p.fechaFin, 'dd MMM yyyy')}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {activo && <Badge>Activo</Badge>}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); setConfirmId(p.id) }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                    {p.gastoPresupuestado != null && (
                      <div>
                        <span className="text-muted-foreground">Gasto: </span>
                        <span className="font-medium">{formatMonto(p.gastoPresupuestado, p.moneda)}</span>
                      </div>
                    )}
                    {p.ingresoEsperado != null && (
                      <div>
                        <span className="text-muted-foreground">Ingreso: </span>
                        <span className="font-medium">{formatMonto(p.ingresoEsperado, p.moneda)}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Categorias: </span>
                      <span className="font-medium">{p.categorias.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(open) => { if (!open) setConfirmId(null) }}
        onConfirm={() => { if (confirmId) eliminar.mutate(confirmId); setConfirmId(null) }}
        titulo="Eliminar presupuesto"
        descripcion="Se eliminara este presupuesto y todas sus categorias asignadas."
      />
      <PresupuestoForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
