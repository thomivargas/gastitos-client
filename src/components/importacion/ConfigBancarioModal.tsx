import { ArrowRight, Building2, CheckCircle2 } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
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

type TipoCambioUsd = 'tarjeta' | 'blue' | 'mep' | 'oficial'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  parsers: importApi.ParserInfo[]
  parserId: string
  onParserIdChange: (id: string) => void
  parserActual: importApi.ParserInfo | undefined
  cuentas: Cuenta[]
  cuentaId: string
  onCuentaIdChange: (id: string) => void
  tipoCambioUsd: TipoCambioUsd
  onTipoCambioUsdChange: (v: TipoCambioUsd) => void
  periodoResumen: string
  onPeriodoResumenChange: (p: string) => void
  excluirCargos: boolean
  onExcluirCargosChange: (v: boolean) => void
}

export function ConfigBancarioModal({
  open, onClose, onConfirm,
  parsers, parserId, onParserIdChange, parserActual,
  cuentas, cuentaId, onCuentaIdChange,
  tipoCambioUsd, onTipoCambioUsdChange,
  periodoResumen, onPeriodoResumenChange,
  excluirCargos, onExcluirCargosChange,
}: Props) {
  const canConfirm = !!parserId && !!cuentaId

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-full p-0 overflow-hidden gap-0">
        {/* Franja amber top */}
        <div className="h-0.5 bg-linear-to-r from-amber-400 via-amber-500 to-amber-400" />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-card">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-[15px] font-semibold leading-tight">
                Configurar resumen bancario
              </DialogTitle>
              <p className="text-xs text-[#888] mt-1 leading-relaxed">
                Elegí el banco, la cuenta destino y el período del extracto.
              </p>
            </div>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="px-6 py-2 space-y-6 max-h-[60vh] overflow-y-auto">

          {/* Banco */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] pb-2">Banco</p>
            {parsers.length <= 1 ? (
              <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-card">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {parserActual?.nombre ?? 'BBVA Tarjeta de Crédito'}
                  </p>
                  {parserActual && (
                    <p className="text-[11px] text-[#888] mt-0.5">
                      {parserActual.tipoArchivo.join(', ')}
                    </p>
                  )}
                </div>
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
              </div>
            ) : (
              <Select value={parserId} onValueChange={(v) => v && onParserIdChange(v)}>
                <SelectTrigger className="h-10 border border-card focus-visible:border-amber-400">
                  <SelectValue placeholder="Seleccionar banco" />
                </SelectTrigger>
                <SelectContent>
                  {parsers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Cuenta destino */}
          <div className="space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#b0b0b0]">Cuenta destino</p>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#444]">
                Todas las transacciones se importarán aquí
              </Label>
              <Select
                value={cuentaId || undefined}
                onValueChange={(v) => onCuentaIdChange(v!)}
                itemToStringLabel={(v) => v ? cuentas.find(c => c.id === v)?.nombre ?? v : ''}
              >
                <SelectTrigger className="h-9 border border-card text-sm cursor-pointer">
                  <SelectValue placeholder="Seleccionar cuenta" />
                </SelectTrigger>
                <SelectContent>
                  {cuentas.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {!cuentaId && (
              <p className="text-[11px] text-amber-700 rounded-lg px-3">
                Seleccioná una cuenta destino para continuar.
              </p>
            )}
          </div>

          {/* Cotización USD */}
          <div className="space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#b0b0b0]">Cotización USD</p>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#444]">
                Tasa usada para convertir gastos en dólares a pesos
              </Label>
              <Select value={tipoCambioUsd} onValueChange={(v) => onTipoCambioUsdChange(v as TipoCambioUsd)}>
                <SelectTrigger className="h-9 border border-card text-sm cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="mep">MEP</SelectItem>
                  <SelectItem value="oficial">Oficial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Período */}
          <div className="space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#b0b0b0]">Período del resumen</p>
            <input
              type="month"
              value={periodoResumen}
              onChange={(e) => e.target.value && onPeriodoResumenChange(e.target.value)}
              className="flex h-10 rounded-xl border border-card px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-colors"
            />
            <p className="text-[10px] text-[#888] leading-relaxed">
              Las cuotas se registran con el mes del resumen en lugar de la fecha de compra original.
            </p>
          </div>

          {/* Opciones */}
          <div className="space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#b0b0b0]">Opciones</p>
            <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl border border-card hover:bg-card/30 transition-colors">
              <input
                type="checkbox"
                checked={excluirCargos}
                onChange={(e) => onExcluirCargosChange(e.target.checked)}
                className="h-4 w-4 mt-0.5 shrink-0 rounded accent-amber-500"
              />
              <div>
                <p className="text-sm font-medium transition-colors">Excluir cargos bancarios</p>
                <p className="text-[10px] text-[#888] mt-0.5 leading-relaxed">
                  Omite IVA, percepciones, intereses financieros y comisiones del banco.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-card flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-sm text-[#888] hover:text-foreground transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={() => { if (!canConfirm) return; onConfirm() }}
            disabled={!canConfirm}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-foreground text-background text-sm font-medium
              hover:bg-foreground/85 active:scale-[0.98] transition-all disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
          >
            Continuar <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
