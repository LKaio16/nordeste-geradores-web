import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Conta, TipoConta, StatusConta } from '@/types'
import { contaService } from '@/services/contaService'
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
  DollarSign,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type ViewMode = 'cards' | 'table'

export function ContasPage() {
  const navigate = useNavigate()
  const [contas, setContas] = useState<Conta[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<{
    tipo?: TipoConta
    status?: StatusConta
    dataInicio?: string
    dataFim?: string
  }>({})
  const [ordenacaoVencimento, setOrdenacaoVencimento] = useState<'asc' | 'desc' | null>(null)
  const [periodoRapido, setPeriodoRapido] = useState<'todos' | 'hoje' | 'semana' | 'mes' | 'trimestre' | 'ano' | 'personalizado'>('todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    carregarContas()
  }, [])

  const carregarContas = async () => {
    try {
      setLoading(true)
      const data = await contaService.listar()
      setContas(data)
    } catch (err: any) {
      console.error('Erro ao carregar contas:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      try {
        await contaService.deletar(id)
        await carregarContas()
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir conta')
      }
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const isVencida = (dataVencimento: string, status: StatusConta) => {
    // Contas pagas não estão vencidas
    if (status === StatusConta.PAGO) return false
    // Contas com status VENCIDO estão vencidas
    if (status === StatusConta.VENCIDO) return true
    
    // Verificar pela data de vencimento
    const vencimento = new Date(dataVencimento)
    vencimento.setHours(0, 0, 0, 0)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    // Se a data de vencimento passou e a conta não está paga, está vencida
    return vencimento < hoje
  }

  const definirPeriodoRapido = (periodo: typeof periodoRapido) => {
    setPeriodoRapido(periodo)
    const hoje = new Date()
    let inicio: Date | undefined, fim: Date | undefined

    switch (periodo) {
      case 'hoje':
        inicio = new Date(hoje)
        fim = new Date(hoje)
        break
      case 'semana':
        inicio = new Date(hoje)
        inicio.setDate(hoje.getDate() - 7)
        fim = new Date(hoje)
        break
      case 'mes':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
        fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
        break
      case 'trimestre':
        const trimestreAtual = Math.floor(hoje.getMonth() / 3)
        inicio = new Date(hoje.getFullYear(), trimestreAtual * 3, 1)
        fim = new Date(hoje.getFullYear(), (trimestreAtual + 1) * 3, 0)
        break
      case 'ano':
        inicio = new Date(hoje.getFullYear(), 0, 1)
        fim = new Date(hoje.getFullYear(), 11, 31)
        break
      case 'todos':
      case 'personalizado':
        inicio = undefined
        fim = undefined
        break
    }

    setFilters(prev => ({
      ...prev,
      dataInicio: inicio ? inicio.toISOString().split('T')[0] : undefined,
      dataFim: fim ? fim.toISOString().split('T')[0] : undefined,
    }))
  }

  const filteredContas = contas
    .filter((conta) => {
      const matchesSearch =
        conta.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conta.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        formatCurrency(conta.valor).toLowerCase().includes(searchTerm.toLowerCase())

      const matchesTipo = !filters.tipo || conta.tipo === filters.tipo
      
      // Para o filtro de status, se for VENCIDO, incluir contas que estão vencidas pela data
      let matchesStatus = true
      if (filters.status) {
        if (filters.status === StatusConta.VENCIDO) {
          // Incluir contas com status VENCIDO ou que estão vencidas pela data
          matchesStatus = conta.status === StatusConta.VENCIDO || isVencida(conta.dataVencimento, conta.status)
        } else {
          matchesStatus = conta.status === filters.status
        }
      }

      // Filtro por data de vencimento
      let matchesData = true
      if (filters.dataInicio || filters.dataFim) {
        const dataVencimento = new Date(conta.dataVencimento)
        if (filters.dataInicio) {
          const dataInicio = new Date(filters.dataInicio)
          dataInicio.setHours(0, 0, 0, 0)
          if (dataVencimento < dataInicio) matchesData = false
        }
        if (filters.dataFim) {
          const dataFim = new Date(filters.dataFim)
          dataFim.setHours(23, 59, 59, 999)
          if (dataVencimento > dataFim) matchesData = false
        }
      }

      return matchesSearch && matchesTipo && matchesStatus && matchesData
    })
    .sort((a, b) => {
      if (ordenacaoVencimento === null) return 0
      
      const dataA = new Date(a.dataVencimento).getTime()
      const dataB = new Date(b.dataVencimento).getTime()
      
      if (ordenacaoVencimento === 'asc') {
        return dataA - dataB
      } else {
        return dataB - dataA
      }
    })

  // Paginação
  const totalPages = Math.ceil(filteredContas.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedContas = filteredContas.slice(startIndex, endIndex)

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, searchTerm, ordenacaoVencimento])

  const toggleOrdenacaoVencimento = () => {
    if (ordenacaoVencimento === null) {
      setOrdenacaoVencimento('asc')
    } else if (ordenacaoVencimento === 'asc') {
      setOrdenacaoVencimento('desc')
    } else {
      setOrdenacaoVencimento(null)
    }
  }

  const clearFilters = () => {
    setFilters({})
    setPeriodoRapido('todos')
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined && value !== '')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contas a Pagar/Receber</h1>
          <p className="text-slate-600 mt-1">Gerencie suas contas financeiras</p>
        </div>
        <Button onClick={() => navigate('/contas/novo')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Conta
        </Button>
      </div>

      {/* Busca e Controles */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por descrição, cliente ou valor..."
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
                <CardContent className="space-y-4">
                  {/* Períodos Rápidos */}
                  <div>
                    <Label className="mb-2 block text-sm font-medium">Período de Vencimento</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={periodoRapido === 'todos' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => definirPeriodoRapido('todos')}
                        className="gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        Todos
                      </Button>
                      <Button
                        variant={periodoRapido === 'hoje' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => definirPeriodoRapido('hoje')}
                        className="gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        Hoje
                      </Button>
                      <Button
                        variant={periodoRapido === 'semana' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => definirPeriodoRapido('semana')}
                        className="gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        Últimos 7 dias
                      </Button>
                      <Button
                        variant={periodoRapido === 'mes' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => definirPeriodoRapido('mes')}
                        className="gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        Este Mês
                      </Button>
                      <Button
                        variant={periodoRapido === 'trimestre' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => definirPeriodoRapido('trimestre')}
                        className="gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        Trimestre
                      </Button>
                      <Button
                        variant={periodoRapido === 'ano' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => definirPeriodoRapido('ano')}
                        className="gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        Este Ano
                      </Button>
                      <Button
                        variant={periodoRapido === 'personalizado' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setPeriodoRapido('personalizado')
                        }}
                        className="gap-2"
                      >
                        <Calendar className="h-4 w-4" />
                        Personalizado
                      </Button>
                    </div>
                  </div>

                  {/* Filtros Principais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t">
                    {/* Filtro por Tipo */}
                    <div className="space-y-2">
                      <Label htmlFor="filterTipo">Tipo</Label>
                      <select
                        id="filterTipo"
                        value={filters.tipo || ''}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            tipo: e.target.value ? (e.target.value as TipoConta) : undefined,
                          })
                        }
                        className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                      >
                        <option value="">Todos</option>
                        <option value={TipoConta.PAGAR}>A Pagar</option>
                        <option value={TipoConta.RECEBER}>A Receber</option>
                      </select>
                    </div>

                    {/* Filtro por Status */}
                    <div className="space-y-2">
                      <Label htmlFor="filterStatus">Status</Label>
                      <select
                        id="filterStatus"
                        value={filters.status || ''}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            status: e.target.value ? (e.target.value as StatusConta) : undefined,
                          })
                        }
                        className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                      >
                        <option value="">Todos</option>
                        <option value={StatusConta.PENDENTE}>Pendente</option>
                        <option value={StatusConta.PAGO}>Pago</option>
                        <option value={StatusConta.VENCIDO}>Vencido</option>
                      </select>
                    </div>

                    {/* Filtro por Data Início */}
                    <div className="space-y-2">
                      <Label htmlFor="filterDataInicio">Data Início</Label>
                      <Input
                        id="filterDataInicio"
                        type="date"
                        value={filters.dataInicio || ''}
                        onChange={(e) => {
                          setFilters({
                            ...filters,
                            dataInicio: e.target.value || undefined,
                          })
                          setPeriodoRapido('personalizado')
                        }}
                        className="w-full h-10"
                      />
                    </div>

                    {/* Filtro por Data Fim */}
                    <div className="space-y-2">
                      <Label htmlFor="filterDataFim">Data Fim</Label>
                      <Input
                        id="filterDataFim"
                        type="date"
                        value={filters.dataFim || ''}
                        onChange={(e) => {
                          setFilters({
                            ...filters,
                            dataFim: e.target.value || undefined,
                          })
                          setPeriodoRapido('personalizado')
                        }}
                        className="w-full h-10"
                      />
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
            <p className="text-slate-500">Carregando contas...</p>
          </div>
        </div>
      ) : filteredContas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">Nenhuma conta encontrada</p>
            <Button onClick={() => navigate('/contas/novo')} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Primeira Conta
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <>
          {/* Informações de Resultado */}
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div>
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredContas.length)} de {filteredContas.length} contas
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="itemsPerPage" className="text-sm">Itens por página:</Label>
              <select
                id="itemsPerPage"
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

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Tipo</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Descrição</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Categoria</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Cliente</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Valor</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <span>Vencimento</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleOrdenacaoVencimento}
                            className="h-6 w-6 p-0 hover:bg-slate-200"
                            title={
                              ordenacaoVencimento === null
                                ? 'Ordenar por vencimento'
                                : ordenacaoVencimento === 'asc'
                                ? 'Ordenação: Crescente (clique para decrescente)'
                                : 'Ordenação: Decrescente (clique para remover)'
                            }
                          >
                            {ordenacaoVencimento === null ? (
                              <ArrowUp className="h-3 w-3 text-slate-400" />
                            ) : ordenacaoVencimento === 'asc' ? (
                              <ArrowUp className="h-3 w-3 text-blue-600" />
                            ) : (
                              <ArrowDown className="h-3 w-3 text-blue-600" />
                            )}
                          </Button>
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedContas.map((conta) => {
                    const vencida = isVencida(conta.dataVencimento, conta.status)
                    return (
                      <motion.tr
                        key={conta.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className={`border-b border-slate-100 hover:bg-slate-50 ${vencida ? 'bg-red-50/50' : ''}`}
                      >
                        <td className="py-3 px-4">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              conta.tipo === TipoConta.PAGAR
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {conta.tipo === TipoConta.PAGAR ? 'A Pagar' : 'A Receber'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">{conta.descricao}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-slate-600">{conta.categoria || 'Geral'}</span>
                        </td>
                        <td className="py-3 px-4">
                          {conta.cliente ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-400" />
                              <span className="text-sm text-slate-600">{conta.cliente.nome}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-slate-400" />
                            <span className="font-semibold">{formatCurrency(conta.valor)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className={`text-sm ${vencida ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
                              {formatDate(conta.dataVencimento)}
                            </span>
                          </div>
                        </td>
                      <td className="py-3 px-4">
                        {conta.status === StatusConta.PAGO ? (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 w-fit">
                            <CheckCircle2 className="h-3 w-3" />
                            Pago
                          </span>
                        ) : conta.status === StatusConta.VENCIDO || vencida ? (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 w-fit">
                            <AlertCircle className="h-3 w-3" />
                            Vencido
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 w-fit">
                            <AlertCircle className="h-3 w-3" />
                            Pendente
                          </span>
                        )}
                      </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/contas/${conta.id}`)}
                              className="h-8 w-8"
                              title="Visualizar"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/contas/${conta.id}/editar`)}
                              className="h-8 w-8"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(conta.id)}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

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
      ) : (
        <>
          {/* Informações de Resultado para Cards */}
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div>
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredContas.length)} de {filteredContas.length} contas
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
            {paginatedContas.map((conta) => {
            const vencida = isVencida(conta.dataVencimento, conta.status)
            return (
              <motion.div
                key={conta.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`hover:shadow-md transition-shadow ${vencida ? 'border-red-200 bg-red-50/30' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{conta.descricao}</CardTitle>
                        {conta.categoria && (
                          <p className="text-sm text-slate-500 mb-2">Categoria: {conta.categoria}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              conta.tipo === TipoConta.PAGAR
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {conta.tipo === TipoConta.PAGAR ? 'A Pagar' : 'A Receber'}
                          </span>
                          {conta.status === StatusConta.PAGO ? (
                            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                              <CheckCircle2 className="h-3 w-3" />
                              Pago
                            </span>
                          ) : conta.status === StatusConta.VENCIDO || vencida ? (
                            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                              <AlertCircle className="h-3 w-3" />
                              Vencido
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                              <AlertCircle className="h-3 w-3" />
                              Pendente
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <DollarSign className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold text-lg">{formatCurrency(conta.valor)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className={vencida ? 'text-red-600 font-semibold' : ''}>
                        Vencimento: {formatDate(conta.dataVencimento)}
                      </span>
                    </div>
                    {conta.cliente && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="truncate">{conta.cliente.nome}</span>
                      </div>
                    )}
                    <div className="flex gap-1 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/contas/${conta.id}`)}
                        className="h-8 w-8"
                        title="Visualizar Detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/contas/${conta.id}/editar`)}
                        className="h-8 w-8"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(conta.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
          </div>

          {/* Paginação para Cards */}
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
