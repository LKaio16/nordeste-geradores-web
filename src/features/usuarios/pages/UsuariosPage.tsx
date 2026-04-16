import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Usuario, NivelAcesso, StatusUsuario } from '@/types'
import { usuarioService } from '@/services/usuarioService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Grid3x3,
  Table as TableIcon,
  Filter,
  ChevronUp,
  X,
  User,
  Mail,
  Phone,
  Briefcase,
  Shield,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { maskPhone } from '@/utils/validators'
import {
  DesktopDataTableShell,
  STH,
  listInteractiveRow,
  paginationBarClass,
  paginationControlsClass,
} from '@/components/tables/responsiveDataList'
import { cn } from '@/components/ui/utils'

type ViewMode = 'cards' | 'table'

export function UsuariosPage() {
  const navigate = useNavigate()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<{
    status?: StatusUsuario
    nivelAcesso?: NivelAcesso
  }>({})
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    carregarUsuarios()
  }, [page, size, searchTerm, filters.status, filters.nivelAcesso])

  const carregarUsuarios = async () => {
    try {
      setLoading(true)
      const data = await usuarioService.listarPagina({
        page,
        size,
        q: searchTerm,
        status: filters.status ?? '',
        nivelAcesso: filters.nivelAcesso ?? '',
      })
      setUsuarios(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (err: any) {
      console.error('Erro ao carregar usuários:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      try {
        await usuarioService.deletar(id)
        await carregarUsuarios()
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir funcionário')
      }
    }
  }

  const formatNivelAcesso = (nivel: NivelAcesso) => {
    const labels: Record<NivelAcesso, string> = {
      [NivelAcesso.ADMIN]: 'Administrador',
      [NivelAcesso.GERENTE]: 'Gerente',
      [NivelAcesso.FINANCEIRO]: 'Financeiro',
      [NivelAcesso.TECNICO]: 'Técnico',
      [NivelAcesso.OPERACIONAL]: 'Operacional',
    }
    return labels[nivel]
  }

  useEffect(() => {
    setPage(0)
  }, [filters, searchTerm])

  const clearFilters = () => {
    setPage(0)
    setFilters({})
  }

  const hasActiveFilters = Object.values(filters).some((value) => value != null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestão de Funcionários</h1>
          <p className="text-slate-600 mt-1">Gerencie os funcionários do sistema</p>
        </div>
        <Button onClick={() => navigate('/usuarios/novo')} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Funcionário
        </Button>
      </div>

      {/* Busca e Controles */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome, email, telefone ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 whitespace-nowrap"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-1 bg-white text-blue-600 rounded-full h-5 w-5 flex items-center justify-center text-xs font-semibold">
                {Object.values(filters).filter((v) => v != null).length}
              </span>
            )}
          </Button>
          <div className="flex gap-1 border border-slate-200 rounded-md p-1">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="gap-2 whitespace-nowrap"
            >
              <Grid3x3 className="h-4 w-4" />
              Cards
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="gap-2 whitespace-nowrap"
            >
              <TableIcon className="h-4 w-4" />
              Tabela
            </Button>
          </div>
        </div>

        {/* Painel de Filtros */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Filter className="h-5 w-5" />
                      Filtros
                    </CardTitle>
                    <div className="flex gap-2">
                      {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                          <X className="h-4 w-4" />
                          Limpar Filtros
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowFilters(false)}
                        className="h-8 w-8"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Filtro por Status */}
                    <div className="space-y-2">
                      <Label htmlFor="filterStatus">Status</Label>
                      <select
                        id="filterStatus"
                        value={filters.status || ''}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            status: e.target.value ? (e.target.value as StatusUsuario) : undefined,
                          })
                        }
                        className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                      >
                        <option value="">Todos</option>
                        <option value={StatusUsuario.ATIVO}>Ativo</option>
                        <option value={StatusUsuario.INATIVO}>Inativo</option>
                      </select>
                    </div>

                    {/* Filtro por Nível de Acesso */}
                    <div className="space-y-2">
                      <Label htmlFor="filterNivel">Nível de Acesso</Label>
                      <select
                        id="filterNivel"
                        value={filters.nivelAcesso || ''}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            nivelAcesso: e.target.value ? (e.target.value as NivelAcesso) : undefined,
                          })
                        }
                        className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                      >
                        <option value="">Todos</option>
                        <option value={NivelAcesso.ADMIN}>Administrador</option>
                        <option value={NivelAcesso.GERENTE}>Gerente</option>
                        <option value={NivelAcesso.TECNICO}>Técnico</option>
                        <option value={NivelAcesso.OPERACIONAL}>Operacional</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-500">Carregando funcionários...</p>
          </div>
        </div>
      ) : totalElements === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">Nenhum funcionário encontrado</p>
            <Button onClick={() => navigate('/usuarios/novo')} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Primeiro Funcionário
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <>
          {/* Informações de Resultado */}
          <div className={cn(paginationBarClass(), 'text-sm text-slate-600')}>
            <div className="text-center sm:text-left">
              Mostrando {totalElements === 0 ? 0 : page * size + 1} a{' '}
              {Math.min((page + 1) * size, totalElements)} de {totalElements} funcionários
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
              <Label htmlFor="itemsPerPage" className="text-sm">
                Itens por página:
              </Label>
              <select
                id="itemsPerPage"
                value={size}
                onChange={(e) => {
                  setPage(0)
                  setSize(Number(e.target.value))
                }}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {usuarios.map((usuario) => (
              <motion.div
                key={usuario.id}
                role="button"
                tabIndex={0}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate(`/usuarios/${usuario.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate(`/usuarios/${usuario.id}`)
                  }
                }}
                className="w-full cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-sm ring-1 ring-slate-900/5 transition hover:border-slate-300 hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <User className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="font-semibold text-slate-900">{usuario.nome}</span>
                    </div>
                    <p className="text-xs text-slate-600">{usuario.email}</p>
                    <p className="text-xs tabular-nums text-slate-500">{maskPhone(usuario.telefone)}</p>
                    <p className="text-xs text-slate-600">{usuario.cargo}</p>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          usuario.nivelAcesso === NivelAcesso.ADMIN
                            ? 'bg-purple-100 text-purple-800'
                            : usuario.nivelAcesso === NivelAcesso.GERENTE
                              ? 'bg-blue-100 text-blue-800'
                              : usuario.nivelAcesso === NivelAcesso.TECNICO
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {formatNivelAcesso(usuario.nivelAcesso)}
                      </span>
                      {usuario.status === StatusUsuario.ATIVO ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">
                          <XCircle className="h-3 w-3" />
                          Inativo
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className="flex w-full justify-end gap-1 border-t border-slate-100 pt-3 sm:w-auto sm:border-0 sm:pt-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation" onClick={() => navigate(`/usuarios/${usuario.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation" onClick={() => navigate(`/usuarios/${usuario.id}/editar`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation text-red-600 hover:bg-red-50" onClick={() => handleDelete(usuario.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <DesktopDataTableShell tableMinClass="min-w-[58rem]">
            <thead>
              <tr>
                <th className={STH.left}>Nome</th>
                <th className={STH.midHiddenLg}>Email</th>
                <th className={STH.midHiddenLg}>Telefone</th>
                <th className={STH.mid}>Cargo</th>
                <th className={STH.mid}>Nível</th>
                <th className={STH.mid}>Status</th>
                <th className={STH.right}>Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map((usuario, index) => (
                <motion.tr
                  key={usuario.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className={listInteractiveRow(index)}
                  onClick={() => navigate(`/usuarios/${usuario.id}`)}
                >
                  <td className="py-3.5 pl-4 pr-3 align-middle">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="font-semibold text-slate-900">{usuario.nome}</span>
                    </div>
                  </td>
                  <td className="hidden px-3 py-3.5 align-middle lg:table-cell">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="line-clamp-2 text-sm text-slate-700">{usuario.email}</span>
                    </div>
                  </td>
                  <td className="hidden px-3 py-3.5 align-middle lg:table-cell">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="text-sm tabular-nums text-slate-700">{maskPhone(usuario.telefone)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 align-middle">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="line-clamp-2 text-sm text-slate-700">{usuario.cargo}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 align-middle">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        usuario.nivelAcesso === NivelAcesso.ADMIN
                          ? 'bg-purple-100 text-purple-800'
                          : usuario.nivelAcesso === NivelAcesso.GERENTE
                            ? 'bg-blue-100 text-blue-800'
                            : usuario.nivelAcesso === NivelAcesso.TECNICO
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {formatNivelAcesso(usuario.nivelAcesso)}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 align-middle">
                    {usuario.status === StatusUsuario.ATIVO ? (
                      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">
                        <XCircle className="h-3 w-3" />
                        Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-1 py-2 pr-4 align-middle" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 touch-manipulation"
                        title="Visualizar"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/usuarios/${usuario.id}`)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 touch-manipulation"
                        title="Editar"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/usuarios/${usuario.id}/editar`)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 touch-manipulation text-red-600 hover:bg-red-50 hover:text-red-700"
                        title="Excluir"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(usuario.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </DesktopDataTableShell>

          {/* Paginação */}
          {totalPages > 1 && (
            <Card>
              <CardContent className="py-4">
                <div className={paginationBarClass()}>
                  <div className="text-center text-sm text-slate-600 sm:text-left">
                    Página {totalPages === 0 ? 0 : page + 1} de {totalPages}
                  </div>
                  <div className={paginationControlsClass()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page <= 0}
                      className="gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number
                        const currentUi = page + 1
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentUi <= 3) {
                          pageNum = i + 1
                        } else if (currentUi >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentUi - 2 + i
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentUi === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPage(pageNum - 1)}
                            className="w-10"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={totalPages === 0 || page >= totalPages - 1}
                      className="gap-2"
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <>
          {/* Informações de Resultado para Cards */}
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div>
              Mostrando {totalElements === 0 ? 0 : page * size + 1} a{' '}
              {Math.min((page + 1) * size, totalElements)} de {totalElements} funcionários
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="itemsPerPageCards" className="text-sm">Itens por página:</Label>
              <select
                id="itemsPerPageCards"
                value={size}
                onChange={(e) => {
                  setPage(0)
                  setSize(Number(e.target.value))
                }}
                className="h-8 px-2 rounded-md border border-slate-200 bg-white text-sm"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usuarios.map((usuario) => (
              <motion.div
                key={usuario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{usuario.nome}</CardTitle>
                        <p className="text-sm text-slate-500 mb-2">{usuario.cargo}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              usuario.nivelAcesso === NivelAcesso.ADMIN
                                ? 'bg-purple-100 text-purple-700'
                                : usuario.nivelAcesso === NivelAcesso.GERENTE
                                ? 'bg-blue-100 text-blue-700'
                                : usuario.nivelAcesso === NivelAcesso.TECNICO
                                ? 'bg-green-100 text-green-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {formatNivelAcesso(usuario.nivelAcesso)}
                          </span>
                          {usuario.status === StatusUsuario.ATIVO ? (
                            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                              <CheckCircle2 className="h-3 w-3" />
                              Ativo
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                              <XCircle className="h-3 w-3" />
                              Inativo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="truncate">{usuario.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{maskPhone(usuario.telefone)}</span>
                    </div>
                    <div className="flex gap-1 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/usuarios/${usuario.id}`)}
                        className="h-8 w-8"
                        title="Visualizar Detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/usuarios/${usuario.id}/editar`)}
                        className="h-8 w-8"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(usuario.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Paginação para Cards */}
          {totalPages > 1 && (
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Página {totalPages === 0 ? 0 : page + 1} de {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page <= 0}
                      className="gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number
                        const currentUi = page + 1
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentUi <= 3) {
                          pageNum = i + 1
                        } else if (currentUi >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentUi - 2 + i
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentUi === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPage(pageNum - 1)}
                            className="w-10"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={totalPages === 0 || page >= totalPages - 1}
                      className="gap-2"
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
