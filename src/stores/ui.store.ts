import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'
type Moneda = 'ARS' | 'USD'
type TipoDolar = 'blue' | 'mep' | 'oficial'

interface UIState {
  sidebarOpen: boolean
  configuracionOpen: boolean
  theme: Theme
  monedaDisplay: Moneda
  tipoDolar: TipoDolar

  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setConfiguracionOpen: (open: boolean) => void
  setTheme: (theme: Theme) => void
  setMonedaDisplay: (moneda: Moneda) => void
  setTipoDolar: (tipo: TipoDolar) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  configuracionOpen: false,
  theme: (localStorage.getItem('theme') as Theme) || 'system',
  monedaDisplay: (localStorage.getItem('monedaDisplay') as Moneda) || 'ARS',
  tipoDolar: (localStorage.getItem('tipoDolar') as TipoDolar) || 'blue',

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setConfiguracionOpen: (open) => set({ configuracionOpen: open }),
  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    applyTheme(theme)
    set({ theme })
  },
  setMonedaDisplay: (moneda) => {
    localStorage.setItem('monedaDisplay', moneda)
    set({ monedaDisplay: moneda })
  },
  setTipoDolar: (tipo) => {
    localStorage.setItem('tipoDolar', tipo)
    set({ tipoDolar: tipo })
  },
}))

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// Aplicar tema inicial (el script inline en index.html ya previene FOUC)
applyTheme(useUIStore.getState().theme)

// Sincronizar cuando cambia la preferencia del sistema
const mql = window.matchMedia('(prefers-color-scheme: dark)')
mql.addEventListener('change', () => {
  if (useUIStore.getState().theme === 'system') {
    applyTheme('system')
  }
})
