import { useLocation } from 'react-router'
import { Menu, Moon, Sun, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'
import { useLogout } from '@/hooks/use-auth'
import { DolarBadge } from './DolarBadge'
import { MonedaToggle } from './MonedaToggle'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Inicio',
  '/cuentas': 'Cuentas',
  '/categorias': 'Categorias',
  '/transacciones': 'Transacciones',
  '/transferencias': 'Transferencias',
  '/presupuestos': 'Presupuestos',
  '/reportes': 'Reportes',
  '/recurrentes': 'Recurrentes',
  '/moneda': 'Moneda',
  '/importar': 'Importar / Exportar',
  '/reglas': 'Reglas',
  '/configuracion': 'Configuracion',
}

function getPageTitle(pathname: string): string | null {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.startsWith('/cuentas/')) return 'Detalle de cuenta'
  if (pathname.startsWith('/presupuestos/')) return 'Detalle de presupuesto'
  return null
}

export function Header() {
  const usuario = useAuthStore((s) => s.usuario)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const toggleSidebarCollapsed = useUIStore((s) => s.toggleSidebarCollapsed)
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)
  const logout = useLogout()
  const location = useLocation()

  const pageTitle = getPageTitle(location.pathname)

  const initials = usuario?.nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?'

  function toggleTheme() {
    if (theme === 'dark') setTheme('light')
    else setTheme('dark')
  }

  return (
    <header className="flex items-center h-14 px-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10 gap-3">
      {/* Mobile: hamburger */}
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden shrink-0" aria-label="Abrir menu">
        <Menu className="h-5 w-5" />
      </Button>

      {/* Desktop: collapse toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebarCollapsed}
        className="hidden lg:flex shrink-0"
        aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
      >
        {sidebarCollapsed
          ? <PanelLeftOpen className="h-4 w-4" />
          : <PanelLeftClose className="h-4 w-4" />
        }
      </Button>

      {/* Título de página: solo en mobile */}
      <div className="flex-1 min-w-0 lg:hidden">
        {pageTitle && (
          <h2 className="text-sm font-medium text-muted-foreground truncate">
            {pageTitle}
          </h2>
        )}
      </div>

      {/* Spacer en desktop */}
      <div className="flex-1 hidden lg:block" />

      {location.pathname === '/' && <MonedaToggle />}
      {location.pathname === '/' && <DolarBadge />}

      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Cambiar tema">
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger className="relative flex items-center justify-center h-8 w-8 rounded-full hover:bg-accent cursor-pointer transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{usuario?.nombre}</p>
            <p className="text-xs text-muted-foreground">{usuario?.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout.mutate()}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
