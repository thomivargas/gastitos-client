import { useState, useRef } from 'react'
import { Upload, Download, FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { useCuentas } from '@/hooks/use-cuentas'
import * as importApi from '@/api/importacion.api'

export default function ImportacionPage() {
  const { data: cuentasData } = useCuentas({ estado: 'ACTIVA', limit: 50 })
  const cuentas = cuentasData?.data || []
  const fileRef = useRef<HTMLInputElement>(null)

  // State
  const [paso, setPaso] = useState<'upload' | 'mapeo' | 'resultado'>('upload')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [preview, setPreview] = useState<importApi.PreviewData | null>(null)
  const [loading, setLoading] = useState(false)

  // Config
  const [cuentaId, setCuentaId] = useState('')
  const [mapeo, setMapeo] = useState<importApi.MapeoColumnas>({ fecha: '', monto: '', descripcion: '' })
  const [formatoFecha, setFormatoFecha] = useState('YYYY-MM-DD')
  const [separadorDecimal, setSeparadorDecimal] = useState('.')

  // Resultado
  const [resultado, setResultado] = useState<{ status: string; message?: string; data?: unknown } | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setArchivo(file)
    setLoading(true)
    try {
      const data = await importApi.preview(file)
      setPreview(data)
      // Auto-mapeo: buscar columnas con nombres comunes
      const cols = data.columnas.map((c) => c.toLowerCase())
      setMapeo({
        fecha: data.columnas[cols.findIndex((c) => c.includes('fecha') || c.includes('date'))] || '',
        monto: data.columnas[cols.findIndex((c) => c.includes('monto') || c.includes('amount'))] || '',
        descripcion: data.columnas[cols.findIndex((c) => c.includes('desc'))] || '',
      })
      setPaso('mapeo')
    } catch {
      toast.error('Error al leer el archivo')
    }
    setLoading(false)
  }

  async function handleImportar() {
    if (!archivo || !cuentaId) return
    setLoading(true)
    try {
      const res = await importApi.ejecutar(archivo, {
        cuentaId,
        mapeo,
        formatoFecha,
        separadorDecimal,
      })
      setResultado(res)
      setPaso('resultado')
      toast.success('Importacion completada')
    } catch {
      toast.error('Error en la importacion')
    }
    setLoading(false)
  }

  function reset() {
    setPaso('upload')
    setArchivo(null)
    setPreview(null)
    setResultado(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-6 page-transition">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Importar / Exportar</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => importApi.descargarPlantilla()}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Plantilla
          </Button>
          <Button variant="outline" size="sm" onClick={() => importApi.exportar()}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {paso === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Paso 1: Subir archivo CSV</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click para seleccionar un archivo CSV</p>
              <p className="text-xs text-muted-foreground mt-1">Maximo 5MB</p>
            </div>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            {loading && <p className="text-sm text-muted-foreground">Procesando...</p>}
          </CardContent>
        </Card>
      )}

      {paso === 'mapeo' && preview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Paso 2: Mapear columnas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Cuenta destino</Label>
              <Select value={cuentaId || null} onValueChange={(v) => v && setCuentaId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cuenta">
                    {(value: string) => {
                      if (!value) return 'Seleccionar cuenta'
                      return cuentas.find((x) => x.id === value)?.nombre ?? value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {cuentas.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
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

            {/* Preview filas */}
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
              <Button variant="outline" onClick={reset}>Volver</Button>
              <Button onClick={handleImportar} disabled={loading || !cuentaId || !mapeo.fecha || !mapeo.monto || !mapeo.descripcion}>
                {loading ? 'Importando...' : 'Importar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {paso === 'resultado' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resultado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{resultado?.message || 'Importacion completada'}</p>
            <Button onClick={reset}>Importar otro archivo</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
