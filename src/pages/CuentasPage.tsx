import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResumenCuentas } from '@/components/cuentas/ResumenCuentas'
import { InstitucionSection } from '@/components/cuentas/InstitucionSection'
import { CuentaForm } from '@/components/cuentas/CuentaForm'
import { InstitucionForm } from '@/components/cuentas/InstitucionForm'
import { useCuentas } from '@/hooks/use-cuentas'
import type { Cuenta, Institucion } from '@/types'

// Lógica de agrupación por institución:
function agruparPorInstitucion(cuentas: Cuenta[]) {
  const map = new Map<string, { inst: Institucion | null; cuentas: Cuenta[] }>()

  for (const c of cuentas) {
    const key = c.institucion?.id ?? '__sin_entidad__'
    if (!map.has(key)) {
      map.set(key, { inst: c.institucion ?? null, cuentas: [] })
    }
    map.get(key)!.cuentas.push(c)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => {
      if (a === '__sin_entidad__') return 1
      if (b === '__sin_entidad__') return -1
      const nombreA = map.get(a)!.inst?.nombre ?? ''
      const nombreB = map.get(b)!.inst?.nombre ?? ''
      return nombreA.localeCompare(nombreB)
    })
    .map(([, v]) => v)
}

export default function CuentasPage() {
  const [cuentaFormOpen, setCuentaFormOpen] = useState(false)
  const [editCuenta, setEditCuenta] = useState<Cuenta | null>(null)
  const [cuentaDefaultInstitucion, setCuentaDefaultInstitucion] = useState<Institucion | null>(null)
  const [institucionFormOpen, setInstitucionFormOpen] = useState(false)
  const [editInstitucion, setEditInstitucion] = useState<Institucion | null>(null)

  const { data: cuentasActivas } = useCuentas({ estado: 'ACTIVA', limit: 100 })

  const gruposActivos = useMemo(
    () => agruparPorInstitucion(cuentasActivas?.data ?? []),
    [cuentasActivas]
  )

  function handleEditCuenta(cuenta: Cuenta) {
    setEditCuenta(cuenta)
    setCuentaFormOpen(true)
  }

  function handleNuevaCuenta(inst?: Institucion | null) {
    setEditCuenta(null)
    setCuentaDefaultInstitucion(inst ?? null)
    setCuentaFormOpen(true)
  }

  function handleEditInstitucion(inst: Institucion) {
    setEditInstitucion(inst)
    setInstitucionFormOpen(true)
  }

  function handleNuevaInstitucion() {
    setEditInstitucion(null)
    setInstitucionFormOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cuentas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Tus cuentas y activos financieros</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleNuevaInstitucion}>
            <Plus className="h-4 w-4 mr-1" />
            Nueva entidad
          </Button>
          <Button size="sm" onClick={() => handleNuevaCuenta()}>
            <Plus className="h-4 w-4 mr-1" />
            Nueva cuenta
          </Button>
        </div>
      </div>

      {/* Resumen */}
      <ResumenCuentas />

      {/* Cuentas */}
      <div className="space-y-3">
        {gruposActivos.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-sm text-muted-foreground">No tenés cuentas aún.</p>
            <button
              onClick={() => handleNuevaCuenta()}
              className="mt-2 text-sm font-medium text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
            >
              Agregar la primera
            </button>
          </div>
        ) : (
          gruposActivos.map((grupo) => (
            <InstitucionSection
              key={grupo.inst?.id ?? '__sin_entidad__'}
              institucion={grupo.inst}
              cuentas={grupo.cuentas}
              onAddCuenta={handleNuevaCuenta}
              onEditCuenta={handleEditCuenta}
              onEditInstitucion={grupo.inst && !grupo.inst.oficial ? () => handleEditInstitucion(grupo.inst!) : undefined}
            />
          ))
        )}
      </div>

      {/* Dialogs */}
      <CuentaForm
        open={cuentaFormOpen}
        onOpenChange={(open) => { setCuentaFormOpen(open); if (!open) setCuentaDefaultInstitucion(null) }}
        cuenta={editCuenta}
        defaultInstitucion={cuentaDefaultInstitucion}
      />
      <InstitucionForm
        open={institucionFormOpen}
        onOpenChange={(open) => { setInstitucionFormOpen(open); if (!open) setEditInstitucion(null) }}
        institucion={editInstitucion}
      />
    </div>
  )
}
