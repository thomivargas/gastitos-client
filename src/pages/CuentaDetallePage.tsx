import { useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router'
import { ArrowLeft, Pencil, Archive, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CuentaForm } from '@/components/cuentas/CuentaForm'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useCuenta, useArchivarCuenta, useReactivarCuenta, useEliminarCuenta } from '@/hooks/use-cuentas'
import { TIPOS_CUENTA } from '@/lib/constants'
import { formatMonto, formatFecha } from '@/lib/formatters'

export default function CuentaDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) return <Navigate to="/cuentas" replace />

  const { data: cuenta, isLoading } = useCuenta(id)
  const [formOpen, setFormOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const archivar = useArchivarCuenta()
  const reactivar = useReactivarCuenta()
  const eliminar = useEliminarCuenta()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse bg-muted rounded" />
        <div className="h-64 animate-pulse bg-muted rounded-lg" />
      </div>
    )
  }

  if (!cuenta) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Cuenta no encontrada</p>
        <Button variant="link" onClick={() => navigate('/cuentas')}>Volver a cuentas</Button>
      </div>
    )
  }

  const tipoInfo = TIPOS_CUENTA[cuenta.tipo]
  const isArchivada = cuenta.estado === 'ARCHIVADA'
  const balanceColor = cuenta.balance >= 0 ? 'text-green-600' : 'text-red-500'

  function handleEliminar() {
    eliminar.mutate(cuenta!.id, {
      onSuccess: () => navigate('/cuentas'),
    })
    setConfirmOpen(false)
  }

  return (
    <div className="space-y-6 page-transition">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/cuentas')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{cuenta.nombre}</h1>
            {isArchivada && <Badge variant="secondary">Archivada</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{tipoInfo.label}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>
          {isArchivada ? (
            <Button variant="outline" size="sm" onClick={() => reactivar.mutate(cuenta.id)}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reactivar
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => archivar.mutate(cuenta.id)}>
              <Archive className="h-4 w-4 mr-1" />
              Archivar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Balance actual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${balanceColor}`}>
              {formatMonto(cuenta.balance, cuenta.moneda)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{cuenta.moneda}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Tipo" value={tipoInfo.label} />
            <DetailRow label="Clasificacion" value={cuenta.clasificacion} />
            <DetailRow label="Moneda" value={cuenta.moneda} />
            {cuenta.institucion && <DetailRow label="Institucion" value={cuenta.institucion} />}
            <DetailRow label="Estado" value={cuenta.estado} />
            <DetailRow label="Creada" value={formatFecha(cuenta.creadoEl)} />
            {cuenta.notas && (
              <>
                <Separator />
                <p className="text-sm text-muted-foreground">{cuenta.notas}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)} disabled={eliminar.isPending}>
          <Trash2 className="h-4 w-4 mr-1" />
          Eliminar cuenta
        </Button>
      </div>

      <CuentaForm open={formOpen} onOpenChange={setFormOpen} cuenta={cuenta} />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleEliminar}
        titulo="Eliminar cuenta"
        descripcion={`Se eliminara la cuenta "${cuenta.nombre}" permanentemente. Esta accion no se puede deshacer.`}
      />
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
