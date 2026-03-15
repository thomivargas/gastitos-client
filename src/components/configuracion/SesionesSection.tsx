import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import * as authApi from '@/api/auth.api'

export function SesionesSection() {
  const [sesiones, setSesiones] = useState<authApi.SesionActiva[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    authApi.listarSesiones()
      .then(setSesiones)
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [])

  async function cerrarSesion(id: string) {
    try {
      await authApi.cerrarSesion(id)
      setSesiones((s) => s.filter((x) => x.id !== id))
      toast.success('Sesion cerrada')
    } catch { /* */ }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-medium">Sesiones activas</h3>
      {cargando ? (
        <Spinner />
      ) : (
        <div className="space-y-2">
          {sesiones.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="font-medium">{s.userAgent?.split(' ')[0] || 'Desconocido'}</p>
                <p className="text-xs text-muted-foreground">{s.ipAddress || 'IP desconocida'}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => cerrarSesion(s.id)}>
                Cerrar
              </Button>
            </div>
          ))}
          {sesiones.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay sesiones activas</p>
          )}
        </div>
      )}
    </div>
  )
}
