import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface EmptyStateProps {
  icono: LucideIcon
  titulo: string
  descripcion: string
  accion?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icono: Icon, titulo, descripcion, accion }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="p-4 rounded-full bg-muted mb-4">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{titulo}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-xs mb-6">{descripcion}</p>
      {accion && (
        <Button onClick={accion.onClick}>
          <Plus className="h-4 w-4 mr-2" />
          {accion.label}
        </Button>
      )}
    </div>
  )
}
