import { useState, useRef, useEffect } from 'react'
import { Upload, Download, FileSpreadsheet, Building2, Table2, CheckCircle2, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

const PASOS_LABEL: Record<Paso, string> = {
  modo: 'Modo',
  upload: 'Archivo',
  mapeo: 'Mapeo',
  'preview-bancario': 'Preview',
  resultado: 'Resultado',
}

function PasoIndicador({ pasoActual }: { pasoActual: Paso }) {
  const modoFlow: Paso[] = ['modo', 'upload', 'mapeo', 'resultado']
  const bancarioFlow: Paso[] = ['modo', 'upload', 'preview-bancario', 'resultado']
  const flujo = pasoActual === 'mapeo' || (pasoActual === 'modo' || pasoActual === 'upload')
    ? modoFlow : bancarioFlow
  const idx = flujo.indexOf(pasoActual)
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      {flujo.map((p, i) => (
        <span key={p} className="flex items-center gap-1">
          <span className={i <= idx ? 'text-foreground font-medium' : ''}>{PASOS_LABEL[p]}</span>
          {i < flujo.length - 1 && <ChevronRight className="h-3 w-3" />}
        </span>
      ))}
    </div>
  )
}

export default function ImportacionPage() {
  const { data: cuentasData } = useCuentas({ estado: 'ACTIVA', limit: 50 })
  const cuentas = cuentasData?.data || []
  const fileRef = useRef<HTMLInputElement>(null)

  // Paso del wizard
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

  // Resultado
  const [resultado, setResultado] = useState<{ status: string; data?: unknown } | null>(null)

  useEffect(() => {
    importApi.listarParsers().then(setParsers).catch(() => {})
  }, [])

  // Cuando cambia el modo, pre-seleccionar parser si solo hay uno
  useEffect(() => {
    if (modo === 'bancario' && parsers.length === 1) {
      setParserId(parsers[0]!.id)
    }
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
        // Auto-mapeo
        const cols = data.columnas.map((c) => c.toLowerCase())
        const encontrar = (...terminos: string[]) =>
          data.columnas[cols.findIndex((c) => terminos.some((t) => c.includes(t)))] || ''
        setMapeo({
          fecha: encontrar('fecha', 'date', 'día', 'dia'),
          monto: encontrar('monto', 'amount', 'importe', 'débito', 'debito', 'cargo', 'pesos'),
          descripcion: encontrar('desc', 'establecimiento', 'concepto', 'detalle', 'comercio', 'movimiento'),
        })
        // Auto-detectar separador decimal
        const montoCol = encontrar('monto', 'amount', 'importe', 'débito', 'debito', 'cargo', 'pesos')
        if (montoCol && data.filas.length > 0) {
          const muestra = data.filas[0]?.[montoCol] ?? ''
          if (/\d\.\d{3},\d/.test(muestra)) setSeparadorDecimal(',')
        }
        // Auto-detectar formato de fecha
        const fechaCol = encontrar('fecha', 'date', 'día', 'dia')
        if (fechaCol && data.filas.length > 0) {
          const muestra = data.filas[0]?.[fechaCol] ?? ''
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(muestra)) setFormatoFecha('DD/MM/YYYY')
          else if (/^\d{4}-\d{2}-\d{2}$/.test(muestra)) setFormatoFecha('YYYY-MM-DD')
          else if (/^\d{2}-\d{2}-\d{4}$/.test(muestra)) setFormatoFecha('DD-MM-YYYY')
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

  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Importar / Exportar</h1>
          {paso !== 'modo' && (
            <div className="mt-1">
              <PasoIndicador pasoActual={paso} />
            </div>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => importApi.descargarPlantilla()}>
            <FileSpreadsheet className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Plantilla</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => importApi.exportar()}>
            <Download className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
      </div>

      {/* Paso 0: Selector de modo */}
      {paso === 'modo' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setModo('generico')}
              className={`text-left p-4 rounded-xl border-2 transition-colors ${
                modo === 'generico'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Table2 className="h-8 w-8 mb-2 text-muted-foreground" />
              <div className="font-semibold">CSV / Excel genérico</div>
              <div className="text-sm text-muted-foreground mt-1">
                Importa cualquier archivo con mapeo manual de columnas
              </div>
            </button>
            <button
              onClick={() => setModo('bancario')}
              className={`text-left p-4 rounded-xl border-2 transition-colors ${
                modo === 'bancario'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Building2 className="h-8 w-8 mb-2 text-muted-foreground" />
              <div className="font-semibold">Resumen bancario</div>
              <div className="text-sm text-muted-foreground mt-1">
                Importa el resumen de tu banco con detección automática
              </div>
            </button>
          </div>

          {modo === 'bancario' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configuración bancaria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Banco / Tipo de resumen</Label>
                  <Select value={parserId} onValueChange={(v) => v && setParserId(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar banco" />
                    </SelectTrigger>
                    <SelectContent>
                      {parsers.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {parserActual && (
                    <p className="text-xs text-muted-foreground">
                      Formatos: {parserActual.tipoArchivo.join(', ')}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cuenta ARS (pesos)</Label>
                    <Select value={cuentaARS || null} onValueChange={(v) => setCuentaARS(v === '_none' ? '' : v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cuenta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">Sin cuenta ARS</SelectItem>
                        {cuentas.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cuenta USD (dólares)</Label>
                    <Select value={cuentaUSD || null} onValueChange={(v) => setCuentaUSD(v === '_none' ? '' : v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cuenta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">Sin cuenta USD</SelectItem>
                        {cuentas.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="excluir-cargos"
                    type="checkbox"
                    checked={excluirCargos}
                    onChange={(e) => setExcluirCargos(e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <Label htmlFor="excluir-cargos" className="font-normal cursor-pointer">
                    Excluir cargos bancarios (IVA, percepciones, intereses)
                  </Label>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button
              onClick={() => setPaso('upload')}
              disabled={modo === 'bancario' && (!parserId || (!cuentaARS && !cuentaUSD))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Paso 1: Upload */}
      {paso === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subir archivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {modo === 'bancario' && parserActual && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>
                  <span className="font-medium">{parserActual.nombre}</span>
                  {' — '}formatos aceptados: {parserActual.tipoArchivo.join(', ')}
                </span>
              </div>
            )}
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click para seleccionar un archivo</p>
              <p className="text-xs text-muted-foreground mt-1">
                {modo === 'bancario' && parserActual
                  ? `${parserActual.tipoArchivo.join(', ')} — Máximo 10MB`
                  : 'CSV, Excel (.xlsx, .xls) — Máximo 10MB'}
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept={
                modo === 'bancario' && parserActual
                  ? parserActual.tipoArchivo.join(',')
                  : '.csv,.xlsx,.xls'
              }
              className="hidden"
              onChange={handleFileChange}
            />
            {loading && <p className="text-sm text-muted-foreground">Procesando archivo...</p>}
            <div className="flex justify-start">
              <Button variant="outline" onClick={() => setPaso('modo')}>Volver</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paso 2a: Mapeo genérico */}
      {paso === 'mapeo' && preview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mapear columnas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Cuenta destino</Label>
              <Select value={cuentaId || null} onValueChange={(v) => v && setCuentaId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cuenta" />
                </SelectTrigger>
                <SelectContent>
                  {cuentas.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(['fecha', 'monto', 'descripcion'] as const).map((campo) => (
                <div key={campo} className="space-y-1">
                  <Label className="capitalize">{campo} *</Label>
                  <Select value={mapeo[campo]} onValueChange={(v) => v && setMapeo({ ...mapeo, [campo]: v })}>
                    <SelectTrigger><SelectValue placeholder="Columna" /></SelectTrigger>
                    <SelectContent>
                      {preview.columnas.map((col) => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Formato fecha</Label>
                <Select value={formatoFecha} onValueChange={(v) => v && setFormatoFecha(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Separador decimal</Label>
                <Select value={separadorDecimal} onValueChange={(v) => v && setSeparadorDecimal(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value=".">Punto (.)</SelectItem>
                    <SelectItem value=",">Coma (,)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    {preview.columnas.map((col) => (
                      <th key={col} className="px-3 py-2 text-left font-medium">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.filas.slice(0, 5).map((fila, i) => (
                    <tr key={i} className="border-t">
                      {preview.columnas.map((col) => (
                        <td key={col} className="px-3 py-1.5 truncate max-w-[200px]">{fila[col]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">{preview.totalFilas} filas totales</p>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={reset}>Cancelar</Button>
              <Button
                onClick={handleImportarGenerico}
                disabled={loading || !cuentaId || !mapeo.fecha || !mapeo.monto || !mapeo.descripcion}
              >
                {loading ? 'Importando...' : 'Importar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paso 2b: Preview bancario */}
      {paso === 'preview-bancario' && previewBancario && (
        <div className="space-y-4">
          {/* Resumen */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div>
                  <div className="text-2xl font-bold">{previewBancario.totalTransacciones}</div>
                  <div className="text-xs text-muted-foreground">transacciones</div>
                </div>
                {previewBancario.metadatos.periodo && (
                  <div>
                    <div className="text-lg font-semibold">{previewBancario.metadatos.periodo}</div>
                    <div className="text-xs text-muted-foreground">período</div>
                  </div>
                )}
                {previewBancario.metadatos.filasExcluidas > 0 && excluirCargos && (
                  <div className="ml-auto">
                    <Badge variant="secondary">
                      {previewBancario.metadatos.filasExcluidas} cargos bancarios excluidos
                    </Badge>
                  </div>
                )}
              </div>

              {/* Breakdown por moneda */}
              {(() => {
                const porMoneda = previewBancario.transacciones.reduce<Record<string, number>>((acc, t) => {
                  if (!t.excluida) acc[t.moneda] = (acc[t.moneda] ?? 0) + 1
                  return acc
                }, {})
                return Object.keys(porMoneda).length > 0 ? (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {Object.entries(porMoneda).map(([moneda, count]) => (
                      <Badge key={moneda} variant="outline">{count} en {moneda}</Badge>
                    ))}
                    <span className="text-xs text-muted-foreground self-center">(de las primeras 10 mostradas)</span>
                  </div>
                ) : null
              })()}
            </CardContent>
          </Card>

          {/* Tabla preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Primeras {previewBancario.transacciones.length} transacciones (preview)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Fecha</th>
                      <th className="px-3 py-2 text-left font-medium">Descripción</th>
                      <th className="px-3 py-2 text-right font-medium">Monto</th>
                      <th className="px-3 py-2 text-center font-medium">Moneda</th>
                      <th className="px-3 py-2 text-left font-medium">Notas</th>
                      <th className="px-3 py-2 text-center font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewBancario.transacciones.map((t, i) => (
                      <tr key={i} className={`border-t ${t.excluida ? 'opacity-40' : ''}`}>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {new Date(t.fecha).toLocaleDateString('es-AR')}
                        </td>
                        <td className="px-3 py-2 max-w-[220px] truncate">{t.descripcion}</td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums">
                          {t.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <Badge variant={t.moneda === 'USD' ? 'default' : 'secondary'} className="text-xs">
                            {t.moneda}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{t.notas ?? '—'}</td>
                        <td className="px-3 py-2 text-center">
                          {t.excluida ? (
                            <span className="text-xs text-muted-foreground">Excluida</span>
                          ) : (
                            <span className="text-xs text-green-600">✓</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={reset}>Cancelar</Button>
            <Button onClick={handleImportarBancario} disabled={loading}>
              {loading
                ? 'Importando...'
                : `Importar ${previewBancario.totalTransacciones - (excluirCargos ? previewBancario.metadatos.filasExcluidas : 0)} transacciones`}
            </Button>
          </div>
        </div>
      )}

      {/* Paso 3: Resultado */}
      {paso === 'resultado' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Importacion completada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resultadoBancario ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{resultadoBancario.importadas}</div>
                    <div className="text-xs text-muted-foreground">importadas</div>
                  </div>
                  {resultadoBancario.excluidas > 0 && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{resultadoBancario.excluidas}</div>
                      <div className="text-xs text-muted-foreground">cargos excluidos</div>
                    </div>
                  )}
                  {resultadoBancario.periodo && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-lg font-semibold">{resultadoBancario.periodo}</div>
                      <div className="text-xs text-muted-foreground">período</div>
                    </div>
                  )}
                </div>
                {Object.keys(resultadoBancario.porCuenta).length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(resultadoBancario.porCuenta).map(([moneda, count]) => (
                      <Badge key={moneda} variant="outline">{count} en {moneda}</Badge>
                    ))}
                  </div>
                )}
                {resultadoBancario.errores.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {resultadoBancario.errores.length} filas con errores omitidas
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Importacion completada correctamente.</p>
            )}
            <Button onClick={reset}>Importar otro archivo</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
