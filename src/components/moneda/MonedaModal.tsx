import { useState } from 'react'
import { DollarSign, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { useTasasDolar } from '@/hooks/use-reportes'
import { formatMonto, formatFecha } from '@/lib/formatters'
import { useUIStore } from '@/stores/ui.store'

const TIPO_CONFIG: Record<string, { label: string }> = {
  blue: { label: 'Blue' },
  mep: { label: 'MEP' },
  oficial: { label: 'Oficial' },
  tarjeta: { label: 'Tarjeta' },
}

const TIPO_ORDER = ['blue', 'mep', 'oficial', 'tarjeta']

export function MonedaModal() {
  const open = useUIStore((s) => s.monedaModalOpen)
  const setOpen = useUIStore((s) => s.setMonedaModalOpen)
  const tipoDolar = useUIStore((s) => s.tipoDolar)
  const setTipoDolar = useUIStore((s) => s.setTipoDolar)

  const { data: tasas, isLoading } = useTasasDolar()

  const [monto, setMonto] = useState('1')
  const [convertido, setConvertido] = useState(false)

  const montoNum = parseFloat(monto) || 0

  // Ordenar tasas segun TIPO_ORDER
  const tasasOrdenadas = tasas
    ? TIPO_ORDER.map((t) => tasas.find((r) => r.tipo === t)).filter(Boolean)
    : []

  function handleConvertir() {
    if (montoNum > 0) setConvertido(true)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setConvertido(false) }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            Moneda
          </DialogTitle>
        </DialogHeader>

        {/* Tipo de dolar global */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Tipo de dolar
          </p>
          <Select value={tipoDolar} onValueChange={(v) => v && setTipoDolar(v as typeof tipoDolar)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPO_ORDER.map((t) => (
                <SelectItem key={t} value={t}>
                  {TIPO_CONFIG[t]?.label ?? t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Separador */}
        <div className="h-px bg-border" />

        {/* Tabla de tasas */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Tipo de cambio
          </p>

          {isLoading ? (
            <div className="space-y-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 rounded-lg animate-pulse bg-muted" />
              ))}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 text-xs font-medium text-muted-foreground font-normal">Tipo</th>
                  <th className="text-right py-1.5 text-xs font-medium text-muted-foreground font-normal">Tasa</th>
                  <th className="text-right py-1.5 text-xs font-medium text-muted-foreground font-normal">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {tasasOrdenadas.map((t) => {
                  if (!t) return null
                  const esActual = t.tipo === tipoDolar
                  return (
                    <tr key={t.tipo} className={esActual ? 'bg-primary/5' : ''}>
                      <td className={`py-2 font-medium ${esActual ? 'text-primary' : ''}`}>
                        {TIPO_CONFIG[t.tipo]?.label ?? t.tipo}
                      </td>
                      <td className="py-2 text-right tabular-nums font-semibold">
                        $ {Math.round(t.tasa)}
                      </td>
                      <td className="py-2 text-right text-xs text-muted-foreground">
                        {formatFecha(t.fecha)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Separador */}
        <div className="h-px bg-border" />

        {/* Convertidor */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Convertidor USD → ARS
          </p>

          <div className="flex gap-2">
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="Monto USD"
              value={monto}
              onChange={(e) => { setMonto(e.target.value); setConvertido(false) }}
              onKeyDown={(e) => e.key === 'Enter' && handleConvertir()}
              className="h-9"
            />
            <Button
              onClick={handleConvertir}
              disabled={montoNum <= 0}
              size="icon"
              className="h-9 w-9 shrink-0"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {convertido && montoNum > 0 && tasasOrdenadas.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 text-xs font-medium text-muted-foreground font-normal">Tipo</th>
                  <th className="text-right py-1.5 text-xs font-medium text-muted-foreground font-normal">Tasa</th>
                  <th className="text-right py-1.5 text-xs font-medium text-muted-foreground font-normal">Total ARS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {tasasOrdenadas.map((t) => {
                  if (!t) return null
                  const total = montoNum * t.tasa
                  const esActual = t.tipo === tipoDolar
                  return (
                    <tr key={t.tipo} className={esActual ? 'bg-primary/5' : ''}>
                      <td className={`py-2 font-medium ${esActual ? 'text-primary' : ''}`}>
                        {TIPO_CONFIG[t.tipo]?.label ?? t.tipo}
                      </td>
                      <td className="py-2 text-right tabular-nums text-muted-foreground text-xs">
                        {formatMonto(t.tasa, 'ARS')}
                      </td>
                      <td className="py-2 text-right tabular-nums font-semibold">
                        {formatMonto(total, 'ARS')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
