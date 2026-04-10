import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { OrdemServico, TipoOrdemServico, StatusOrdemServico } from '@/types'
import { ordemServicoService } from '@/services/ordemServicoService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ClipboardList,
  Calendar,
  User,
  Zap,
  CheckCircle2,
  Clock,
  XCircle,
  Grid3x3,
  Table as TableIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  DesktopDataTableShell,
  STH,
  listInteractiveRow,
  paginationBarClass,
  paginationControlsClass,
} from '@/components/tables/responsiveDataList'
import { Locacao } from '@/types'
import { locacaoService } from '@/services/locacaoService'

type ViewMode = 'cards' | 'table'

export function OrdensServicoPage() {
  const navigate = useNavigate()
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([])
  const [locacoes, setLocacoes] = useState<Locacao[]>([])
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusOrdemServico | ''>('')
  const [tipoFilter, setTipoFilter] = useState<TipoOrdemServico | ''>('')
  const [locacaoFilter, setLocacaoFilter] = useState<string>('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  useEffect(() => {
    carregarDados()
  }, [page, size, searchTerm, statusFilter, tipoFilter, locacaoFilter])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [ordensPage, locacoesPage] = await Promise.all([
        ordemServicoService.listar({ page, size, q: searchTerm, status: statusFilter, tipo: tipoFilter, locacaoId: locacaoFilter || undefined }),
        locacaoService.listar({ page: 0, size: 200 }), // para popular o filtro (ajuste se necessário)
      ])
      setOrdensServico(ordensPage.content)
      setTotalPages(ordensPage.totalPages)
      setTotalElements(ordensPage.totalElements)
      setLocacoes(locacoesPage.content)
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
      try {
        await ordemServicoService.deletar(id)
        await carregarDados()
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir ordem de serviço')
      }
    }
  }

  const formatStatus = (status: StatusOrdemServico) => {
    const statusMap: Record<StatusOrdemServico, { label: string; color: string }> = {
      [StatusOrdemServico.PENDENTE]: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      [StatusOrdemServico.EM_ANDAMENTO]: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' },
      [StatusOrdemServico.CONCLUIDA]: { label: 'Concluída', color: 'bg-green-100 text-green-800' },
      [StatusOrdemServico.CANCELADA]: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
    }
    return statusMap[status] || { label: status, color: 'bg-slate-100 text-slate-800' }
  }

  const formatTipo = (tipo: TipoOrdemServico) => {
    const tipoMap: Record<TipoOrdemServico, string> = {
      [TipoOrdemServico.ENTREGA]: 'Entrega',
      [TipoOrdemServico.RECOLHIMENTO]: 'Recolhimento',
      [TipoOrdemServico.MANUTENCAO]: 'Manutenção',
    }
    return tipoMap[tipo] || tipo
  }

  const formatDate = (date: string) => {
    if (!date) return ''
    const parts = date.split('T')[0].split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const filteredOrdensServico = ordensServico

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Carregando ordens de serviço...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Ordens de Serviço</h1>
          <p className="text-slate-600 mt-1">Gerencie as ordens de serviço das locações</p>
        </div>
        <Button onClick={() => navigate('/ordens-servico/novo')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Ordem de Serviço
        </Button>
      </div>

      {/* Busca e Filtros */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por número, locação, gerador ou técnico..."
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
            setStatusFilter(e.target.value as StatusOrdemServico | '')
          }}
          className="flex h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todos os Status</option>
          <option value={StatusOrdemServico.PENDENTE}>Pendente</option>
          <option value={StatusOrdemServico.EM_ANDAMENTO}>Em Andamento</option>
          <option value={StatusOrdemServico.CONCLUIDA}>Concluída</option>
          <option value={StatusOrdemServico.CANCELADA}>Cancelada</option>
        </select>
        <select
          value={tipoFilter}
          onChange={(e) => {
            setPage(0)
            setTipoFilter(e.target.value as TipoOrdemServico | '')
          }}
          className="flex h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todos os Tipos</option>
          <option value={TipoOrdemServico.ENTREGA}>Entrega</option>
          <option value={TipoOrdemServico.RECOLHIMENTO}>Recolhimento</option>
          <option value={TipoOrdemServico.MANUTENCAO}>Manutenção</option>
        </select>
        <select
          value={locacaoFilter}
          onChange={(e) => {
            setPage(0)
            setLocacaoFilter(e.target.value)
          }}
          className="flex h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todas as Locações</option>
          {locacoes.map((locacao) => (
            <option key={locacao.id} value={locacao.id}>
              {locacao.numero}
            </option>
          ))}
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

      {/* Lista de Ordens de Serviço */}
      {filteredOrdensServico.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {searchTerm || statusFilter || tipoFilter || locacaoFilter
                ? 'Nenhuma ordem de serviço encontrada com os filtros aplicados'
                : 'Nenhuma ordem de serviço cadastrada'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrdensServico.map((os) => {
            const statusInfo = formatStatus(os.status)
            return (
              <motion.div
                key={os.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <ClipboardList className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{os.numero}</CardTitle>
                          <p className="text-sm text-slate-500">{formatTipo(os.tipo)}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      {os.locacao && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span>Loc: {os.locacao.numero}</span>
                        </div>
                      )}
                      {os.gerador && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Zap className="h-4 w-4 text-slate-400" />
                          <span>{os.gerador.codigo}</span>
                        </div>
                      )}
                      {os.tecnicoResponsavel && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <User className="h-4 w-4 text-slate-400" />
                          <span>{os.tecnicoResponsavel.nome}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span>Agendada: {formatDate(os.dataAgendada)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-slate-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/ordens-servico/${os.id}`)}
                        className="flex-1 gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/ordens-servico/${os.id}/editar`)}
                        className="flex-1 gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(os.id)}
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
            {filteredOrdensServico.map((os) => {
              const statusInfo = formatStatus(os.status)
              return (
                <motion.div
                  key={os.id}
                  role="button"
                  tabIndex={0}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => navigate(`/ordens-servico/${os.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(`/ordens-servico/${os.id}`)
                    }
                  }}
                  className="w-full cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-sm ring-1 ring-slate-900/5 transition hover:border-slate-300 hover:shadow-md active:scale-[0.99]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold tabular-nums text-slate-900">{os.numero}</span>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{formatTipo(os.tipo)}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>Loc. {os.locacao?.numero || 'N/A'}</span>
                        <span>Ger. {os.gerador?.codigo || 'N/A'}</span>
                      </div>
                      <p className="text-xs text-slate-500">{os.tecnicoResponsavel?.nome || 'Sem técnico'}</p>
                      <p className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(os.dataAgendada)}
                      </p>
                    </div>
                    <div
                      className="flex w-full justify-end gap-1 border-t border-slate-100 pt-3 sm:w-auto sm:border-0 sm:pt-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation" onClick={() => navigate(`/ordens-servico/${os.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation" onClick={() => navigate(`/ordens-servico/${os.id}/editar`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation text-red-600 hover:bg-red-50" onClick={() => handleDelete(os.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <DesktopDataTableShell tableMinClass="min-w-[60rem]">
            <thead>
              <tr>
                <th className={STH.left}>Número</th>
                <th className={STH.mid}>Tipo</th>
                <th className={STH.midHiddenLg}>Locação</th>
                <th className={STH.mid}>Gerador</th>
                <th className={STH.midHiddenLg}>Técnico</th>
                <th className={STH.mid}>Agendada</th>
                <th className={STH.mid}>Status</th>
                <th className={STH.right}>Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrdensServico.map((os, index) => {
                const statusInfo = formatStatus(os.status)
                return (
                  <motion.tr
                    key={os.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={listInteractiveRow(index)}
                    onClick={() => navigate(`/ordens-servico/${os.id}`)}
                  >
                    <td className="py-3.5 pl-4 pr-3 align-middle font-semibold tabular-nums text-slate-900">{os.numero}</td>
                    <td className="whitespace-nowrap px-3 py-3.5 align-middle text-sm text-slate-700">{formatTipo(os.tipo)}</td>
                    <td className="hidden px-3 py-3.5 align-middle text-sm tabular-nums text-slate-600 lg:table-cell">
                      {os.locacao?.numero || 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 align-middle text-sm tabular-nums text-slate-600">{os.gerador?.codigo || 'N/A'}</td>
                    <td className="hidden max-w-[10rem] px-3 py-3.5 align-middle lg:table-cell">
                      <span className="line-clamp-2 text-sm text-slate-600">{os.tecnicoResponsavel?.nome || 'N/A'}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 align-middle text-sm tabular-nums text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(os.dataAgendada)}
                      </span>
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
                            navigate(`/ordens-servico/${os.id}`)
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
                            navigate(`/ordens-servico/${os.id}/editar`)
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
                            handleDelete(os.id)
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
