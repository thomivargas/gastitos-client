import { useParams, useNavigate, Navigate } from 'react-router'
import { useMemo, useState } from 'react'
import { ArrowLeft, Pencil, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CuentaForm } from '@/components/cuentas/CuentaForm'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useCuenta, useEliminarCuenta } from '@/hooks/use-cuentas'
import { useTransacciones } from '@/hooks/use-transacciones'
import { TIPOS_CUENTA } from '@/lib/constants'
import { formatMonto, formatFecha } from '@/lib/formatters'

export default function CuentaDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [formOpen, setFormOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { data: cuenta, isLoading } = useCuenta(id ?? '')
  const eliminar = useEliminarCuenta()

  // Fecha del primer día del mes actual
  const primerDiaMes = useMemo(() => {
    const hoy = new Date()
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`
  }, [])

  const { data: transaccionesData } = useTransacciones({
    cuentaId: id ?? '',
    fechaDesde: primerDiaMes,
    limit: 200,
  })

  const { data: ultimasData } = useTransacciones({
    cuentaId: id ?? '',
    limit: 10,
    ordenarPor: 'fecha',
    orden: 'desc',
  })

  if (!id) return <Navigate to="/cuentas" replace />

  // Stats del mes
  const stats = useMemo(() => {
    const txs = transaccionesData?.data ?? []
    const ingresos = txs
      .filter((t) => t.tipo === 'INGRESO')
      .reduce((sum, t) => sum + t.monto, 0)
    const gastos = txs
      .filter((t) => t.tipo === 'GASTO')
      .reduce((sum, t) => sum + t.monto, 0)
    return { ingresos, gastos, cantidad: txs.length }
  }, [transaccionesData])

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-32 bg-muted rounded" />
        <div className="h-40 bg-muted rounded-2xl" />
      </div>
    )
  }

  if (!cuenta) return null

  const balance = Number(cuenta.balance)
  const balanceColor = balance >= 0
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-500 dark:text-red-400'
  const tipoCuentaInfo = TIPOS_CUENTA[cuenta.tipo]
  function handleEliminar() {
    eliminar.mutate(cuenta!.id, {
      onSuccess: () => navigate('/cuentas'),
    })
  }

  return (
    <div className="space-y-6">
      {/* Navegación */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/cuentas')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">{cuenta.nombre}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </div>
      </div>

      {/* Sección 1: Hero */}
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: (cuenta.color || '#6172F3') + '18' }}
      >
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
          {tipoCuentaInfo?.label ?? cuenta.tipo}
        </p>
        {cuenta.institucion && (
          <p className="text-sm text-muted-foreground mt-0.5">{cuenta.institucion.nombre}</p>
        )}
        <p className={`text-4xl font-bold tabular-nums mt-3 ${balanceColor}`}>
          {formatMonto(balance, cuenta.moneda)}
        </p>
        {cuenta.notas && (
          <p className="text-sm text-muted-foreground mt-3">{cuenta.notas}</p>
        )}
      </div>

      {/* Sección 2: Stats del mes */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
            Ingresos del mes
          </p>
          <p className="text-lg font-bold tabular-nums text-green-600 dark:text-green-400 mt-1">
            {formatMonto(stats.ingresos, cuenta.moneda)}
          </p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
            Gastos del mes
          </p>
          <p className="text-lg font-bold tabular-nums text-red-500 dark:text-red-400 mt-1">
            {formatMonto(stats.gastos, cuenta.moneda)}
          </p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
            Transacciones
          </p>
          <p className="text-lg font-bold tabular-nums mt-1">{stats.cantidad}</p>
        </div>
      </div>

      {/* Sección 3: Últimas transacciones */}
      {ultimasData && ultimasData.data.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">Últimas transacciones</h2>
          <div className="rounded-xl border border-border divide-y divide-border">
            {ultimasData.data.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.descripcion}</p>
                  <p className="text-xs text-muted-foreground">
                    {tx.categoria?.nombre ?? 'Sin categoría'} · {formatFecha(tx.fecha)}
                  </p>
                </div>
                <p
                  className={`text-sm font-semibold tabular-nums shrink-0 ${
                    tx.tipo === 'INGRESO'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-500 dark:text-red-400'
                  }`}
                >
                  {tx.tipo === 'INGRESO' ? '+' : '-'}
                  {formatMonto(tx.monto, tx.moneda)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección 4: Zona peligrosa */}
      <div className="rounded-xl border border-dashed border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/10 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Eliminar cuenta
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanente. Solo funciona si no tiene transacciones.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            disabled={eliminar.isPending}
          >
            Eliminar
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <CuentaForm open={formOpen} onOpenChange={setFormOpen} cuenta={cuenta} />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleEliminar}
        titulo="Eliminar cuenta"
        descripcion={`Se eliminará la cuenta "${cuenta.nombre}" permanentemente. Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
