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
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
    dataInicio?: string
    dataFim?: string
  }>({})

  useEffect(() => {
    carregarNotas()
    carregarFornecedores()
  }, [])

  const carregarFornecedores = async () => {
    try {
      const data = await fornecedorService.listar()
      setFornecedores(data.filter(f => f.status === 'ATIVO'))
    } catch (err: any) {
      console.error('Erro ao carregar fornecedores:', err)
    }
  }

  const carregarNotas = async () => {
    try {
      setLoading(true)
      const data = await notaFiscalService.listar()
      setNotas(data)
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

  const filteredNotas = notas.filter((nota) => {
    // Busca por texto
    const matchesSearch =
      nota.numeroNota.includes(searchTerm) ||
      nota.fornecedor.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtros
    const matchesTipo = !filters.tipo || nota.tipo === filters.tipo
    const matchesFormaPagamento =
      !filters.formaPagamento || nota.formaPagamento === filters.formaPagamento
    const matchesFornecedor =
      !filters.fornecedorId ||
      (nota.fornecedor &&
        fornecedores.find((f) => f.id === filters.fornecedorId)?.nome === nota.fornecedor)
    const matchesDataInicio = !filters.dataInicio || nota.dataEmissao >= filters.dataInicio
    const matchesDataFim = !filters.dataFim || nota.dataEmissao <= filters.dataFim

    return (
      matchesSearch &&
      matchesTipo &&
      matchesFormaPagamento &&
      matchesFornecedor &&
      matchesDataInicio &&
      matchesDataFim
    )
  })

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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                        <option value={FormaPagamento.DINHEIRO}>Dinheiro</option>
                        <option value={FormaPagamento.CARTAO_CREDITO}>Cartão de Crédito</option>
                        <option value={FormaPagamento.CARTAO_DEBITO}>Cartão de Débito</option>
                        <option value={FormaPagamento.BOLETO}>Boleto</option>
                        <option value={FormaPagamento.TRANSFERENCIA}>Transferência</option>
                        <option value={FormaPagamento.CHEQUE}>Cheque</option>
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
      ) : filteredNotas.length === 0 ? (
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
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Número</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Tipo</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Fornecedor</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Data Emissão</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Pagamento</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Itens</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Total</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotas.map((nota) => (
                    <motion.tr
                      key={nota.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium">#{nota.numeroNota}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            nota.tipo === TipoNotaFiscal.ENTRADA
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {nota.tipo === TipoNotaFiscal.ENTRADA ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-slate-400" />
                          <span className="truncate max-w-xs">{nota.fornecedor}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span>{formatDate(nota.dataEmissao)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{nota.formaPagamento.replace('_', ' ')}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm">{nota.itens.length}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-emerald-600">
                          {formatCurrency(nota.valorTotal)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/notas-entrada/${nota.id}`)}
                            className="h-8 w-8"
                            title="Visualizar"
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
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotas.map((nota) => (
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
                        onClick={() => navigate(`/notas-entrada/${nota.id}`)}
                        className="h-8 w-8"
                        title="Visualizar"
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
                        <strong>Forma de Pagamento:</strong> {nota.formaPagamento.replace('_', ' ')}
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
    </div>
  )
}
