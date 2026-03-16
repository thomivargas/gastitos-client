import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TransferenciaForm } from '@/components/transferencias/TransferenciaForm'
import { TransferenciaList } from '@/components/transferencias/TransferenciaList'
import { useTransferencias } from '@/hooks/use-transferencias'
import type { ListaTransferenciasParams } from '@/api/transferencias.api'

export default function TransferenciasPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [params, setParams] = useState<ListaTransferenciasParams>({ page: 1, limit: 20 })
  const { data, isLoading } = useTransferencias(params)

  return (
    <div className="space-y-6 page-transition">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Transferencias</h1>
        <Button onClick={() => setFormOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Nueva transferencia</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-2 md:p-4">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 rounded shimmer" />
              ))}
            </div>
          ) : data ? (
            <TransferenciaList
              transferencias={data.data}
              meta={data.meta}
              onPageChange={(page) => setParams((p) => ({ ...p, page }))}
            />
          ) : null}
        </CardContent>
      </Card>

      <TransferenciaForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
