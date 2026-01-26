import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Estoque } from '@/types'
import { estoqueService } from '@/services/estoqueService'
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
  Package,
  AlertTriangle,
  TrendingDown,
  PackageX,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type ViewMode = 'cards' | 'table'

export function EstoquePage() {
  const navigate = useNavigate()
  const [estoques, setEstoques] = useState<Estoque[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<{
    categoria?: string
    abaixoMinimo?: boolean
    semEstoque?: boolean
  }>({})

  useEffect(() => {
    carregarEstoques()
  }, [])

  const carregarEstoques = async () => {
    try {
      setLoading(true)
      let data: Estoque[]
      
      if (filters.abaixoMinimo) {
        data = await estoqueService.produtosAbaixoDoMinimo()
      } else if (filters.semEstoque) {
        data = await estoqueService.produtosSemEstoque()
      } else {
        data = await estoqueService.listar()
      }
      
      setEstoques(data)
    } catch (err: any) {
      console.error('Erro ao carregar estoques:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarEstoques()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.abaixoMinimo, filters.semEstoque])

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este item do estoque?')) {
      try {
        await estoqueService.deletar(id)
        await carregarEstoques()
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir item do estoque')
      }
    }
  }

  const filteredEstoques = estoques.filter((estoque) => {
    // Busca por texto
    const matchesSearch =
      estoque.produto.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estoque.produto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estoque.produto.unidade.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtros
    const matchesCategoria = !filters.categoria || estoque.produto.categoria === filters.categoria

    return matchesSearch && matchesCategoria
  })

  const clearFilters = () => {
    setFilters({})
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined && value !== '')

  const getStatusColor = (estoque: Estoque) => {
    if (estoque.quantidade === 0) return 'bg-red-100 text-red-700'
    if (estoque.quantidade <= estoque.estoqueMinimo) return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  const getStatusText = (estoque: Estoque) => {
    if (estoque.quantidade === 0) return 'Sem Estoque'
    if (estoque.quantidade <= estoque.estoqueMinimo) return 'Abaixo do Mínimo'
    return 'Em Estoque'
  }

  const categorias = Array.from(new Set(estoques.map(e => e.produto.categoria)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Estoque</h1>
          <p className="text-slate-600 mt-1">Gerencie o estoque de produtos</p>
        </div>
        <Button onClick={() => navigate('/estoque/movimentacao')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Movimentação
        </Button>
      </div>

      {/* Busca e Controles */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por produto, categoria ou unidade..."
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Filtro por Categoria */}
                    <div className="space-y-2">
                      <Label htmlFor="filterCategoria">Categoria</Label>
                      <select
                        id="filterCategoria"
                        value={filters.categoria || ''}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            categoria: e.target.value || undefined,
                          })
                        }
                        className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                      >
                        <option value="">Todas</option>
                        {categorias.map((categoria) => (
                          <option key={categoria} value={categoria}>
                            {categoria}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Filtro por Status */}
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={filters.abaixoMinimo ? 'default' : 'outline'}
                          size="sm"
                          onClick={() =>
                            setFilters({
                              ...filters,
                              abaixoMinimo: filters.abaixoMinimo ? undefined : true,
                              semEstoque: false,
                            })
                          }
                          className="gap-2"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          Abaixo Mínimo
                        </Button>
                        <Button
                          variant={filters.semEstoque ? 'default' : 'outline'}
                          size="sm"
                          onClick={() =>
                            setFilters({
                              ...filters,
                              semEstoque: filters.semEstoque ? undefined : true,
                              abaixoMinimo: false,
                            })
                          }
                          className="gap-2"
                        >
                          <PackageX className="h-4 w-4" />
                          Sem Estoque
                        </Button>
                      </div>
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
            <p className="text-slate-500">Carregando estoque...</p>
          </div>
        </div>
      ) : filteredEstoques.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">Nenhum item de estoque encontrado</p>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Produto</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Categoria</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Unidade</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Quantidade</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Mínimo</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEstoques.map((estoque) => (
                    <motion.tr
                      key={estoque.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium">{estoque.produto.descricao}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-600">{estoque.produto.categoria}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{estoque.produto.unidade}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold">{estoque.quantidade}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm text-slate-600">{estoque.estoqueMinimo}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(estoque)}`}>
                            {getStatusText(estoque)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/estoque/${estoque.id}`)}
                            className="h-8 w-8"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/estoque/${estoque.id}/editar`)}
                            className="h-8 w-8"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(estoque.id)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEstoques.map((estoque) => (
            <motion.div
              key={estoque.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{estoque.produto.descricao}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span>{estoque.produto.categoria}</span>
                        <span>•</span>
                        <span>{estoque.produto.unidade}</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(estoque)}`}>
                      {getStatusText(estoque)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Quantidade:</span>
                      <span className="text-2xl font-bold text-slate-900">{estoque.quantidade}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Estoque Mínimo:</span>
                      <span className="font-medium">{estoque.estoqueMinimo}</span>
                    </div>
                    {estoque.dataUltimaEntrada && (
                      <div className="pt-2 border-t border-slate-200 text-xs text-slate-500">
                        Última entrada: {new Date(estoque.dataUltimaEntrada).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/estoque/${estoque.id}`)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalhes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/estoque/${estoque.id}/editar`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
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
