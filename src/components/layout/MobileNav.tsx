import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Sidebar } from './Sidebar'
import { useUIStore } from '@/stores/ui.store'

export function MobileNav() {
  const mobileOpen = useUIStore((s) => s.sidebarOpen)
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)
  const location = useLocation()

  // Cerrar sidebar en mobile al navegar
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname, setSidebarOpen])

  return (
    <div className="lg:hidden">
      <Sheet open={mobileOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-60">
          <SheetTitle className="sr-only">Menu de navegacion</SheetTitle>
          <Sidebar />
        </SheetContent>
      </Sheet>
    </div>
  )
}
