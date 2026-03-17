import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { useCuentas } from '@/hooks/use-cuentas'
import * as importApi from '@/api/importacion.api'

import { StepRail } from '@/components/importacion/StepRail'
import { AyudaModal } from '@/components/importacion/AyudaModal'
import { ConfigBancarioModal } from '@/components/importacion/ConfigBancarioModal'
import { PasoModo } from '@/components/importacion/PasoModo'
import { PasoUpload } from '@/components/importacion/PasoUpload'
import { PasoMapeo } from '@/components/importacion/PasoMapeo'
import { PasoPreviewBancario } from '@/components/importacion/PasoPreviewBancario'
import { PasoResultado } from '@/components/importacion/PasoResultado'
import type { Modo, Paso } from '@/components/importacion/types'

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
  const [periodoResumen, setPeriodoResumen] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [configBancarioOpen, setConfigBancarioOpen] = useState(false)
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
        fechaResumen: `${periodoResumen}-01`,
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
    const now = new Date()
    setPeriodoResumen(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
    if (fileRef.current) fileRef.current.value = ''
  }

  const parserActual = parsers.find((p) => p.id === parserId)
  const resultadoBancario = resultado?.data as importApi.ResultadoBancario | undefined
  const showRail = paso !== 'modo'

  return (
    <div className="space-y-8 page-transition">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight">Importar</h1>
          {showRail && <StepRail paso={paso} modo={modo} />}
        </div>
        <div className="flex gap-2 shrink-0 pt-0.5">
          <AyudaModal />
        </div>
      </div>

      {/* Paso 0: Selector de modo */}
      {paso === 'modo' && (
        <>
          <PasoModo
            modo={modo}
            onModoChange={setModo}
            parsers={parsers}
            onContinuar={() => {
              if (modo === 'bancario') setConfigBancarioOpen(true)
              else setPaso('upload')
            }}
          />
          <ConfigBancarioModal
            open={configBancarioOpen}
            onClose={() => setConfigBancarioOpen(false)}
            onConfirm={() => { setConfigBancarioOpen(false); setPaso('upload') }}
            parsers={parsers}
            parserId={parserId}
            onParserIdChange={setParserId}
            parserActual={parserActual}
            cuentas={cuentas}
            cuentaARS={cuentaARS}
            onCuentaARSChange={setCuentaARS}
            cuentaUSD={cuentaUSD}
            onCuentaUSDChange={setCuentaUSD}
            periodoResumen={periodoResumen}
            onPeriodoResumenChange={setPeriodoResumen}
            excluirCargos={excluirCargos}
            onExcluirCargosChange={setExcluirCargos}
          />
        </>
      )}

      {/* Paso 1: Upload */}
      {paso === 'upload' && (
        <PasoUpload
          modo={modo}
          parserActual={parserActual}
          loading={loading}
          fileRef={fileRef}
          onFileChange={handleFileChange}
          onVolver={() => setPaso('modo')}
        />
      )}

      {/* Paso 2a: Mapeo genérico */}
      {paso === 'mapeo' && preview && (
        <PasoMapeo
          preview={preview}
          cuentas={cuentas}
          cuentaId={cuentaId}
          onCuentaIdChange={setCuentaId}
          mapeo={mapeo}
          onMapeoChange={setMapeo}
          formatoFecha={formatoFecha}
          onFormatoFechaChange={setFormatoFecha}
          separadorDecimal={separadorDecimal}
          onSeparadorDecimalChange={setSeparadorDecimal}
          loading={loading}
          onImportar={handleImportarGenerico}
          onCancelar={reset}
        />
      )}

      {/* Paso 2b: Preview bancario */}
      {paso === 'preview-bancario' && previewBancario && (
        <PasoPreviewBancario
          previewBancario={previewBancario}
          excluirCargos={excluirCargos}
          loading={loading}
          onImportar={handleImportarBancario}
          onCancelar={reset}
        />
      )}

      {/* Paso 3: Resultado */}
      {paso === 'resultado' && (
        <PasoResultado
          resultadoBancario={resultadoBancario}
          onReset={reset}
        />
      )}
    </div>
  )
}
