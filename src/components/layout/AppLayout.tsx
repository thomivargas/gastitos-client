import { Outlet, useLocation } from 'react-router'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { ConfiguracionDialog } from '@/components/configuracion/ConfiguracionDialog'
import { TooltipProvider } from '@/components/ui/tooltip'

export function AppLayout() {
  const location = useLocation()

  return (
    <TooltipProvider>
      <div className="min-h-screen flex">
        {/* Desktop sidebar — siempre visible en lg+ */}
        <div className="hidden lg:block w-60 border-r border-sidebar-border shrink-0">
          <Sidebar className="fixed top-0 left-0 w-60 h-screen" />
        </div>

        {/* Mobile sidebar — Sheet overlay */}
        <MobileNav />
        <ConfiguracionDialog />

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
