import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { NotaFiscal, TipoNotaFiscal, FormaPagamento, Fornecedor } from '@/types'
import { notaFiscalService } from '@/services/notaFiscalService'
import { fornecedorService } from '@/services/fornecedorService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  FileText,
  Receipt,
  Calendar,
  DollarSign,
  Eye,
  Grid3x3,
  Table as TableIcon,
  Filter,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { openButtonHandlers } from '@/components/tables/responsiveDataList'

type ViewMode = 'cards' | 'table'

export function NotasFiscaisPage() {
  const navigate = useNavigate()
  const [notas, setNotas] = useState<NotaFiscal[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<{
    tipo?: TipoNotaFiscal
    formaPagamento?: FormaPagamento
    fornecedorId?: string
    origem?: 'fornecedor' | 'cliente'
    dataInicio?: string
    dataFim?: string
  }>({})
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    carregarFornecedores()
  }, [])

  useEffect(() => {
    carregarNotas()
  }, [page, size, searchTerm, filters.tipo, filters.formaPagamento, filters.fornecedorId, filters.origem, filters.dataInicio, filters.dataFim])

  const carregarFornecedores = async () => {
    try {
      const data = await fornecedorService.listarTodos()
      setFornecedores(data.filter(f => f.status === 'ATIVO'))
    } catch (err: any) {
      console.error('Erro ao carregar fornecedores:', err)
    }
  }

  const carregarNotas = async () => {
    try {
      setLoading(true)
      const data = await notaFiscalService.listarPagina({
        page,
        size,
        q: searchTerm,
        tipo: filters.tipo ?? '',
        formaPagamento: filters.formaPagamento ?? '',
        fornecedorId: filters.fornecedorId,
        origem: filters.origem ?? '',
        dataInicio: filters.dataInicio,
        dataFim: filters.dataFim,
      })
      setNotas(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (err: any) {
      console.error('Erro ao carregar notas fiscais:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta nota fiscal?')) {
      try {
        await notaFiscalService.deletar(id)
        await carregarNotas()
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir nota fiscal')
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

  const formaPagamentoLabel = (fp?: FormaPagamento | null) =>
    fp ? fp.replace(/_/g, ' ') : '—'

  const RowActions = ({ notaId }: { notaId: string }) => (
    <div className="flex items-center justify-end gap-0.5 sm:justify-center">
      <Button
        variant="ghost"
        size="icon"
        {...openButtonHandlers(`/notas-entrada/${notaId}`, navigate)}
        className="h-9 w-9 shrink-0 touch-manipulation"
        title="Visualizar (Ctrl/clique do meio abre em nova aba)"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation()
          navigate(`/notas-entrada/${notaId}/editar`)
        }}
        className="h-9 w-9 shrink-0 touch-manipulation"
        title="Editar"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation()
          handleDelete(notaId)
        }}
        className="h-9 w-9 shrink-0 touch-manipulation text-red-600 hover:text-red-700 hover:bg-red-50"
        title="Excluir"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  useEffect(() => {
    setPage(0)
  }, [searchTerm, filters])

  const clearFilters = () => {
    setFilters({})
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined && value !== '')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notas Fiscais</h1>
          <p className="text-slate-600 mt-1">Gerencie as notas fiscais de entrada e saída</p>
        </div>
        <Button onClick={() => navigate('/notas-entrada/nova')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Nota
        </Button>
      </div>

      {/* Busca e Controles */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por número da nota ou fornecedor..."
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    {/* Filtro por Tipo */}
                    <div className="space-y-2">
                      <Label htmlFor="filterTipo">Tipo</Label>
                      <select
                        id="filterTipo"
                        value={filters.tipo || ''}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            tipo: e.target.value ? (e.target.value as TipoNotaFiscal) : undefined,
                          })
                        }
                        className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                      >
                        <option value="">Todos</option>
                        <option value={TipoNotaFiscal.ENTRADA}>Entrada</option>
                        <option value={TipoNotaFiscal.SAIDA}>Saída</option>
                      </select>
                    </div>

                    {/* Filtro por Forma de Pagamento */}
                    <div className="space-y-2">
                      <Label htmlFor="filterFormaPagamento">Forma de Pagamento</Label>
                      <select
                        id="filterFormaPagamento"
                        value={filters.formaPagamento || ''}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            formaPagamento: e.target.value
                              ? (e.target.value as FormaPagamento)
                              : undefined,
                          })
                        }
                        className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                      >
                        <option value="">Todas</option>
                        <option value={FormaPagamento.PIX}>PIX</option>
                        <option value={FormaPagamento.CARTAO}>Cartão</option>
                        <option value={FormaPagamento.BOLETO}>Boleto</option>
                        <option value={FormaPagamento.TRANSFERENCIA}>Transferência</option>
                      </select>
                    </div>

                    {/* Filtro por Fornecedor */}
                    <div className="space-y-2">
                      <Label htmlFor="filterFornecedor">Fornecedor</Label>
                      <select
                        id="filterFornecedor"
                        value={filters.fornecedorId || ''}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            fornecedorId: e.target.value || undefined,
                          })
                        }
                        className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                      >
                        <option value="">Todos</option>
                        {fornecedores.map((fornecedor) => (
                          <option key={fornecedor.id} value={fornecedor.id}>
                            {fornecedor.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Filtro Notas de Fornecedores / Notas de Clientes */}
                    <div className="space-y-2">
                      <Label htmlFor="filterOrigem">Origem</Label>
                      <select
                        id="filterOrigem"
                        value={filters.origem || ''}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            origem: e.target.value
                              ? (e.target.value as 'fornecedor' | 'cliente')
                              : undefined,
                          })
                        }
                        className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                      >
                        <option value="">Todas</option>
                        <option value="fornecedor">Notas de fornecedores</option>
                        <option value="cliente">Notas de clientes</option>
                      </select>
                    </div>

                    {/* Filtro por Data Início */}
                    <div className="space-y-2">
                      <Label htmlFor="filterDataInicio">Data Início</Label>
                      <Input
                        id="filterDataInicio"
                        type="date"
                        value={filters.dataInicio || ''}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            dataInicio: e.target.value || undefined,
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Filtro por Data Fim */}
                    <div className="space-y-2">
                      <Label htmlFor="filterDataFim">Data Fim</Label>
                      <Input
                        id="filterDataFim"
                        type="date"
                        value={filters.dataFim || ''}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            dataFim: e.target.value || undefined,
                          })
                        }
                        className="w-full"
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
            <p className="text-slate-500">Carregando notas fiscais...</p>
          </div>
        </div>
      ) : totalElements === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">Nenhuma nota fiscal encontrada</p>
            <Button onClick={() => navigate('/notas-entrada/nova')} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Primeira Nota
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <>
          {/* Lista em cartões — telas pequenas (tabela larga demais) */}
          <div className="space-y-3 md:hidden">
            {notas.map((nota) => (
              <motion.div
                key={nota.id}
                role="button"
                tabIndex={0}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                {...openButtonHandlers(`/notas-entrada/${nota.id}`, navigate)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate(`/notas-entrada/${nota.id}`)
                  }
                }}
                className="w-full cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-sm ring-1 ring-slate-900/5 transition hover:border-slate-300 hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold tabular-nums text-slate-900">#{nota.numeroNota}</span>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          nota.tipo === TipoNotaFiscal.ENTRADA
                            ? 'bg-sky-100 text-sky-800 ring-1 ring-sky-200/80'
                            : 'bg-violet-100 text-violet-800 ring-1 ring-violet-200/80'
                        }`}
                      >
                        {nota.tipo === TipoNotaFiscal.ENTRADA ? 'Entrada' : 'Saída'}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-slate-700">{nota.fornecedor}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        {formatDate(nota.dataEmissao)}
                      </span>
                      <span className="tabular-nums">{nota.itens.length} itens</span>
                      <span className="max-w-[10rem] truncate sm:max-w-none">{formaPagamentoLabel(nota.formaPagamento)}</span>
                    </div>
                  </div>
                  <div className="flex w-full flex-col items-stretch gap-3 border-t border-slate-100 pt-3 sm:w-auto sm:border-0 sm:pt-0">
                    <p className="text-right text-lg font-bold tabular-nums text-emerald-700 sm:text-right">
                      {formatCurrency(nota.valorTotal)}
                    </p>
                    <RowActions notaId={nota.id} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tabela — md+ */}
          <Card className="hidden overflow-hidden border-slate-200/90 shadow-sm md:block">
            <CardContent className="p-0">
              <div className="relative">
                <div className="overflow-x-auto overscroll-x-contain">
                  <table className="w-full min-w-[52rem] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100/95 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                        <th className="sticky top-0 z-10 bg-slate-100/95 py-3.5 pl-4 pr-3 backdrop-blur-sm supports-[backdrop-filter]:bg-slate-100/80">
                          Número
                        </th>
                        <th className="sticky top-0 z-10 bg-slate-100/95 py-3.5 px-3 backdrop-blur-sm supports-[backdrop-filter]:bg-slate-100/80">
                          Tipo
                        </th>
                        <th className="sticky top-0 z-10 min-w-[12rem] max-w-[20rem] bg-slate-100/95 py-3.5 px-3 backdrop-blur-sm supports-[backdrop-filter]:bg-slate-100/80">
                          Fornecedor / Cliente
                        </th>
                        <th className="sticky top-0 z-10 whitespace-nowrap bg-slate-100/95 py-3.5 px-3 backdrop-blur-sm supports-[backdrop-filter]:bg-slate-100/80">
                          Emissão
                        </th>
                        <th className="sticky top-0 z-10 hidden bg-slate-100/95 py-3.5 px-3 backdrop-blur-sm supports-[backdrop-filter]:bg-slate-100/80 lg:table-cell">
                          Pagamento
                        </th>
                        <th className="sticky top-0 z-10 bg-slate-100/95 py-3.5 px-3 text-right tabular-nums backdrop-blur-sm supports-[backdrop-filter]:bg-slate-100/80">
                          Itens
                        </th>
                        <th className="sticky top-0 z-10 bg-slate-100/95 py-3.5 pl-3 pr-4 text-right tabular-nums backdrop-blur-sm supports-[backdrop-filter]:bg-slate-100/80">
                          Total
                        </th>
                        <th className="sticky top-0 z-10 w-[7.5rem] bg-slate-100/95 py-3.5 px-2 text-center backdrop-blur-sm supports-[backdrop-filter]:bg-slate-100/80">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {notas.map((nota, index) => (
                        <motion.tr
                          key={nota.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.15 }}
                          className={`cursor-pointer transition-colors hover:bg-[#203d7b]/[0.04] ${
                            index % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                          }`}
                          {...openButtonHandlers(`/notas-entrada/${nota.id}`, navigate)}
                        >
                          <td className="py-3.5 pl-4 pr-3 align-middle">
                            <span className="font-semibold tabular-nums text-slate-900">#{nota.numeroNota}</span>
                          </td>
                          <td className="px-3 py-3.5 align-middle">
                            <span
                              className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                                nota.tipo === TipoNotaFiscal.ENTRADA
                                  ? 'bg-sky-100 text-sky-800 ring-1 ring-sky-200/70'
                                  : 'bg-violet-100 text-violet-800 ring-1 ring-violet-200/70'
                              }`}
                            >
                              {nota.tipo === TipoNotaFiscal.ENTRADA ? 'Entrada' : 'Saída'}
                            </span>
                          </td>
                          <td className="max-w-[20rem] px-3 py-3.5 align-middle">
                            <div className="flex items-start gap-2">
                              <Receipt className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                              <span className="line-clamp-2 leading-snug text-slate-800" title={nota.fornecedor}>
                                {nota.fornecedor}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3.5 align-middle tabular-nums text-slate-700">
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              {formatDate(nota.dataEmissao)}
                            </span>
                          </td>
                          <td className="hidden px-3 py-3.5 align-middle text-slate-700 lg:table-cell">
                            <span className="line-clamp-2 text-sm leading-snug" title={formaPagamentoLabel(nota.formaPagamento)}>
                              {formaPagamentoLabel(nota.formaPagamento)}
                            </span>
                          </td>
                          <td className="px-3 py-3.5 text-right align-middle tabular-nums text-slate-700">{nota.itens.length}</td>
                          <td className="py-3.5 pl-3 pr-4 text-right align-middle">
                            <span className="font-semibold tabular-nums text-emerald-700">{formatCurrency(nota.valorTotal)}</span>
                          </td>
                          <td className="px-1 py-2 align-middle" onClick={(e) => e.stopPropagation()}>
                            <RowActions notaId={nota.id} />
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="hidden border-t border-slate-100 bg-sky-50/60 px-4 py-2 text-center text-xs text-sky-900/80 md:block xl:hidden">
                  Dica: deslize a tabela para a lateral para ver todas as colunas (pagamento, totais).
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="space-y-4">
                  {notas.map((nota) => (
            <motion.div
              key={nota.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">Nota #{nota.numeroNota}</CardTitle>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            nota.tipo === TipoNotaFiscal.ENTRADA
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {nota.tipo === TipoNotaFiscal.ENTRADA ? 'Entrada' : 'Saída'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Receipt className="h-4 w-4" />
                          <span>{nota.fornecedor}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(nota.dataEmissao)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        {...openButtonHandlers(`/notas-entrada/${nota.id}`, navigate)}
                        className="h-8 w-8"
                        title="Visualizar (Ctrl/clique do meio abre em nova aba)"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/notas-entrada/${nota.id}/editar`)}
                        className="h-8 w-8"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(nota.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm text-slate-600">
                        {nota.formaPagamento && (
                          <>
                            <strong>Forma de Pagamento:</strong> {nota.formaPagamento.replace('_', ' ')}
                          </>
                        )}
                      </div>
                      <div className="text-sm text-slate-600">
                        <strong>Itens:</strong> {nota.itens.length}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                        {formatCurrency(nota.valorTotal)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalElements > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-center text-sm text-slate-600 sm:text-left">
                Mostrando {totalElements === 0 ? 0 : page * size + 1} a {Math.min((page + 1) * size, totalElements)} de{' '}
                {totalElements} notas
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Label htmlFor="nfPageSize">Por página</Label>
                  <select
                    id="nfPageSize"
                    value={size}
                    onChange={(e) => {
                      setPage(0)
                      setSize(Number(e.target.value))
                    }}
                    className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
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
    </div>
  )
}
