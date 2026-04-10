import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cliente, StatusCliente } from '@/types'
import { clienteService } from '@/services/clienteService'
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
  Users,
  Mail,
  Phone,
  MapPin,
  Building2,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DesktopDataTableShell,
  STH,
  listInteractiveRow,
  paginationBarClass,
  paginationControlsClass,
} from '@/components/tables/responsiveDataList'
import { cn } from '@/components/ui/utils'
import { maskCPFCNPJ } from '@/utils/validators'

type ViewMode = 'cards' | 'table'

export function ClientesPage() {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<{
    status?: StatusCliente
    estado?: string
  }>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    carregarClientes()
  }, [])

  const carregarClientes = async () => {
    try {
      setLoading(true)
      const data = await clienteService.listar()
      setClientes(data)
    } catch (err: any) {
      console.error('Erro ao carregar clientes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await clienteService.deletar(id)
        await carregarClientes()
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir cliente')
      }
    }
  }

  const formatCNPJ = (cnpj: string) => {
    return maskCPFCNPJ(cnpj)
  }

  const filteredClientes = clientes.filter((cliente) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      (cliente.nome?.toLowerCase() || '').includes(searchLower) ||
      (cliente.cnpj?.toLowerCase() || '').includes(searchLower) ||
      (cliente.email?.toLowerCase() || '').includes(searchLower) ||
      (cliente.cidade?.toLowerCase() || '').includes(searchLower)

    const matchesStatus = !filters.status || cliente.status === filters.status
    const matchesEstado = !filters.estado || cliente.estado === filters.estado

    return matchesSearch && matchesStatus && matchesEstado
  })

  // Paginação
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedClientes = filteredClientes.slice(startIndex, endIndex)

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, searchTerm])

  const clearFilters = () => {
    setFilters({})
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined && value !== '')

  const estados = Array.from(new Set(clientes.map((c) => c.estado).filter(Boolean))).sort()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-600 mt-1">Gerencie o cadastro de clientes</p>
        </div>
        <Button onClick={() => navigate('/clientes/novo')} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Busca e Controles */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome, CNPJ, email ou cidade..."
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
                {Object.values(filters).filter((v) => v !== undefined && v !== '').length}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Filtro por Status */}
                    <div className="space-y-2">
                      <Label htmlFor="filterStatus">Status</Label>
                      <select
                        id="filterStatus"
                        value={filters.status || ''}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            status: e.target.value ? (e.target.value as StatusCliente) : undefined,
                          })
                        }
                        className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                      >
                        <option value="">Todos</option>
                        <option value={StatusCliente.ATIVO}>Ativo</option>
                        <option value={StatusCliente.INATIVO}>Inativo</option>
                      </select>
                    </div>

                    {/* Filtro por Estado */}
                    <div className="space-y-2">
                      <Label htmlFor="filterEstado">Estado (UF)</Label>
                      <select
                        id="filterEstado"
                        value={filters.estado || ''}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            estado: e.target.value || undefined,
                          })
                        }
                        className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                      >
                        <option value="">Todos</option>
                        {estados.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
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
            <p className="text-slate-500">Carregando clientes...</p>
          </div>
        </div>
      ) : filteredClientes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">Nenhum cliente encontrado</p>
            <Button onClick={() => navigate('/clientes/novo')} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Primeiro Cliente
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <>
          {/* Informações de Resultado */}
          <div className={cn(paginationBarClass(), 'text-sm text-slate-600')}>
            <div className="text-center sm:text-left">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredClientes.length)} de {filteredClientes.length} clientes
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
              <Label htmlFor="itemsPerPage" className="text-sm">
                Itens por página:
              </Label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {paginatedClientes.map((cliente) => (
              <motion.div
                key={cliente.id}
                role="button"
                tabIndex={0}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate(`/clientes/${cliente.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate(`/clientes/${cliente.id}`)
                  }
                }}
                className="w-full cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-sm ring-1 ring-slate-900/5 transition hover:border-slate-300 hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">{cliente.nome}</span>
                      {cliente.status === StatusCliente.ATIVO ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/80">
                          <CheckCircle2 className="h-3 w-3" />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/80">
                          <XCircle className="h-3 w-3" />
                          Inativo
                        </span>
                      )}
                    </div>
                    <p className="text-sm tabular-nums text-slate-600">{formatCNPJ(cliente.cnpj)}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex max-w-full items-center gap-1 truncate">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        {cliente.email}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        {cliente.telefone}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      <MapPin className="mr-1 inline h-3.5 w-3.5" />
                      {cliente.cidade}, {cliente.estado}
                    </p>
                  </div>
                  <div
                    className="flex w-full justify-end gap-1 border-t border-slate-100 pt-3 sm:w-auto sm:border-0 sm:pt-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation" onClick={() => navigate(`/clientes/${cliente.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation" onClick={() => navigate(`/clientes/${cliente.id}/editar`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation text-red-600 hover:bg-red-50" onClick={() => handleDelete(cliente.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <DesktopDataTableShell tableMinClass="min-w-[56rem]">
            <thead>
              <tr>
                <th className={STH.left}>Nome</th>
                <th className={STH.mid}>CNPJ</th>
                <th className={STH.midHiddenLg}>Email</th>
                <th className={STH.midHiddenLg}>Telefone</th>
                <th className={STH.mid}>Cidade/UF</th>
                <th className={STH.mid}>Status</th>
                <th className={STH.right}>Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedClientes.map((cliente, index) => (
                <motion.tr
                  key={cliente.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className={listInteractiveRow(index)}
                  onClick={() => navigate(`/clientes/${cliente.id}`)}
                >
                  <td className="py-3.5 pl-4 pr-3 align-middle">
                    <span className="font-semibold text-slate-900">{cliente.nome}</span>
                  </td>
                  <td className="px-3 py-3.5 align-middle text-sm tabular-nums text-slate-700">{formatCNPJ(cliente.cnpj)}</td>
                  <td className="hidden px-3 py-3.5 align-middle lg:table-cell">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="line-clamp-2 text-sm text-slate-700">{cliente.email}</span>
                    </div>
                  </td>
                  <td className="hidden px-3 py-3.5 align-middle lg:table-cell">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="text-sm text-slate-700">{cliente.telefone}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 align-middle">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="text-sm text-slate-700">
                        {cliente.cidade}, {cliente.estado}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 align-middle">
                    {cliente.status === StatusCliente.ATIVO ? (
                      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
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
                          navigate(`/clientes/${cliente.id}`)
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
                          navigate(`/clientes/${cliente.id}/editar`)
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
                          handleDelete(cliente.id)
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
                  Página {currentPage} de {totalPages}
                </div>
                <div className={paginationControlsClass()}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
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
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
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
          {/* Informações de Resultado */}
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div>
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredClientes.length)} de {filteredClientes.length} clientes
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="itemsPerPageCards" className="text-sm">Itens por página:</Label>
              <select
                id="itemsPerPageCards"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="h-8 px-2 rounded-md border border-slate-200 bg-white text-sm"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedClientes.map((cliente) => (
            <motion.div
              key={cliente.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{cliente.nome}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        {cliente.status === StatusCliente.ATIVO ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            <CheckCircle2 className="h-3 w-3" />
                            Ativo
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
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
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <span>{formatCNPJ(cliente.cnpj)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="truncate">{cliente.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>{cliente.telefone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="truncate">
                      {cliente.cidade}, {cliente.estado}
                    </span>
                  </div>
                  <div className="flex gap-1 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/clientes/${cliente.id}`)}
                      className="h-8 w-8"
                      title="Visualizar Detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/clientes/${cliente.id}/editar`)}
                      className="h-8 w-8"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(cliente.id)}
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

          {/* Paginação */}
          {totalPages > 1 && (
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Página {currentPage} de {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
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
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
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
