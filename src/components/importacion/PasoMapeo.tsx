import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Cuenta } from '@/types'
import type * as importApi from '@/api/importacion.api'

interface Props {
  preview: importApi.PreviewData
  cuentas: Cuenta[]
  cuentaId: string
  onCuentaIdChange: (id: string) => void
  mapeo: importApi.MapeoColumnas
  onMapeoChange: (mapeo: importApi.MapeoColumnas) => void
  formatoFecha: string
  onFormatoFechaChange: (v: string) => void
  separadorDecimal: string
  onSeparadorDecimalChange: (v: string) => void
  loading: boolean
  onImportar: () => void
  onCancelar: () => void
}

export function PasoMapeo({
  preview, cuentas, cuentaId, onCuentaIdChange,
  mapeo, onMapeoChange, formatoFecha, onFormatoFechaChange,
  separadorDecimal, onSeparadorDecimalChange,
  loading, onImportar, onCancelar,
}: Props) {
  return (
    <div className="space-y-6 animate-slide-up-fade">

      {/* Cuenta destino */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Cuenta destino</Label>
        <Select
          value={cuentaId || null}
          onValueChange={(v) => v && onCuentaIdChange(v)}
          itemToStringLabel={(v) => v ? cuentas.find(c => c.id === v)?.nombre ?? v : ''}
        >
          <SelectTrigger className="h-10 bg-muted/40 border-0">
            <SelectValue placeholder="Seleccionar cuenta" />
          </SelectTrigger>
          <SelectContent>
            {cuentas.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Mapeo de columnas */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="px-4 py-3 bg-muted/40 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Mapeo de columnas <span className="text-muted-foreground/60 normal-case font-normal">— asigná las columnas del archivo a cada campo</span>
          </p>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['fecha', 'monto', 'descripcion'] as const).map((campo) => (
              <div key={campo} className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold capitalize">{campo}</span>
                  <span className="text-[10px] text-amber-600 font-bold">*</span>
                </div>
                <Select
                  value={mapeo[campo]}
                  onValueChange={(v) => v && onMapeoChange({ ...mapeo, [campo]: v })}
                >
                  <SelectTrigger className="h-9 bg-muted/40 border-0 text-sm">
                    <SelectValue placeholder="columna…" />
                  </SelectTrigger>
                  <SelectContent>
                    {preview.columnas.map((col) => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Formato fecha</Label>
              <Select value={formatoFecha} onValueChange={(v) => v && onFormatoFechaChange(v)}>
                <SelectTrigger className="h-9 bg-muted/40 border-0 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Separador decimal</Label>
              <Select value={separadorDecimal} onValueChange={(v) => v && onSeparadorDecimalChange(v)}>
                <SelectTrigger className="h-9 bg-muted/40 border-0 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=".">Punto ( . )</SelectItem>
                  <SelectItem value=",">Coma ( , )</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Preview table */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="px-4 py-3 bg-muted/40 border-b border-border flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vista previa</p>
          <span className="text-xs text-muted-foreground tabular-nums">{preview.totalFilas} filas</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {preview.columnas.map((col) => (
                  <th key={col} className="px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.filas.slice(0, 5).map((fila, i) => (
                <tr key={i} className={`border-b border-border/50 last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                  {preview.columnas.map((col) => (
                    <td key={col} className="px-4 py-2.5 truncate max-w-45 text-foreground/80">
                      {fila[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-3 justify-between">
        <button onClick={onCancelar} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← Cancelar
        </button>
        <Button
          onClick={onImportar}
          disabled={loading || !cuentaId || !mapeo.fecha || !mapeo.monto || !mapeo.descripcion}
          className="gap-2 bg-foreground text-background hover:bg-foreground/85 px-6"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border border-background/40 border-t-background rounded-full animate-spin" />
              Importando…
            </>
          ) : (
            <>Importar {preview.totalFilas} filas <ArrowRight className="h-3.5 w-3.5" /></>
          )}
        </Button>
      </div>
    </div>
  )
}
