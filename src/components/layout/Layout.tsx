import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar'
import { Menu, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

function LayoutContent() {
  const { open, setOpen, isMobile, collapsed, setCollapsed } = useSidebar()

  // Overlay para mobile
  const handleOverlayClick = () => {
    if (isMobile) {
      setOpen(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Overlay para mobile */}
      {open && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300"
          onClick={handleOverlayClick}
        />
      )}

      <AppSidebar />
      
      <main className={cn(
        'transition-all duration-300',
        // Mobile: sempre sem padding
        // Desktop: ajusta padding baseado no estado do menu
        isMobile 
          ? 'lg:pl-0' 
          : collapsed 
            ? 'lg:pl-20' // Menu colapsado = 80px (w-20)
            : 'lg:pl-64' // Menu expandido = 256px (w-64)
      )}>
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-200 bg-white/80 backdrop-blur-sm px-4 md:px-6 py-4 shadow-sm">
          {/* Botão Menu Mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!open)}
            className="lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Botão Toggle Desktop */}
          {!isMobile && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex"
                aria-label="Toggle sidebar"
              >
                <PanelLeft className={cn(
                  "h-5 w-5 transition-transform duration-300",
                  collapsed && "rotate-180"
                )} />
              </Button>
              <div className="h-6 w-px bg-slate-200 hidden lg:block" />
            </>
          )}
          
          {isMobile && <div className="h-6 w-px bg-slate-200" />}
          
          <h2 className="text-sm font-semibold text-slate-700">Nordeste Geradores</h2>
        </div>
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export function Layout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <LayoutContent />
    </SidebarProvider>
  )
}
