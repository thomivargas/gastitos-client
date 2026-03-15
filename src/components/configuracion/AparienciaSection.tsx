import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui.store'

export function AparienciaSection() {
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)

  return (
    <div className="space-y-4">
      <h3 className="text-base font-medium">Apariencia</h3>
      <div className="flex gap-2">
        {(['light', 'dark', 'system'] as const).map((t) => (
          <Button
            key={t}
            variant={theme === t ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme(t)}
            className="capitalize"
          >
            {t === 'light' ? 'Claro' : t === 'dark' ? 'Oscuro' : 'Sistema'}
          </Button>
        ))}
      </div>
    </div>
  )
}
