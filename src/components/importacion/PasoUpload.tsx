import { type RefObject } from 'react'
import { Upload, Building2 } from 'lucide-react'
import type { Modo } from './types'
import type * as importApi from '@/api/importacion.api'

interface Props {
  modo: Modo
  parserActual: importApi.ParserInfo | undefined
  loading: boolean
  fileRef: RefObject<HTMLInputElement | null>
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onVolver: () => void
}

export function PasoUpload({ modo, parserActual, loading, fileRef, onFileChange, onVolver }: Props) {
  return (
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
        onChange={onFileChange}
      />

      <button
        onClick={onVolver}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Volver
      </button>
    </div>
  )
}
