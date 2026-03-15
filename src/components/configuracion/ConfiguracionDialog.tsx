import { User, Palette, Shield, Monitor } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useUIStore } from '@/stores/ui.store'
import { PerfilSection } from './PerfilSection'
import { AparienciaSection } from './AparienciaSection'
import { SeguridadSection } from './SeguridadSection'
import { SesionesSection } from './SesionesSection'

const tabs = [
  { value: 'perfil', label: 'Perfil', icon: User },
  { value: 'apariencia', label: 'Apariencia', icon: Palette },
  { value: 'seguridad', label: 'Seguridad', icon: Shield },
  { value: 'sesiones', label: 'Sesiones', icon: Monitor },
] as const

export function ConfiguracionDialog() {
  const open = useUIStore((s) => s.configuracionOpen)
  const setOpen = useUIStore((s) => s.setConfiguracionOpen)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden" showCloseButton={false}>
        <Tabs defaultValue="perfil" orientation="vertical" className="h-[520px]">
          {/* Sidebar */}
          <div className="flex flex-col w-48 shrink-0 bg-muted/30 p-4 gap-4">
            <DialogTitle className="text-base font-semibold">Configuracion</DialogTitle>
            <TabsList variant="line" className="flex flex-col gap-1">
              {tabs.map(({ value, label, icon: Icon }) => (
                <TabsTrigger key={value} value={value} className="justify-start gap-2 px-3 py-2 text-sm">
                  <Icon className="h-4 w-4" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <Separator orientation="vertical" />

          {/* Contenido */}
          <TabsContent value="perfil" className="overflow-y-auto p-6">
            <PerfilSection />
          </TabsContent>
          <TabsContent value="apariencia" className="overflow-y-auto p-6">
            <AparienciaSection />
          </TabsContent>
          <TabsContent value="seguridad" className="overflow-y-auto p-6">
            <SeguridadSection />
          </TabsContent>
          <TabsContent value="sesiones" className="overflow-y-auto p-6">
            <SesionesSection />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
