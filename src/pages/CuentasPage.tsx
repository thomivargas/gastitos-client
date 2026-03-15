import { useState } from 'react'
import { Plus, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ResumenCuentas } from '@/components/cuentas/ResumenCuentas'
import { CuentaCard } from '@/components/cuentas/CuentaCard'
import { CuentaForm } from '@/components/cuentas/CuentaForm'
import { EmptyState } from '@/components/EmptyState'
import { useCuentas } from '@/hooks/use-cuentas'
import type { Cuenta } from '@/types'

export default function CuentasPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editCuenta, setEditCuenta] = useState<Cuenta | null>(null)
  const [tab, setTab] = useState('activas')

  const { data: activas, isLoading: loadingActivas } = useCuentas({ estado: 'ACTIVA', limit: 50 })
  const { data: archivadas, isLoading: loadingArchivadas } = useCuentas({ estado: 'ARCHIVADA', limit: 50 })

  function handleEdit(cuenta: Cuenta) {
    setEditCuenta(cuenta)
    setFormOpen(true)
  }

  function handleNew() {
    setEditCuenta(null)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6 page-transition">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cuentas</h1>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva cuenta
        </Button>
      </div>

      <ResumenCuentas />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="activas">
            Activas {activas?.data && `(${activas.data.length})`}
          </TabsTrigger>
          <TabsTrigger value="archivadas">
            Archivadas {archivadas?.data && `(${archivadas.data.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activas" className="mt-4">
          {loadingActivas ? (
            <LoadingSkeleton />
          ) : activas?.data.length === 0 ? (
            <EmptyState
              icono={Wallet}
              titulo="Sin cuentas"
              descripcion="Agrega tu primera cuenta para empezar a registrar tus finanzas"
              accion={{ label: 'Crear cuenta', onClick: handleNew }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activas?.data.map((cuenta, i) => (
                <div key={cuenta.id} className="stagger-item" style={{ animationDelay: `${i * 50}ms` }}>
                  <CuentaCard cuenta={cuenta} onEdit={handleEdit} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="archivadas" className="mt-4">
          {loadingArchivadas ? (
            <LoadingSkeleton />
          ) : archivadas?.data.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No hay cuentas archivadas</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {archivadas?.data.map((cuenta) => (
                <CuentaCard key={cuenta.id} cuenta={cuenta} onEdit={handleEdit} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CuentaForm open={formOpen} onOpenChange={setFormOpen} cuenta={editCuenta} />
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-28 rounded shimmer" />
              <div className="h-3 w-20 rounded shimmer" />
            </div>
            <div className="h-6 w-24 rounded shimmer" />
          </div>
        </Card>
      ))}
    </div>
  )
}
