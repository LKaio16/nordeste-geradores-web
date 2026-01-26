import * as React from 'react'
import { cn } from './utils'

interface SidebarContextType {
  open: boolean
  setOpen: (open: boolean) => void
  isMobile: boolean
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultOpen?: boolean
}

export function SidebarProvider({ children, defaultOpen = true }: SidebarProviderProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [collapsed, setCollapsed] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
      // Em mobile, fechar o menu por padrão
      if (window.innerWidth < 1024) {
        setOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fechar menu em mobile quando colapsar
  React.useEffect(() => {
    if (collapsed && isMobile) {
      setOpen(false)
    }
  }, [collapsed, isMobile])

  return (
    <SidebarContext.Provider value={{ open, setOpen, isMobile, collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('h-full w-64 border-r bg-background', className)}
    {...props}
  />
))
Sidebar.displayName = 'Sidebar'

export { Sidebar }



