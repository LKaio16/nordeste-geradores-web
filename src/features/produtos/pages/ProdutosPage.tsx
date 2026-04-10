import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Produto } from '@/types'
import { produtoService } from '@/services/produtoService'
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
  Tag,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DesktopDataTableShell,
  STH,
  listInteractiveRow,
  paginationBarClass,
  paginationControlsClass,
} from '@/components/tables/responsiveDataList'

type ViewMode = 'cards' | 'table'

export function ProdutosPage() {
  const navigate = useNavigate()
  const [produtos, setProdutos] = useState<Produto[]>([])
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
  }>({})

  useEffect(() => {
    produtoService
      .listarCategorias()
      .then(setCategorias)
      .catch((err) => console.error('Erro ao carregar categorias:', err))
  }, [])

  useEffect(() => {
    carregarProdutos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, searchTerm, filters.categoria])

  const carregarProdutos = async () => {
    try {
      setLoading(true)
      const data = await produtoService.listarPagina({
        page,
        size,
        q: searchTerm,
        categoria: filters.categoria,
      })
      setProdutos(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (err: any) {
      console.error('Erro ao carregar produtos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await produtoService.deletar(id)
        await carregarProdutos()
        const cats = await produtoService.listarCategorias()
        setCategorias(cats)
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir produto')
      }
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const clearFilters = () => {
    setPage(0)
    setFilters({})
  }

  const hasActiveFilters = Boolean(filters.categoria)
  const activeFilterCount = filters.categoria ? 1 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Produtos</h1>
          <p className="text-slate-600 mt-1">Gerencie o cadastro de produtos</p>
        </div>
        <Button onClick={() => navigate('/produtos/novo')} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por descrição, categoria ou unidade..."
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
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-500">Carregando produtos...</p>
          </div>
        </div>
      ) : produtos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">Nenhum produto encontrado</p>
            <Button onClick={() => navigate('/produtos/novo')} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Primeiro Produto
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <>
          <div className="space-y-3 md:hidden">
            {produtos.map((produto) => (
              <motion.div
                key={produto.id}
                role="button"
                tabIndex={0}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate(`/produtos/${produto.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate(`/produtos/${produto.id}`)
                  }
                }}
                className="w-full cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-sm ring-1 ring-slate-900/5 transition hover:border-slate-300 hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="line-clamp-2 font-semibold text-slate-900">{produto.descricao}</p>
                    <p className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <Tag className="h-3.5 w-3.5" />
                      {produto.categoria} · {produto.unidade}
                    </p>
                    <p className="text-base font-bold tabular-nums text-emerald-700">{formatCurrency(produto.precoUnitario)}</p>
                  </div>
                  <div
                    className="flex w-full justify-end gap-1 border-t border-slate-100 pt-3 sm:w-auto sm:border-0 sm:pt-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation" onClick={() => navigate(`/produtos/${produto.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation" onClick={() => navigate(`/produtos/${produto.id}/editar`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation text-red-600 hover:bg-red-50" onClick={() => handleDelete(produto.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <DesktopDataTableShell tableMinClass="min-w-[48rem]">
            <thead>
              <tr>
                <th className={STH.left}>Descrição</th>
                <th className={STH.midHiddenLg}>Categoria</th>
                <th className={STH.mid}>Unidade</th>
                <th className={STH.midNum}>Preço</th>
                <th className={STH.right}>Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {produtos.map((produto, index) => (
                <motion.tr
                  key={produto.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className={listInteractiveRow(index)}
                  onClick={() => navigate(`/produtos/${produto.id}`)}
                >
                  <td className="max-w-[16rem] py-3.5 pl-4 pr-3 align-middle">
                    <span className="line-clamp-2 font-semibold text-slate-900">{produto.descricao}</span>
                  </td>
                  <td className="hidden px-3 py-3.5 align-middle lg:table-cell">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="line-clamp-2 text-sm text-slate-600">{produto.categoria}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 align-middle text-sm text-slate-700">{produto.unidade}</td>
                  <td className="px-3 py-3.5 text-right align-middle text-sm font-semibold tabular-nums text-emerald-700">
                    {formatCurrency(produto.precoUnitario)}
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
                          navigate(`/produtos/${produto.id}`)
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
                          navigate(`/produtos/${produto.id}/editar`)
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
                          handleDelete(produto.id)
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
          {produtos.map((produto) => (
            <motion.div
              key={produto.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{produto.descricao}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Tag className="h-3 w-3" />
                        <span>{produto.categoria}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Preço Unitário:</span>
                      <span className="text-xl font-bold text-emerald-600">
                        {formatCurrency(produto.precoUnitario)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Unidade:</span>
                      <span className="font-medium">{produto.unidade}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/produtos/${produto.id}`)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalhes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/produtos/${produto.id}/editar`)}
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

      {!loading && produtos.length > 0 && (
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
