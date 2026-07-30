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
  PackageX,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DesktopDataTableShell,
  STH,
  listInteractiveRow,
  openButtonHandlers,
  paginationBarClass,
  paginationControlsClass,
} from '@/components/tables/responsiveDataList'

type ViewMode = 'cards' | 'table'

export function EstoquePage() {
  const navigate = useNavigate()
  const [estoques, setEstoques] = useState<Estoque[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
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
    estoqueService
      .listarCategorias()
      .then(setCategorias)
      .catch((err) => console.error('Erro ao carregar categorias de estoque:', err))
  }, [])

  useEffect(() => {
    carregarEstoques()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, searchTerm, filters.categoria, filters.abaixoMinimo, filters.semEstoque])

  const carregarEstoques = async () => {
    try {
      setLoading(true)
      const data = await estoqueService.listarPagina({
        page,
        size,
        q: searchTerm,
        categoria: filters.categoria,
        semEstoque: filters.semEstoque,
        abaixoMinimo: filters.abaixoMinimo,
      })
      setEstoques(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (err: any) {
      console.error('Erro ao carregar estoques:', err)
    } finally {
      setLoading(false)
    }
  }

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

  const clearFilters = () => {
    setPage(0)
    setFilters({})
  }

  const activeFilterCount =
    (filters.categoria ? 1 : 0) +
    (filters.abaixoMinimo ? 1 : 0) +
    (filters.semEstoque ? 1 : 0)
  const hasActiveFilters = activeFilterCount > 0

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
              onChange={(e) => {
                setPage(0)
                setSearchTerm(e.target.value)
              }}
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
                {activeFilterCount}
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
                    <div className="space-y-2">
                      <Label htmlFor="filterCategoria">Categoria</Label>
                      <select
                        id="filterCategoria"
                        value={filters.categoria || ''}
                        onChange={(e) => {
                          setPage(0)
                          setFilters({
                            ...filters,
                            categoria: e.target.value || undefined,
                          })
                        }}
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

                    <div className="space-y-2 md:col-span-2">
                      <Label>Status</Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={filters.abaixoMinimo ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setPage(0)
                            setFilters({
                              ...filters,
                              abaixoMinimo: filters.abaixoMinimo ? undefined : true,
                              semEstoque: undefined,
                            })
                          }}
                          className="gap-2"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          Abaixo Mínimo
                        </Button>
                        <Button
                          variant={filters.semEstoque ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setPage(0)
                            setFilters({
                              ...filters,
                              semEstoque: filters.semEstoque ? undefined : true,
                              abaixoMinimo: undefined,
                            })
                          }}
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
      ) : estoques.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">Nenhum item de estoque encontrado</p>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <>
          <div className="space-y-3 md:hidden">
            {estoques.map((estoque) => (
              <motion.div
                key={estoque.id}
                role="button"
                tabIndex={0}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                {...openButtonHandlers(`/estoque/${estoque.id}`, navigate)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate(`/estoque/${estoque.id}`)
                  }
                }}
                className="w-full cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-sm ring-1 ring-slate-900/5 transition hover:border-slate-300 hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="line-clamp-2 font-semibold text-slate-900">{estoque.produto.descricao}</span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(estoque)}`}>
                        {getStatusText(estoque)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {estoque.produto.categoria} · {estoque.produto.unidade}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm tabular-nums">
                      <span>
                        Qtd. <strong className="text-slate-900">{estoque.quantidade}</strong>
                      </span>
                      <span className="text-slate-600">Mín. {estoque.estoqueMinimo}</span>
                    </div>
                  </div>
                  <div
                    className="flex w-full justify-end gap-1 border-t border-slate-100 pt-3 sm:w-auto sm:border-0 sm:pt-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation" {...openButtonHandlers(`/estoque/${estoque.id}`, navigate)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation" onClick={() => navigate(`/estoque/${estoque.id}/editar`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation text-red-600 hover:bg-red-50" onClick={() => handleDelete(estoque.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <DesktopDataTableShell tableMinClass="min-w-[52rem]">
            <thead>
              <tr>
                <th className={STH.left}>Produto</th>
                <th className={STH.midHiddenLg}>Categoria</th>
                <th className={STH.mid}>Unid.</th>
                <th className={STH.midNum}>Qtd</th>
                <th className={STH.midNum}>Mín</th>
                <th className={STH.center}>Status</th>
                <th className={STH.right}>Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {estoques.map((estoque, index) => (
                <motion.tr
                  key={estoque.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className={listInteractiveRow(index)}
                  {...openButtonHandlers(`/estoque/${estoque.id}`, navigate)}
                >
                  <td className="max-w-[14rem] py-3.5 pl-4 pr-3 align-middle">
                    <span className="line-clamp-2 font-semibold text-slate-900">{estoque.produto.descricao}</span>
                  </td>
                  <td className="hidden px-3 py-3.5 align-middle text-sm text-slate-600 lg:table-cell">{estoque.produto.categoria}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 align-middle text-sm text-slate-700">{estoque.produto.unidade}</td>
                  <td className="px-3 py-3.5 text-right align-middle text-sm font-semibold tabular-nums text-slate-900">{estoque.quantidade}</td>
                  <td className="px-3 py-3.5 text-right align-middle text-sm tabular-nums text-slate-600">{estoque.estoqueMinimo}</td>
                  <td className="px-3 py-3.5 align-middle">
                    <div className="flex justify-center">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(estoque)}`}>{getStatusText(estoque)}</span>
                    </div>
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
                          navigate(`/estoque/${estoque.id}`)
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
                          navigate(`/estoque/${estoque.id}/editar`)
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
                          handleDelete(estoque.id)
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
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {estoques.map((estoque) => (
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
                        {...openButtonHandlers(`/estoque/${estoque.id}`, navigate)}
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

      {!loading && estoques.length > 0 && (
        <div className={paginationBarClass()}>
          <div className="text-center text-sm text-slate-600 sm:text-left">
            Total: <span className="font-semibold text-slate-900">{totalElements}</span>
          </div>
          <div className={paginationControlsClass()}>
            <select
              value={size}
              onChange={(e) => {
                setPage(0)
                setSize(parseInt(e.target.value) || 20)
              }}
              className="flex h-9 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
            >
              <option value="10">10 / pág</option>
              <option value="20">20 / pág</option>
              <option value="50">50 / pág</option>
              <option value="100">100 / pág</option>
            </select>
            <Button variant="outline" size="sm" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              Anterior
            </Button>
            <div className="text-sm text-slate-700">
              Página <span className="font-semibold">{totalPages === 0 ? 0 : page + 1}</span> de{' '}
              <span className="font-semibold">{totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={totalPages === 0 || page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
