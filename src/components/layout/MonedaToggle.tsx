import { useUIStore } from '@/stores/ui.store'

export function MonedaToggle() {
  const moneda = useUIStore((s) => s.monedaDisplay)
  const setMoneda = useUIStore((s) => s.setMonedaDisplay)

  return (
    <div className="hidden sm:flex items-center">
      <div className="flex items-center rounded-lg border bg-muted/50 p-0.5 text-xs font-medium">
        <button
          type="button"
          onClick={() => setMoneda('ARS')}
          className={`rounded-md px-2.5 py-1 transition-colors ${
            moneda === 'ARS'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          ARS
        </button>
        <button
          type="button"
          onClick={() => setMoneda('USD')}
          className={`rounded-md px-2.5 py-1 transition-colors ${
            moneda === 'USD'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          USD
        </button>
      </div>
    </div>
  )
}
