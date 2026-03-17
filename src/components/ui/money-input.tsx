import * as React from 'react'
import { cn } from '@/lib/utils'

interface MoneyInputProps {
  value: number | string | undefined
  onChange: (valor: number) => void
  moneda?: string
  className?: string
  id?: string
  placeholder?: string
  disabled?: boolean
}

/**
 * Input de monto que auto-formatea como moneda argentina.
 * Muestra "$ 1.000,00" mientras se escribe.
 */
export function MoneyInput({
  value,
  onChange,
  moneda = 'ARS',
  className,
  id,
  placeholder = '0,00',
  disabled,
}: MoneyInputProps) {
  const [displayValue, setDisplayValue] = React.useState('')
  const [isFocused, setIsFocused] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Formatea un numero a formato display (sin simbolo de moneda)
  const formatDisplay = React.useCallback((num: number): string => {
    if (num === 0 && !isFocused) return ''
    const formatted = new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(num))
    return num < 0 ? `-${formatted}` : formatted
  }, [isFocused])

  const toNum = (v: number | string | undefined): number => {
    if (v == null) return 0
    const n = typeof v === 'string' ? parseFloat(v) : v
    return Number.isFinite(n) ? n : 0
  }

  // Sincronizar valor externo al display cuando no tiene foco
  React.useEffect(() => {
    if (!isFocused) {
      const num = toNum(value)
      setDisplayValue(num === 0 ? '' : formatDisplay(num))
    }
  }, [value, isFocused, formatDisplay])

  const parseInput = (raw: string): { num: number; cleaned: string } => {
    // Permitir signo negativo al inicio
    const isNegative = raw.startsWith('-')
    // Remover todo excepto digitos y coma
    let cleaned = raw.replace(/[^\d,]/g, '')

    // Solo permitir una coma
    const parts = cleaned.split(',')
    if (parts.length > 2) {
      cleaned = parts[0] + ',' + parts.slice(1).join('')
    }

    // Limitar decimales a 2
    if (parts.length === 2 && parts[1].length > 2) {
      cleaned = parts[0] + ',' + parts[1].slice(0, 2)
    }

    // Convertir a numero
    const numStr = cleaned.replace(',', '.')
    const num = parseFloat(numStr) || 0

    return { num: isNegative ? -num : num, cleaned: isNegative ? `-${cleaned}` : cleaned }
  }

  const formatWhileTyping = (cleaned: string): string => {
    if (!cleaned || cleaned === '-') return cleaned
    const isNegative = cleaned.startsWith('-')
    const abs = isNegative ? cleaned.slice(1) : cleaned

    const parts = abs.split(',')
    // Formatear parte entera con separadores de miles
    const intPart = parts[0].replace(/^0+(?=\d)/, '') || '0'
    const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    const result = parts.length > 1 ? `${formatted},${parts[1]}` : formatted
    return isNegative ? `-${result}` : result
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    const { num, cleaned } = parseInput(raw)
    const formatted = formatWhileTyping(cleaned)
    setDisplayValue(formatted)
    onChange(num)
  }

  function handleFocus() {
    setIsFocused(true)
    const num = toNum(value)
    if (num !== 0) {
      // Mostrar con coma decimal, sin separador de miles para edicion mas facil
      const abs = Math.abs(num)
      const str = abs % 1 === 0 ? abs.toString() : abs.toFixed(2).replace('.', ',')
      setDisplayValue(num < 0 ? `-${str}` : str)
    }
  }

  function handleBlur() {
    setIsFocused(false)
    const num = toNum(value)
    setDisplayValue(num === 0 ? '' : formatDisplay(num))
  }

  const simbolo = moneda === 'USD' ? 'US$' : '$'

  return (
    <div className="relative">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none select-none">
        {simbolo}
      </span>
      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent pr-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30 tabular-nums text-right',
          moneda === 'USD' ? 'pl-10' : 'pl-7',
          className,
        )}
      />
    </div>
  )
}
