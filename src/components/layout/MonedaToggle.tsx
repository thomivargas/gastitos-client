import { useUIStore } from '@/stores/ui.store'

const TIPOS_DOLAR = [
  { value: 'blue', label: 'Blue' },
  { value: 'mep', label: 'MEP' },
  { value: 'oficial', label: 'Oficial' },
] as const

export function MonedaToggle() {
  const moneda = useUIStore((s) => s.monedaDisplay)
  const setMoneda = useUIStore((s) => s.setMonedaDisplay)
  const tipoDolar = useUIStore((s) => s.tipoDolar)
  const setTipoDolar = useUIStore((s) => s.setTipoDolar)

  return (
    <div className="hidden sm:flex items-center gap-2">
      {/* Toggle ARS / USD */}
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

      {/* Tipo de dolar */}
      <div className="flex items-center rounded-lg border bg-muted/50 p-0.5 text-[10px] font-medium">
        {TIPOS_DOLAR.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTipoDolar(value)}
            className={`rounded-md px-2 py-1 transition-colors ${
              tipoDolar === value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
