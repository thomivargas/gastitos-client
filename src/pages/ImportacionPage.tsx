import { useState, useRef, useEffect } from 'react'
import {
  Upload, Building2, Table2,
  CheckCircle2, ArrowRight, Ban, HelpCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { useCuentas } from '@/hooks/use-cuentas'
import * as importApi from '@/api/importacion.api'

type Modo = 'generico' | 'bancario'
type Paso = 'modo' | 'upload' | 'mapeo' | 'preview-bancario' | 'resultado'

const FLUJO_GENERICO: Paso[] = ['modo', 'upload', 'mapeo', 'resultado']
const FLUJO_BANCARIO: Paso[] = ['modo', 'upload', 'preview-bancario', 'resultado']

const PASO_LABEL: Record<Paso, string> = {
  modo: 'Tipo',
  upload: 'Archivo',
  mapeo: 'Columnas',
  'preview-bancario': 'Preview',
  resultado: 'Listo',
}

function StepRail({ paso, modo }: { paso: Paso; modo: Modo }) {
  const flujo = paso === 'mapeo'
    ? FLUJO_GENERICO
    : paso === 'preview-bancario'
    ? FLUJO_BANCARIO
    : modo === 'bancario' ? FLUJO_BANCARIO : FLUJO_GENERICO

  const current = flujo.indexOf(paso)

  return (
    <div className="flex items-center gap-0">
      {flujo.map((p, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={p} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold
                  transition-all duration-300
                  ${done
                    ? 'bg-foreground text-background'
                    : active
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/40'
                    : 'bg-muted text-muted-foreground'
                  }
                `}
              >
                {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${
                active ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {PASO_LABEL[p]}
              </span>
            </div>
            {i < flujo.length - 1 && (
              <div className={`w-10 sm:w-16 h-px mb-4 mx-1 transition-colors duration-500 ${
                i < current ? 'bg-foreground/40' : 'bg-border'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function ImportacionPage() {
  const { data: cuentasData } = useCuentas({ estado: 'ACTIVA', limit: 50 })
  const cuentas = cuentasData?.data || []
  const fileRef = useRef<HTMLInputElement>(null)

  const [paso, setPaso] = useState<Paso>('modo')
  const [modo, setModo] = useState<Modo>('generico')
  const [loading, setLoading] = useState(false)
  const [archivo, setArchivo] = useState<File | null>(null)

  // Config genérico
  const [preview, setPreview] = useState<importApi.PreviewData | null>(null)
  const [cuentaId, setCuentaId] = useState('')
  const [mapeo, setMapeo] = useState<importApi.MapeoColumnas>({ fecha: '', monto: '', descripcion: '' })
  const [formatoFecha, setFormatoFecha] = useState('YYYY-MM-DD')
  const [separadorDecimal, setSeparadorDecimal] = useState('.')

  // Config bancaria
  const [parsers, setParsers] = useState<importApi.ParserInfo[]>([])
  const [parserId, setParserId] = useState('')
  const [cuentaARS, setCuentaARS] = useState('')
  const [cuentaUSD, setCuentaUSD] = useState('')
  const [excluirCargos, setExcluirCargos] = useState(true)
  const [previewBancario, setPreviewBancario] = useState<importApi.PreviewBancarioData | null>(null)

  const [resultado, setResultado] = useState<{ status: string; data?: unknown } | null>(null)

  useEffect(() => {
    importApi.listarParsers().then(setParsers).catch(() => {})
  }, [])

  useEffect(() => {
    if (modo === 'bancario' && parsers.length === 1) setParserId(parsers[0]!.id)
  }, [modo, parsers])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setArchivo(file)
    setLoading(true)
    try {
      if (modo === 'bancario') {
        if (!parserId) { toast.error('Selecciona un banco primero'); setLoading(false); return }
        const data = await importApi.previewBancario(file, parserId)
        setPreviewBancario(data)
        setPaso('preview-bancario')
      } else {
        const data = await importApi.preview(file)
        setPreview(data)
        const cols = data.columnas.map((c) => c.toLowerCase())
        const encontrar = (...terminos: string[]) =>
          data.columnas[cols.findIndex((c) => terminos.some((t) => c.includes(t)))] || ''
        setMapeo({
          fecha: encontrar('fecha', 'date', 'día', 'dia'),
          monto: encontrar('monto', 'amount', 'importe', 'débito', 'debito', 'cargo', 'pesos'),
          descripcion: encontrar('desc', 'establecimiento', 'concepto', 'detalle', 'comercio', 'movimiento'),
        })
        const montoCol = encontrar('monto', 'amount', 'importe', 'débito', 'debito', 'cargo', 'pesos')
        if (montoCol && data.filas.length > 0) {
          if (/\d\.\d{3},\d/.test(data.filas[0]?.[montoCol] ?? '')) setSeparadorDecimal(',')
        }
        const fechaCol = encontrar('fecha', 'date', 'día', 'dia')
        if (fechaCol && data.filas.length > 0) {
          const m = data.filas[0]?.[fechaCol] ?? ''
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(m)) setFormatoFecha('DD/MM/YYYY')
          else if (/^\d{4}-\d{2}-\d{2}$/.test(m)) setFormatoFecha('YYYY-MM-DD')
          else if (/^\d{2}-\d{2}-\d{4}$/.test(m)) setFormatoFecha('DD-MM-YYYY')
        }
        setPaso('mapeo')
      }
    } catch {
      toast.error('Error al leer el archivo')
    }
    setLoading(false)
  }

  async function handleImportarGenerico() {
    if (!archivo || !cuentaId) return
    setLoading(true)
    try {
      const res = await importApi.ejecutar(archivo, { cuentaId, mapeo, formatoFecha, separadorDecimal })
      setResultado(res)
      setPaso('resultado')
      toast.success('Importacion completada')
    } catch {
      toast.error('Error en la importacion')
    }
    setLoading(false)
  }

  async function handleImportarBancario() {
    if (!archivo || !parserId) return
    const cuentas_config: Record<string, string> = {}
    if (cuentaARS) cuentas_config['ARS'] = cuentaARS
    if (cuentaUSD) cuentas_config['USD'] = cuentaUSD
    if (Object.keys(cuentas_config).length === 0) {
      toast.error('Selecciona al menos una cuenta destino')
      return
    }
    setLoading(true)
    try {
      const res = await importApi.ejecutarBancario(archivo, {
        parserId,
        cuentas: cuentas_config,
        excluirCargosBancarios: excluirCargos,
      })
      setResultado(res)
      setPaso('resultado')
      toast.success('Importacion bancaria completada')
    } catch {
      toast.error('Error en la importacion bancaria')
    }
    setLoading(false)
  }

  function reset() {
    setPaso('modo')
    setArchivo(null)
    setPreview(null)
    setPreviewBancario(null)
    setResultado(null)
    setCuentaId('')
    setCuentaARS('')
    setCuentaUSD('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const parserActual = parsers.find((p) => p.id === parserId)
  const resultadoBancario = resultado?.data as importApi.ResultadoBancario | undefined
  const showRail = paso !== 'modo'

  return (
    <div className="space-y-8 page-transition">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight">Importar</h1>
          {showRail && <StepRail paso={paso} modo={modo} />}
        </div>
        <div className="flex gap-2 shrink-0 pt-0.5">
          {/* Ayuda */}
          <Dialog>
            <DialogTrigger
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30
                transition-colors duration-150"
              aria-label="Ayuda"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ayuda</span>
            </DialogTrigger>
            <DialogContent
              className="
                sm:max-w-lg w-full max-h-[90vh] overflow-y-auto
                !bg-white !text-[#0a0a0a] !ring-black/10
                p-0
              "
            >
              {/* Header del modal */}
              <div className="sticky top-0 z-10 bg-white border-b border-[#e5e5e5] px-6 pt-6 pb-4">
                <DialogHeader>
                  <DialogTitle className="text-base font-semibold text-[#0a0a0a] flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-[#737373]" />
                    ¿Cómo funciona Importar?
                  </DialogTitle>
                  <p className="text-xs text-[#737373] mt-0.5">
                    Todo lo que necesitás saber para importar transacciones.
                  </p>
                </DialogHeader>
              </div>

              {/* Contenido scrollable */}
              <div
                className="px-2 pb-4"
                style={{ '--muted-foreground': '#525252', '--foreground': '#0a0a0a', '--border': '#e5e5e5', '--muted': '#f5f5f5' } as React.CSSProperties}
              >
                <Accordion openMultiple defaultValue={['importar-csv']} className="divide-y divide-[#e5e5e5]">

                  <AccordionItem value="importar-csv" className="border-0 px-4">
                    <AccordionTrigger className="text-sm py-4 hover:no-underline font-semibold text-[#0a0a0a] [&>svg]:text-[#737373]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-[#f5f5f5] flex items-center justify-center shrink-0">
                          <Table2 className="h-3.5 w-3.5 text-[#525252]" />
                        </div>
                        CSV / Excel genérico
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 px-0">
                      <div className="ml-8 space-y-3 text-[#525252]">
                        <p className="text-sm">Usá este modo si tenés cualquier archivo CSV o Excel exportado de otro sistema.</p>
                        <ol className="space-y-2">
                          {[
                            <>Seleccioná <strong className="text-[#0a0a0a] font-medium">CSV / Excel genérico</strong> y hacé click en Continuar.</>,
                            <>Subí el archivo — se muestran las primeras filas para verificarlo.</>,
                            <>Mapeá las columnas: indicá cuál es la <strong className="text-[#0a0a0a] font-medium">fecha</strong>, el <strong className="text-[#0a0a0a] font-medium">monto</strong> y la <strong className="text-[#0a0a0a] font-medium">descripción</strong>.</>,
                            <>Elegí la cuenta destino y hacé click en <strong className="text-[#0a0a0a] font-medium">Importar</strong>.</>,
                          ].map((step, i) => (
                            <li key={i} className="flex gap-3 text-xs leading-relaxed">
                              <span className="w-4 h-4 rounded-full bg-[#e5e5e5] text-[#525252] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                        <p className="text-xs text-[#737373] bg-[#f5f5f5] rounded-lg px-3 py-2">
                          El separador decimal y el formato de fecha se detectan automáticamente, pero podés ajustarlos manualmente.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="importar-banco" className="border-0 px-4">
                    <AccordionTrigger className="text-sm py-4 hover:no-underline font-semibold text-[#0a0a0a] [&>svg]:text-[#737373]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-[#f5f5f5] flex items-center justify-center shrink-0">
                          <Building2 className="h-3.5 w-3.5 text-[#525252]" />
                        </div>
                        Resumen bancario (BBVA)
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 px-0">
                      <div className="ml-8 space-y-3 text-[#525252]">
                        <p className="text-sm">
                          Descargá el resumen de tu tarjeta BBVA desde el homebanking en formato{' '}
                          <span className="font-mono text-xs bg-[#f5f5f5] text-[#0a0a0a] px-1.5 py-0.5 rounded border border-[#e5e5e5]">.xls</span>.
                        </p>
                        <ol className="space-y-2">
                          {[
                            <>Seleccioná <strong className="text-[#0a0a0a] font-medium">Resumen bancario</strong> y elegí el banco.</>,
                            <>Configurá la <strong className="text-[#0a0a0a] font-medium">cuenta ARS</strong> para pesos y/o la <strong className="text-[#0a0a0a] font-medium">cuenta USD</strong> para dólares.</>,
                            <>Activá <strong className="text-[#0a0a0a] font-medium">Excluir cargos bancarios</strong> para omitir IVA, percepciones e intereses.</>,
                            <>Subí el archivo — se muestra un preview con las primeras 10 transacciones.</>,
                            <>Confirmá la importación. ARS y USD se asignan a cada cuenta automáticamente.</>,
                          ].map((step, i) => (
                            <li key={i} className="flex gap-3 text-xs leading-relaxed">
                              <span className="w-4 h-4 rounded-full bg-[#e5e5e5] text-[#525252] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                        <p className="text-xs text-[#737373] bg-[#f5f5f5] rounded-lg px-3 py-2">
                          Las cuotas ("2/3") se guardan en el campo de notas de cada transacción.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Paso 0: Selector de modo ───────────────────────── */}
      {paso === 'modo' && (
        <div className="space-y-5 animate-slide-up-fade">
          <p className="text-sm text-muted-foreground">
            ¿Qué tipo de archivo vas a importar?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Genérico */}
            <button
              onClick={() => setModo('generico')}
              className={`
                group text-left p-5 rounded-2xl border-2 transition-all duration-200 relative overflow-hidden
                ${modo === 'generico'
                  ? 'border-amber-500/60 bg-amber-50/60 dark:bg-amber-950/20'
                  : 'border-border hover:border-border/80 hover:bg-muted/30'
                }
              `}
            >
              {/* bg pattern */}
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
                style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '16px 16px' }}
              />
              {modo === 'generico' && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                modo === 'generico' ? 'bg-amber-500/15 text-amber-600' : 'bg-muted text-muted-foreground group-hover:bg-accent'
              }`}>
                <Table2 className="h-5 w-5" />
              </div>
              <div className="font-semibold text-sm">CSV / Excel genérico</div>
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Cualquier archivo con columnas personalizadas. Mapeo manual.
              </div>
              <div className="flex gap-1 mt-3">
                {['.csv', '.xlsx', '.xls'].map(ext => (
                  <span key={ext} className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-mono text-muted-foreground">{ext}</span>
                ))}
              </div>
            </button>

            {/* Bancario */}
            <button
              onClick={() => setModo('bancario')}
              className={`
                group text-left p-5 rounded-2xl border-2 transition-all duration-200 relative overflow-hidden
                ${modo === 'bancario'
                  ? 'border-amber-500/60 bg-amber-50/60 dark:bg-amber-950/20'
                  : 'border-border hover:border-border/80 hover:bg-muted/30'
                }
              `}
            >
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
                style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '16px 16px' }}
              />
              {modo === 'bancario' && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                modo === 'bancario' ? 'bg-amber-500/15 text-amber-600' : 'bg-muted text-muted-foreground group-hover:bg-accent'
              }`}>
                <Building2 className="h-5 w-5" />
              </div>
              <div className="font-semibold text-sm">Resumen bancario</div>
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Detección automática de columnas. Separa ARS y USD. Filtra cargos.
              </div>
              <div className="flex gap-1 mt-3">
                {parsers.map(p => p.banco).filter((v, i, a) => a.indexOf(v) === i).map(banco => (
                  <span key={banco} className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-mono text-muted-foreground">{banco}</span>
                ))}
                {parsers.length === 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-mono text-muted-foreground">BBVA</span>
                )}
              </div>
            </button>
          </div>

          {/* Config bancaria */}
          {modo === 'bancario' && (
            <div className="rounded-2xl border border-border p-5 space-y-5 animate-slide-up-fade bg-card">
              <div className="text-sm font-semibold">Configuración del banco</div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Banco / Tipo de resumen</Label>
                <Select value={parserId} onValueChange={(v) => v && setParserId(v)}>
                  <SelectTrigger className="bg-muted/40 border-0 h-10">
                    <SelectValue placeholder="Seleccionar banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {parsers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {parserActual && (
                  <p className="text-xs text-muted-foreground">
                    Formatos soportados: {parserActual.tipoArchivo.join(', ')}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Cuenta ARS</Label>
                  <Select value={cuentaARS || null} onValueChange={(v) => setCuentaARS(v === '_none' || !v ? '' : v)}>
                    <SelectTrigger className="bg-muted/40 border-0 h-10">
                      <SelectValue placeholder="Pesos argentinos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Sin cuenta ARS</SelectItem>
                      {cuentas.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Cuenta USD</Label>
                  <Select value={cuentaUSD || null} onValueChange={(v) => setCuentaUSD(v === '_none' || !v ? '' : v)}>
                    <SelectTrigger className="bg-muted/40 border-0 h-10">
                      <SelectValue placeholder="Dólares" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Sin cuenta USD</SelectItem>
                      {cuentas.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  id="excluir-cargos"
                  type="checkbox"
                  checked={excluirCargos}
                  onChange={(e) => setExcluirCargos(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-amber-500"
                />
                <div>
                  <div className="text-sm font-medium group-hover:text-foreground transition-colors">
                    Excluir cargos bancarios
                  </div>
                  <div className="text-xs text-muted-foreground">IVA, percepciones, intereses financieros</div>
                </div>
              </label>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Button
              onClick={() => setPaso('upload')}
              disabled={modo === 'bancario' && (!parserId || (!cuentaARS && !cuentaUSD))}
              className="gap-2 bg-foreground text-background hover:bg-foreground/85 px-6"
            >
              Continuar <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Paso 1: Upload ─────────────────────────────────── */}
      {paso === 'upload' && (
        <div className="space-y-4 animate-slide-up-fade">
          {modo === 'bancario' && parserActual && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/60 rounded-xl text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">
                <span className="text-foreground font-medium">{parserActual.nombre}</span>
                {' '}— formatos: {parserActual.tipoArchivo.join(', ')}
              </span>
            </div>
          )}

          {/* Drop zone */}
          <div
            onClick={() => !loading && fileRef.current?.click()}
            className={`
              relative rounded-2xl border-2 border-dashed p-16 text-center
              transition-all duration-200 group select-none
              ${loading
                ? 'border-amber-400/60 bg-amber-50/40 dark:bg-amber-950/10 cursor-wait'
                : 'border-border hover:border-amber-400/60 hover:bg-amber-50/20 dark:hover:bg-amber-950/10 cursor-pointer'
              }
            `}
          >
            {/* Dot grid bg */}
            <div className="absolute inset-0 rounded-2xl opacity-[0.04] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />

            <div className="relative flex flex-col items-center gap-3">
              {loading ? (
                <>
                  <div className="w-12 h-12 rounded-full border-2 border-amber-400/40 border-t-amber-500 animate-spin" />
                  <p className="text-sm text-muted-foreground font-medium">Procesando archivo…</p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center
                    group-hover:bg-amber-500/10 transition-colors duration-200">
                    <Upload className="h-6 w-6 text-muted-foreground group-hover:text-amber-600 transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Arrastrá o hacé click para seleccionar</p>
                    <p className="text-xs text-muted-foreground">
                      {modo === 'bancario' && parserActual
                        ? parserActual.tipoArchivo.join(', ')
                        : 'CSV, Excel (.xlsx, .xls)'}
                      {' '}— Máximo 10 MB
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept={modo === 'bancario' && parserActual ? parserActual.tipoArchivo.join(',') : '.csv,.xlsx,.xls'}
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            onClick={() => setPaso('modo')}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver
          </button>
        </div>
      )}

      {/* ── Paso 2a: Mapeo genérico ─────────────────────────── */}
      {paso === 'mapeo' && preview && (
        <div className="space-y-6 animate-slide-up-fade">

          {/* Cuenta destino */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Cuenta destino</Label>
            <Select value={cuentaId || null} onValueChange={(v) => v && setCuentaId(v)}>
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
                    <Select value={mapeo[campo]} onValueChange={(v) => v && setMapeo({ ...mapeo, [campo]: v })}>
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
                  <Select value={formatoFecha} onValueChange={(v) => v && setFormatoFecha(v)}>
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
                  <Select value={separadorDecimal} onValueChange={(v) => v && setSeparadorDecimal(v)}>
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
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Vista previa
              </p>
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
                        <td key={col} className="px-4 py-2.5 truncate max-w-[180px] text-foreground/80">
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
            <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              ← Cancelar
            </button>
            <Button
              onClick={handleImportarGenerico}
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
      )}

      {/* ── Paso 2b: Preview bancario ───────────────────────── */}
      {paso === 'preview-bancario' && previewBancario && (
        <div className="space-y-5 animate-slide-up-fade">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-border p-4 space-y-0.5">
              <div className="text-2xl font-bold tabular-nums">{previewBancario.totalTransacciones}</div>
              <div className="text-xs text-muted-foreground">transacciones</div>
            </div>
            {previewBancario.metadatos.periodo && (
              <div className="rounded-2xl border border-border p-4 space-y-0.5">
                <div className="text-lg font-bold">{previewBancario.metadatos.periodo}</div>
                <div className="text-xs text-muted-foreground">período</div>
              </div>
            )}
            {(() => {
              const total = previewBancario.transacciones
              const ars = total.filter(t => t.moneda === 'ARS' && !t.excluida).length
              return (
                <>
                  {ars > 0 && (
                    <div className="rounded-2xl border border-border p-4 space-y-0.5">
                      <div className="text-2xl font-bold tabular-nums">{previewBancario.totalTransacciones - (excluirCargos ? previewBancario.metadatos.filasExcluidas : 0)}</div>
                      <div className="text-xs text-muted-foreground">a importar</div>
                    </div>
                  )}
                  {excluirCargos && previewBancario.metadatos.filasExcluidas > 0 && (
                    <div className="rounded-2xl border border-dashed border-border p-4 space-y-0.5 opacity-60">
                      <div className="text-2xl font-bold tabular-nums">{previewBancario.metadatos.filasExcluidas}</div>
                      <div className="text-xs text-muted-foreground">cargos excluidos</div>
                    </div>
                  )}
                </>
              )
            })()}
          </div>

          {/* Tabla */}
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-3 bg-muted/40 border-b border-border flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Vista previa — primeras {previewBancario.transacciones.length} transacciones
              </p>
              <div className="flex gap-1.5">
                {['ARS', 'USD'].map(m => {
                  const count = previewBancario.transacciones.filter(t => t.moneda === m && !t.excluida).length
                  if (!count) return null
                  return (
                    <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                      {count} {m}
                    </span>
                  )
                })}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase tracking-wide">Fecha</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase tracking-wide">Descripción</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground uppercase tracking-wide">Monto</th>
                    <th className="px-4 py-2.5 text-center font-semibold text-muted-foreground uppercase tracking-wide">Moneda</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase tracking-wide">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {previewBancario.transacciones.map((t, i) => (
                    <tr
                      key={i}
                      className={`
                        border-b border-border/50 last:border-0 transition-colors
                        ${t.excluida
                          ? 'opacity-30'
                          : i % 2 !== 0 ? 'bg-muted/20' : ''
                        }
                      `}
                    >
                      <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground tabular-nums">
                        {new Date(t.fecha).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-4 py-2.5 max-w-[200px] truncate">
                        {t.excluida && <Ban className="inline h-3 w-3 mr-1 text-muted-foreground" />}
                        {t.descripcion}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums font-medium">
                        {t.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`
                          inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold
                          ${t.moneda === 'USD'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                          }
                        `}>
                          {t.moneda}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground italic">
                        {t.notas ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              ← Cancelar
            </button>
            <Button
              onClick={handleImportarBancario}
              disabled={loading}
              className="gap-2 bg-foreground text-background hover:bg-foreground/85 px-6"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border border-background/40 border-t-background rounded-full animate-spin" />
                  Importando…
                </>
              ) : (
                <>
                  Importar {previewBancario.totalTransacciones - (excluirCargos ? previewBancario.metadatos.filasExcluidas : 0)} transacciones
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── Paso 3: Resultado ──────────────────────────────── */}
      {paso === 'resultado' && (
        <div className="animate-slide-up-fade space-y-6">
          {/* Success header */}
          <div className="rounded-2xl border border-green-200 dark:border-green-900/60 bg-green-50/60 dark:bg-green-950/20 p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="font-semibold text-green-900 dark:text-green-300">Importación completada</div>
              <div className="text-sm text-green-700/70 dark:text-green-400/60 mt-0.5">
                Las transacciones fueron agregadas y los balances actualizados.
              </div>
            </div>
          </div>

          {/* Stats del resultado */}
          {resultadoBancario && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-border p-4 space-y-0.5">
                <div className="text-3xl font-bold tabular-nums">{resultadoBancario.importadas}</div>
                <div className="text-xs text-muted-foreground">transacciones importadas</div>
              </div>
              {resultadoBancario.excluidas > 0 && (
                <div className="rounded-2xl border border-dashed border-border p-4 space-y-0.5 opacity-60">
                  <div className="text-3xl font-bold tabular-nums">{resultadoBancario.excluidas}</div>
                  <div className="text-xs text-muted-foreground">cargos excluidos</div>
                </div>
              )}
              {resultadoBancario.periodo && (
                <div className="rounded-2xl border border-border p-4 space-y-0.5">
                  <div className="text-xl font-bold">{resultadoBancario.periodo}</div>
                  <div className="text-xs text-muted-foreground">período importado</div>
                </div>
              )}
            </div>
          )}

          {/* Breakdown por moneda */}
          {resultadoBancario && Object.keys(resultadoBancario.porCuenta).length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {Object.entries(resultadoBancario.porCuenta).map(([moneda, count]) => (
                <span
                  key={moneda}
                  className={`
                    text-xs px-3 py-1.5 rounded-full font-medium
                    ${moneda === 'USD'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                    }
                  `}
                >
                  {count} transacciones en {moneda}
                </span>
              ))}
            </div>
          )}

          {resultadoBancario?.errores && resultadoBancario.errores.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {resultadoBancario.errores.length} filas con errores fueron omitidas.
            </p>
          )}

          <div className="flex gap-3">
            <Button
              onClick={reset}
              className="bg-foreground text-background hover:bg-foreground/85"
            >
              Importar otro archivo
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
