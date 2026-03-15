import { DollarSign } from 'lucide-react'
import { useTasasDolar } from '@/hooks/use-reportes'
import { formatMonto } from '@/lib/formatters'

export function DolarBadge() {
  const { data: tasas } = useTasasDolar()

  const blue = tasas?.find((t) => t.tipo === 'blue')
  if (!blue) return null

  return (
    <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
      <DollarSign className="h-3.5 w-3.5" />
      <span>Blue: {formatMonto(blue.tasa, 'ARS')}</span>
    </div>
  )
}
