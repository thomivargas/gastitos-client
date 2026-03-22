import { useMemo, useState } from 'react'
import { Plus, Landmark, Smartphone, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResumenCuentas } from '@/components/cuentas/ResumenCuentas'
import { InstitucionSection } from '@/components/cuentas/InstitucionSection'
import { CuentaForm } from '@/components/cuentas/CuentaForm'
import { InstitucionForm } from '@/components/cuentas/InstitucionForm'
import { useCuentas } from '@/hooks/use-cuentas'
import type { Cuenta, Institucion, TipoInstitucion } from '@/types'
import { cn } from '@/lib/utils'

// Agrupa cuentas por institución
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

// Agrupa las instituciones por tipo: BANCO, BILLETERA_VIRTUAL, OTRA/sin entidad
type GrupoTipo = {
  tipo: TipoInstitucion | '__sin_entidad__'
  label: string
  icon: React.ComponentType<{ className?: string }>
  instituciones: { inst: Institucion | null; cuentas: Cuenta[] }[]
}

function agruparPorTipo(grupos: { inst: Institucion | null; cuentas: Cuenta[] }[]): GrupoTipo[] {
  const bancos: GrupoTipo['instituciones'] = []
  const billeteras: GrupoTipo['instituciones'] = []
  const otras: GrupoTipo['instituciones'] = []
  const sinEntidad: GrupoTipo['instituciones'] = []

  for (const g of grupos) {
    if (!g.inst) {
      sinEntidad.push(g)
    } else if (g.inst.tipo === 'BANCO') {
      bancos.push(g)
    } else if (g.inst.tipo === 'BILLETERA_VIRTUAL') {
      billeteras.push(g)
    } else {
      otras.push(g)
    }
  }

  const resultado: GrupoTipo[] = []
  if (bancos.length > 0) resultado.push({ tipo: 'BANCO', label: 'Bancos', icon: Landmark, instituciones: bancos })
  if (billeteras.length > 0) resultado.push({ tipo: 'BILLETERA_VIRTUAL', label: 'Billeteras virtuales', icon: Smartphone, instituciones: billeteras })
  if (otras.length > 0) resultado.push({ tipo: 'OTRA', label: 'Otras entidades', icon: Building2, instituciones: otras })
  if (sinEntidad.length > 0) resultado.push({ tipo: '__sin_entidad__', label: 'Sin entidad', icon: Building2, instituciones: sinEntidad })

  return resultado
}

export default function CuentasPage() {
  const [cuentaFormOpen, setCuentaFormOpen] = useState(false)
  const [editCuenta, setEditCuenta] = useState<Cuenta | null>(null)
  const [cuentaDefaultInstitucion, setCuentaDefaultInstitucion] = useState<Institucion | null>(null)
  const [institucionFormOpen, setInstitucionFormOpen] = useState(false)
  const [editInstitucion, setEditInstitucion] = useState<Institucion | null>(null)

  const { data: cuentasActivas, isLoading } = useCuentas({ estado: 'ACTIVA', limit: 100 })

  const gruposActivos = useMemo(
    () => agruparPorInstitucion(cuentasActivas?.data ?? []),
    [cuentasActivas]
  )

  const gruposPorTipo = useMemo(
    () => agruparPorTipo(gruposActivos),
    [gruposActivos]
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

      {/* Cuentas agrupadas por tipo de institución */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2.5">
              <div className="h-4 w-24 rounded shimmer" />
              <div className="rounded-xl border border-border overflow-hidden">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-3 p-3 border-b border-border last:border-0">
                    <div className="h-8 w-8 rounded-lg shimmer shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-28 rounded shimmer" />
                      <div className="h-2.5 w-16 rounded shimmer" />
                    </div>
                    <div className="h-4 w-20 rounded shimmer" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : gruposPorTipo.length === 0 ? (
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
        <div className={cn(
          'grid grid-cols-1 gap-6',
          gruposPorTipo.length === 2 && 'lg:grid-cols-2',
          gruposPorTipo.length === 3 && 'lg:grid-cols-3',
          gruposPorTipo.length >= 4 && 'lg:grid-cols-4',
        )}>
          {gruposPorTipo.map((grupoTipo) => {
            const Icon = grupoTipo.icon
            return (
              <section key={grupoTipo.tipo} className="min-w-0">
                {/* Section header por tipo */}
                <div className="flex items-center gap-2 mb-2.5 px-1">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                    {grupoTipo.label}
                  </h2>
                  <div className="flex-1 h-px bg-border/60" />
                </div>

                {/* Instituciones dentro del tipo */}
                <div className="space-y-2">
                  {grupoTipo.instituciones.map((grupo) => (
                    <InstitucionSection
                      key={grupo.inst?.id ?? '__sin_entidad__'}
                      institucion={grupo.inst}
                      cuentas={grupo.cuentas}
                      onAddCuenta={handleNuevaCuenta}
                      onEditCuenta={handleEditCuenta}
                      onEditInstitucion={grupo.inst && !grupo.inst.oficial ? () => handleEditInstitucion(grupo.inst!) : undefined}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

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
