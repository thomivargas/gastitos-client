import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { useTasasDolar } from '@/hooks/use-reportes'
import { formatMonto, formatFecha } from '@/lib/formatters'
import * as monedasApi from '@/api/monedas.api'

export default function MonedaPage() {
  const { data: tasas, isLoading } = useTasasDolar()

  const [monto, setMonto] = useState('1')
  const [tipo, setTipo] = useState('blue')
  const [resultado, setResultado] = useState<monedasApi.ConversionData | null>(null)
  const [converting, setConverting] = useState(false)

  async function handleConvertir() {
    const montoNum = parseFloat(monto)
    if (!montoNum) return
    setConverting(true)
    try {
      const res = await monedasApi.convertir('USD', 'ARS', montoNum, tipo)
      setResultado(res)
    } catch { /* toast handles */ }
    setConverting(false)
  }

  return (
    <div className="space-y-6 page-transition">
      <h1 className="text-2xl font-bold">Moneda</h1>

      {/* Tasas actuales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><div className="h-16 animate-pulse bg-muted rounded" /></CardContent></Card>
          ))
        ) : (
          tasas?.map((t) => (
            <Card key={t.tipo}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground capitalize">Dolar {t.tipo}</p>
                <p className="text-2xl font-bold">{formatMonto(t.tasa, 'ARS')}</p>
                <p className="text-xs text-muted-foreground">{formatFecha(t.fecha)}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Convertidor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Convertidor USD → ARS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <Label>Monto USD</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-[140px]"
              />
            </div>
            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={(v) => v && setTipo(v)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue>
                    {(value: string) => {
                      if (!value) return 'Tipo'
                      const labels: Record<string, string> = { blue: 'Blue', mep: 'MEP', oficial: 'Oficial' }
                      return labels[value] ?? value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="mep">MEP</SelectItem>
                  <SelectItem value="oficial">Oficial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleConvertir} disabled={converting}>
              <RefreshCw className={`h-4 w-4 mr-2 ${converting ? 'animate-spin' : ''}`} />
              Convertir
            </Button>
          </div>

          {resultado && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {formatMonto(resultado.montoOriginal, 'USD')} × {formatMonto(resultado.tasa, 'ARS')} =
              </p>
              <p className="text-2xl font-bold">{formatMonto(resultado.montoConvertido, 'ARS')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
