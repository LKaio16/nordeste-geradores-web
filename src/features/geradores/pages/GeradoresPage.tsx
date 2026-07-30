import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gerador, StatusGerador } from '@/types'
import { geradorService } from '@/services/geradorService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Zap,
  Gauge,
  Calendar,
  Hash,
  Building2,
  Grid3x3,
  Table as TableIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  DesktopDataTableShell,
  STH,
  listInteractiveRow,
  openButtonHandlers,
  paginationBarClass,
  paginationControlsClass,
} from '@/components/tables/responsiveDataList'

type ViewMode = 'cards' | 'table'

export function GeradoresPage() {
  const navigate = useNavigate()
  const [geradores, setGeradores] = useState<Gerador[]>([])
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusGerador | ''>('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  useEffect(() => {
    carregarGeradores()
  }, [page, size, searchTerm, statusFilter])

  const carregarGeradores = async () => {
    try {
      setLoading(true)
      const data = await geradorService.listar({ page, size, q: searchTerm, status: statusFilter })
      setGeradores(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (err: any) {
      console.error('Erro ao carregar geradores:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este gerador?')) {
      try {
        await geradorService.deletar(id)
        await carregarGeradores()
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir gerador')
      }
    }
  }

  const formatStatus = (status: StatusGerador) => {
    const statusMap: Record<StatusGerador, { label: string; color: string }> = {
      [StatusGerador.DISPONIVEL]: { label: 'Disponível', color: 'bg-green-100 text-green-800' },
      [StatusGerador.LOCADO]: { label: 'Locado', color: 'bg-blue-100 text-blue-800' },
      [StatusGerador.MANUTENCAO]: { label: 'Em Manutenção', color: 'bg-yellow-100 text-yellow-800' },
      [StatusGerador.INATIVO]: { label: 'Inativo', color: 'bg-red-100 text-red-800' },
    }
    return statusMap[status] || { label: status, color: 'bg-slate-100 text-slate-800' }
  }

  const filteredGeradores = geradores

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Carregando geradores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Geradores</h1>
          <p className="text-slate-600 mt-1">Gerencie o cadastro de geradores</p>
        </div>
        <Button onClick={() => navigate('/geradores/novo')} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Gerador
        </Button>
      </div>

      {/* Busca e Filtros */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por código, modelo, marca, número de série ou potência..."
            value={searchTerm}
            onChange={(e) => {
              setPage(0)
              setSearchTerm(e.target.value)
            }}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(0)
            setStatusFilter(e.target.value as StatusGerador | '')
          }}
          className="flex h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todos os Status</option>
          <option value={StatusGerador.DISPONIVEL}>Disponível</option>
          <option value={StatusGerador.LOCADO}>Locado</option>
          <option value={StatusGerador.MANUTENCAO}>Em Manutenção</option>
          <option value={StatusGerador.INATIVO}>Inativo</option>
        </select>
        <div className="flex gap-1 border border-slate-300 rounded-md overflow-hidden">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('cards')}
            className="rounded-none"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="rounded-none"
          >
            <TableIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Lista de Geradores */}
      {filteredGeradores.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {searchTerm || statusFilter
                ? 'Nenhum gerador encontrado com os filtros aplicados'
                : 'Nenhum gerador cadastrado'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGeradores.map((gerador) => {
            const statusInfo = formatStatus(gerador.status)
            return (
              <motion.div
                key={gerador.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Zap className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{gerador.codigo}</CardTitle>
                          <p className="text-sm text-slate-500">{gerador.modelo} - {gerador.marca}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Hash className="h-4 w-4 text-slate-400" />
                        <span>Série: {gerador.numeroSerie}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Gauge className="h-4 w-4 text-slate-400" />
                        <span>Potência: {gerador.potencia}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>Ano: {gerador.anoFabricacao}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <span>Horímetro: {gerador.horimetro.toLocaleString('pt-BR')}h</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-slate-200">
                      <Button
                        variant="outline"
                        size="sm"
                        {...openButtonHandlers(`/geradores/${gerador.id}`, navigate)}
                        className="flex-1 gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/geradores/${gerador.id}/editar`)}
                        className="flex-1 gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(gerador.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filteredGeradores.map((gerador) => {
              const statusInfo = formatStatus(gerador.status)
              return (
                <motion.div
                  key={gerador.id}
                  role="button"
                  tabIndex={0}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  {...openButtonHandlers(`/geradores/${gerador.id}`, navigate)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(`/geradores/${gerador.id}`)
                    }
                  }}
                  className="w-full cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-sm ring-1 ring-slate-900/5 transition hover:border-slate-300 hover:shadow-md active:scale-[0.99]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900">{gerador.codigo}</span>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">
                        {gerador.modelo} · {gerador.marca}
                      </p>
                      <p className="text-xs text-slate-500">Série {gerador.numeroSerie}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>Pot. {gerador.potencia}</span>
                        <span>Ano {gerador.anoFabricacao}</span>
                        <span className="tabular-nums">{gerador.horimetro.toLocaleString('pt-BR')} h</span>
                      </div>
                    </div>
                    <div
                      className="flex w-full justify-end gap-1 border-t border-slate-100 pt-3 sm:w-auto sm:border-0 sm:pt-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation" {...openButtonHandlers(`/geradores/${gerador.id}`, navigate)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation" onClick={() => navigate(`/geradores/${gerador.id}/editar`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation text-red-600 hover:bg-red-50" onClick={() => handleDelete(gerador.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <DesktopDataTableShell tableMinClass="min-w-[72rem]">
            <thead>
              <tr>
                <th className={STH.left}>Código</th>
                <th className={STH.mid}>Modelo</th>
                <th className={STH.midHiddenLg}>Marca</th>
                <th className={STH.mid}>Nº série</th>
                <th className={STH.midNum}>Potência</th>
                <th className={STH.midNum}>Ano</th>
                <th className={STH.midHiddenLg}>Horímetro</th>
                <th className={STH.mid}>Status</th>
                <th className={STH.right}>Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGeradores.map((gerador, index) => {
                const statusInfo = formatStatus(gerador.status)
                return (
                  <motion.tr
                    key={gerador.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={listInteractiveRow(index)}
                    {...openButtonHandlers(`/geradores/${gerador.id}`, navigate)}
                  >
                    <td className="py-3.5 pl-4 pr-3 align-middle font-semibold text-slate-900">{gerador.codigo}</td>
                    <td className="max-w-[10rem] px-3 py-3.5 align-middle text-sm text-slate-800">{gerador.modelo}</td>
                    <td className="hidden px-3 py-3.5 align-middle text-sm text-slate-600 lg:table-cell">{gerador.marca}</td>
                    <td className="whitespace-nowrap px-3 py-3.5 align-middle text-sm tabular-nums text-slate-600">{gerador.numeroSerie}</td>
                    <td className="px-3 py-3.5 text-right align-middle text-sm tabular-nums text-slate-600">{gerador.potencia}</td>
                    <td className="px-3 py-3.5 text-right align-middle text-sm tabular-nums text-slate-600">{gerador.anoFabricacao}</td>
                    <td className="hidden px-3 py-3.5 align-middle text-sm tabular-nums text-slate-600 lg:table-cell">
                      {gerador.horimetro.toLocaleString('pt-BR')} h
                    </td>
                    <td className="px-3 py-3.5 align-middle">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                    </td>
                    <td className="px-1 py-2 pr-4 align-middle" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 touch-manipulation"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/geradores/${gerador.id}`)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 touch-manipulation"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/geradores/${gerador.id}/editar`)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 touch-manipulation text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(gerador.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </DesktopDataTableShell>
        </>
      )}

      {/* Paginação */}
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
    </div>
  )
}
