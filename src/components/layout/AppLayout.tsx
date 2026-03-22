import { Outlet, useLocation } from 'react-router'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { GlobalFetchingIndicator } from './GlobalFetchingIndicator'
import { ConfiguracionDialog } from '@/components/configuracion/ConfiguracionDialog'
import { MonedaModal } from '@/components/moneda/MonedaModal'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useUIStore } from '@/stores/ui.store'

export function AppLayout() {
  const location = useLocation()
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)

  const sidebarW = sidebarCollapsed ? 'w-14' : 'w-60'

  return (
    <TooltipProvider>
      <GlobalFetchingIndicator />
      <div className="min-h-screen flex">
        {/* Desktop sidebar */}
        <div className={`hidden lg:block ${sidebarW} border-r border-sidebar-border shrink-0 transition-[width] duration-200`}>
          <Sidebar className={`fixed top-0 left-0 ${sidebarW} h-screen transition-[width] duration-200`} />
        </div>

        {/* Mobile sidebar — Sheet overlay */}
        <MobileNav />
        <ConfiguracionDialog />
        <MonedaModal />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div key={location.pathname} className="animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
