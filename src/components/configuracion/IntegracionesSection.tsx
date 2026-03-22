import { useState } from 'react'
import { Unplug, ExternalLink, RefreshCw } from 'lucide-react'
import { useMercadoPago } from '@/hooks/useMercadoPago'
import { useCuentas } from '@/hooks/use-cuentas'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function IntegracionesSection() {
  const { conectado, cuentaId, isLoading, conectar, desconectar, isDesconectando, sincronizar, isSincronizando } = useMercadoPago()
  const { data: cuentasData } = useCuentas({ estado: 'ACTIVA', limit: 100 })
  const cuentas = cuentasData?.data ?? []
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<string>('')

  const cuentaVinculada = cuentas.find((c) => c.id === cuentaId)

  if (isLoading) {
    return <div className="animate-pulse h-24 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-foreground">Integraciones</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Conecta servicios externos para importar transacciones automaticamente.
        </p>
      </div>

      {/* Card de Mercado Pago */}
      <div className="border border-border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#009ee3] flex items-center justify-center text-white font-bold text-xs">
              MP
            </div>
            <div>
              <p className="text-sm font-medium">Mercado Pago</p>
              <p className="text-xs text-muted-foreground">
                Importa pagos recibidos y enviados automaticamente
              </p>
            </div>
          </div>

          {conectado && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400 px-2.5 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Conectado
            </span>
          )}
        </div>

        {conectado ? (
          <div className="space-y-3">
            {cuentaVinculada && (
              <p className="text-xs text-muted-foreground">
                Vinculado a la cuenta:{' '}
                <span className="font-medium text-foreground">{cuentaVinculada.nombre}</span>
              </p>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isSincronizando}
                onClick={() => sincronizar()}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSincronizando ? 'animate-spin' : ''}`} />
                {isSincronizando ? 'Sincronizando...' : 'Sincronizar'}
              </Button>

            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-destructive hover:text-destructive"
                    disabled={isDesconectando}
                  >
                    <Unplug className="h-3.5 w-3.5" />
                    Desconectar
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Desconectar Mercado Pago?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Las transacciones ya importadas no se borraran. Dejaras de recibir
                    nuevas transacciones automaticamente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => desconectar()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Desconectar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                A que cuenta de Gastitos vincular?
              </label>
              <Select
                value={cuentaSeleccionada || null}
                onValueChange={(v) => v && setCuentaSeleccionada(v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Seleccionar cuenta..." />
                </SelectTrigger>
                <SelectContent>
                  {cuentas.map((cuenta) => (
                    <SelectItem key={cuenta.id} value={cuenta.id}>
                      {cuenta.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              size="sm"
              className="gap-2"
              disabled={!cuentaSeleccionada}
              onClick={() => conectar(cuentaSeleccionada)}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Conectar Mercado Pago
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
