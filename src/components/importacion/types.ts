export type Modo = 'generico' | 'bancario'
export type Paso = 'modo' | 'upload' | 'mapeo' | 'preview-bancario' | 'resultado'

export const FLUJO_GENERICO: Paso[] = ['modo', 'upload', 'mapeo', 'resultado']
export const FLUJO_BANCARIO: Paso[] = ['modo', 'upload', 'preview-bancario', 'resultado']

export const PASO_LABEL: Record<Paso, string> = {
  modo: 'Tipo',
  upload: 'Archivo',
  mapeo: 'Columnas',
  'preview-bancario': 'Preview',
  resultado: 'Listo',
}
