import { memo } from 'react'
import type React from 'react'
import { NavLink } from 'react-router'
import {
  LayoutDashboard,
  Wallet,
  Tags,
  ArrowLeftRight,
  ArrowRightLeft,
  BarChart3,
  Repeat,
  DollarSign,
  Upload,
  Sparkles,
  Settings,
} from 'lucide-react'
import logoConTexto from '@/assets/logo_con_texto_r.png'
import logo from '@/assets/logo.png'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui.store'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type NavItem =
  | { to: string; label: string; icon: React.ElementType; modal?: never }
  | { modal: string; label: string; icon: React.ElementType; to?: never }

const navGroups: { label?: string; items: NavItem[] }[] = [
  {
    items: [
      { to: '/', label: 'Inicio', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { to: '/cuentas', label: 'Cuentas', icon: Wallet },
      { to: '/categorias', label: 'Categorias', icon: Tags },
      { to: '/transacciones', label: 'Transacciones', icon: ArrowLeftRight },
      { to: '/transferencias', label: 'Transferencias', icon: ArrowRightLeft },
    ],
  },
  {
    label: 'Planificacion',
    items: [
      { to: '/reportes', label: 'Reportes', icon: BarChart3 },
      { to: '/recurrentes', label: 'Recurrentes', icon: Repeat },
    ],
  },
  {
    label: 'Herramientas',
    items: [
      { modal: 'moneda', label: 'Moneda', icon: DollarSign },
      { to: '/importar', label: 'Importar', icon: Upload },
      { to: '/reglas', label: 'Reglas', icon: Sparkles },
    ],
  },
]

const settingsItem = { label: 'Configuracion', icon: Settings }

interface SidebarProps {
  className?: string
  forceExpanded?: boolean // mobile always expanded
}

export const Sidebar = memo(function Sidebar({ className, forceExpanded }: SidebarProps) {
  const setConfiguracionOpen = useUIStore((s) => s.setConfiguracionOpen)
  const setMonedaModalOpen = useUIStore((s) => s.setMonedaModalOpen)
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)

  const collapsed = forceExpanded ? false : sidebarCollapsed

  return (
    <aside className={cn('flex flex-col h-full bg-sidebar text-sidebar-foreground overflow-hidden', className)}>
      {/* Logo */}
      <div className={cn(
        'flex items-center h-14 border-b border-sidebar-border shrink-0',
        collapsed && 'justify-center px-0'
      )}>
        {collapsed
          ? <img src={logo} alt="Gastitos" className="h-7 w-7 object-contain" />
          : <img src={logoConTexto} width={100} alt="Gastitos" className="pl-3 object-contain" />
        }
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {navGroups.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-4' : ''}>
            {group.label && !collapsed && (
              <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-medium px-3 pb-1">
                {group.label}
              </p>
            )}
            {group.label && collapsed && (
              <div className="h-px bg-sidebar-border mx-1 mb-2" />
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const { label, icon: Icon } = item
                const key = item.to ?? item.modal ?? label
                const handleClick = item.modal === 'moneda'
                  ? () => { setMonedaModalOpen(true); setSidebarOpen(false) }
                  : undefined

                return (
                <li key={key}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger
                        {...(handleClick
                          ? { onClick: handleClick, className: cn('flex w-full items-center justify-center rounded-md p-2 transition-all duration-150 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground') }
                          : {
                              render: (
                                <NavLink
                                  to={item.to!}
                                  end={item.to === '/'}
                                  className={({ isActive }) =>
                                    cn(
                                      'flex items-center justify-center rounded-md p-2 transition-all duration-150',
                                      isActive
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                    )
                                  }
                                />
                              ),
                            }
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">
                        {label}
                      </TooltipContent>
                    </Tooltip>
                  ) : handleClick ? (
                    <button
                      onClick={handleClick}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:translate-x-0.5"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </button>
                  ) : (
                    <NavLink
                      to={item.to!}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:translate-x-0.5',
                        )
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </NavLink>
                  )}
                </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Configuracion */}
      <div className="px-2 pb-3 border-t border-sidebar-border pt-2">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              onClick={() => { setConfiguracionOpen(true); setSidebarOpen(false) }}
              className="flex w-full items-center justify-center rounded-md p-2 transition-all duration-150 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            >
              <settingsItem.icon className="h-4 w-4 shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {settingsItem.label}
            </TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={() => { setConfiguracionOpen(true); setSidebarOpen(false) }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:translate-x-0.5"
          >
            <settingsItem.icon className="h-4 w-4 shrink-0" />
            {settingsItem.label}
          </button>
        )}
      </div>
    </aside>
  )
})
