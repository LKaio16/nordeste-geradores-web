import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Sidebar, useSidebar } from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Users,
  Zap,
  Calendar,
  ClipboardList,
  DollarSign,
  Package,
  FileText,
  Settings,
  LogOut,
  ShoppingCart,
  BarChart3,
  UsersRound,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { useEffect } from 'react'

interface NavItem {
  title: string
  icon: React.ElementType
  path: string
}

const financialItems: NavItem[] = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { title: 'Notas de Entrada', icon: FileText, path: '/notas-entrada' },
  { title: 'Estoque', icon: Package, path: '/estoque' },
  { title: 'Produtos', icon: ShoppingCart, path: '/produtos' },
  { title: 'Clientes', icon: Users, path: '/clientes' },
  { title: 'Fornecedores', icon: Building2, path: '/fornecedores' },
  { title: 'Contas a Pagar/Receber', icon: DollarSign, path: '/contas' },
  { title: 'Relatórios Financeiros', icon: BarChart3, path: '/relatorios-financeiros' },
]

const rentalItems: NavItem[] = [
  { title: 'Cadastro de Geradores', icon: Zap, path: '/geradores' },
  { title: 'Locações', icon: Calendar, path: '/locacoes' },
  { title: 'Ordens de Serviço', icon: ClipboardList, path: '/ordens-servico' },
  { title: 'Propostas', icon: FileCheck, path: '/propostas' },
]

const adminItems: NavItem[] = [
  { title: 'Gestão de Funcionários', icon: UsersRound, path: '/usuarios' },
  { title: 'Configurações', icon: Settings, path: '/configuracoes' },
]

export function AppSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { open, setOpen, isMobile, collapsed, setCollapsed } = useSidebar()

  // Fechar menu em mobile ao navegar
  useEffect(() => {
    if (isMobile && open) {
      setOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  const handleNavClick = (path: string) => {
    navigate(path)
  }

  const sidebarWidth = collapsed ? 'w-20' : 'w-64'

  return (
    <Sidebar className={cn(
      "fixed left-0 top-0 h-full z-40 border-r border-slate-200 bg-white shadow-xl transition-all duration-300",
      sidebarWidth,
      // Mobile: sempre escondido por padrão, mostrado quando open
      isMobile 
        ? (open ? "translate-x-0" : "-translate-x-full")
        : "translate-x-0"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className={cn(
          "border-b border-slate-200 transition-all duration-300",
          collapsed ? "p-4" : "p-6"
        )}>
          <div className={cn(
            "flex items-center gap-3 transition-all duration-300",
            collapsed && "justify-center"
          )}>
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shrink-0">
              <Zap className="h-7 w-7 text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-slate-900 truncate">Nordeste Geradores</h2>
                <p className="text-xs text-slate-500 truncate">Sistema de Gestão</p>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button - apenas desktop */}
        {!isMobile && (
          <div className="px-4 pt-2 pb-2 border-b border-slate-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="w-full justify-start h-8 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Recolher
                </>
              )}
            </Button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {/* Financeiro & Almoxarifado */}
            <div>
              {!collapsed && (
                <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Financeiro & Almoxarifado
                </p>
              )}
              <nav className="space-y-1">
                {financialItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavClick(item.path)}
                      className={cn(
                        'w-full flex items-center rounded-lg text-sm font-medium transition-colors group relative',
                        collapsed ? 'justify-center px-3 py-2.5' : 'gap-3 px-3 py-2',
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!collapsed && (
                        <span className="truncate">{item.title}</span>
                      )}
                      {/* Tooltip quando colapsado */}
                      {collapsed && (
                        <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-white bg-slate-900 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                          {item.title}
                        </span>
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Locações & Serviços */}
            <div>
              {!collapsed && (
                <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Locações & Serviços
                </p>
              )}
              <nav className="space-y-1">
                {rentalItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavClick(item.path)}
                      className={cn(
                        'w-full flex items-center rounded-lg text-sm font-medium transition-colors group relative',
                        collapsed ? 'justify-center px-3 py-2.5' : 'gap-3 px-3 py-2',
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!collapsed && (
                        <span className="truncate">{item.title}</span>
                      )}
                      {/* Tooltip quando colapsado */}
                      {collapsed && (
                        <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-white bg-slate-900 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                          {item.title}
                        </span>
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Administração */}
            <div>
              {!collapsed && (
                <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Administração
                </p>
              )}
              <nav className="space-y-1">
                {adminItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavClick(item.path)}
                      className={cn(
                        'w-full flex items-center rounded-lg text-sm font-medium transition-colors group relative',
                        collapsed ? 'justify-center px-3 py-2.5' : 'gap-3 px-3 py-2',
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!collapsed && (
                        <span className="truncate">{item.title}</span>
                      )}
                      {/* Tooltip quando colapsado */}
                      {collapsed && (
                        <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-white bg-slate-900 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                          {item.title}
                        </span>
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Footer - Informações do Usuário */}
        <div className={cn(
          "border-t border-slate-200 transition-all duration-300 bg-slate-50/50",
          collapsed ? "p-3" : "p-4"
        )}>
          {!collapsed && user && (
            <div className="flex items-center gap-3 px-3 py-2.5 mb-3 rounded-lg bg-white border border-slate-100 shadow-sm">
              {/* Avatar/Foto do usuário */}
              <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm shrink-0 ring-2 ring-white shadow-sm">
                {user?.foto ? (
                  <img
                    src={user.foto}
                    alt={user.nome}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span>{user?.nome?.charAt(0).toUpperCase() || 'U'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate leading-tight">
                  {user?.nome}
                </p>
                <p className="text-xs text-slate-500 truncate leading-tight mt-0.5">
                  {user?.email}
                </p>
                {user?.cargo && (
                  <p className="text-xs text-slate-400 truncate leading-tight mt-0.5">
                    {user.cargo}
                  </p>
                )}
              </div>
            </div>
          )}
          
          {collapsed && user && (
            <div className="flex justify-center mb-3">
              <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white shadow-sm">
                {user?.foto ? (
                  <img
                    src={user.foto}
                    alt={user.nome}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span>{user?.nome?.charAt(0).toUpperCase() || 'U'}</span>
                )}
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            className={cn(
              "w-full text-slate-700 hover:bg-red-50 hover:text-red-700 transition-all font-medium",
              collapsed ? "justify-center px-3 py-2" : "justify-start px-3"
            )}
            onClick={() => {
              logout()
              navigate('/login')
            }}
            title={collapsed ? 'Sair' : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </div>
    </Sidebar>
  )
}

