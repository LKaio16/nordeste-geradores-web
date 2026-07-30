import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Locacao, TipoLocacao, StatusLocacao } from '@/types'
import { locacaoService, nomeClienteLocacao } from '@/services/locacaoService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Zap,
  User,
  CheckCircle2,
  XCircle,
  Clock,
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

export function LocacoesPage() {
  const navigate = useNavigate()
  const [locacoes, setLocacoes] = useState<Locacao[]>([])
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusLocacao | ''>('')
  const [tipoFilter, setTipoFilter] = useState<TipoLocacao | ''>('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  useEffect(() => {
    carregarLocacoes()
  }, [page, size, searchTerm, statusFilter, tipoFilter])

  const carregarLocacoes = async () => {
    try {
      setLoading(true)
      const data = await locacaoService.listar({ page, size, q: searchTerm, status: statusFilter, tipo: tipoFilter })
      setLocacoes(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (err: any) {
      console.error('Erro ao carregar locações:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta locação?')) {
      try {
        await locacaoService.deletar(id)
        await carregarLocacoes()
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir locação')
      }
    }
  }

  const handleFinalizar = async (id: string) => {
    if (window.confirm('Tem certeza que deseja finalizar esta locação?')) {
      try {
        await locacaoService.finalizar(id)
        await carregarLocacoes()
      } catch (err: any) {
        alert(err.message || 'Erro ao finalizar locação')
      }
    }
  }

  const formatStatus = (status: StatusLocacao) => {
    const statusMap: Record<StatusLocacao, { label: string; color: string }> = {
      [StatusLocacao.ATIVA]: { label: 'Ativa', color: 'bg-green-100 text-green-800' },
      [StatusLocacao.ENCERRADA]: { label: 'Encerrada', color: 'bg-blue-100 text-blue-800' },
      [StatusLocacao.CANCELADA]: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
    }
    return statusMap[status] || { label: status, color: 'bg-slate-100 text-slate-800' }
  }

  const formatTipo = (tipo: TipoLocacao) => {
    const tipoMap: Record<TipoLocacao, string> = {
      [TipoLocacao.MENSAL]: 'Mensal',
      [TipoLocacao.DIARIA]: 'Diária',
      [TipoLocacao.EVENTO]: 'Evento',
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

  const filteredLocacoes = locacoes

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Carregando locações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Locações</h1>
          <p className="text-slate-600 mt-1">Gerencie as locações de geradores</p>
        </div>
        <Button onClick={() => navigate('/locacoes/novo')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Locação
        </Button>
      </div>

      {/* Busca e Filtros */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por número, cliente ou gerador..."
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
            setStatusFilter(e.target.value as StatusLocacao | '')
          }}
          className="flex h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todos os Status</option>
          <option value={StatusLocacao.ATIVA}>Ativa</option>
          <option value={StatusLocacao.ENCERRADA}>Encerrada</option>
          <option value={StatusLocacao.CANCELADA}>Cancelada</option>
        </select>
        <select
          value={tipoFilter}
          onChange={(e) => {
            setPage(0)
            setTipoFilter(e.target.value as TipoLocacao | '')
          }}
          className="flex h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todos os Tipos</option>
          <option value={TipoLocacao.MENSAL}>Mensal</option>
          <option value={TipoLocacao.DIARIA}>Diária</option>
          <option value={TipoLocacao.EVENTO}>Evento</option>
        </select>
      </div>

      {/* Lista de Locações */}
      {filteredLocacoes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {searchTerm || statusFilter || tipoFilter
                ? 'Nenhuma locação encontrada com os filtros aplicados'
                : 'Nenhuma locação cadastrada'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLocacoes.map((locacao) => {
            const statusInfo = formatStatus(locacao.status)
            return (
              <motion.div
                key={locacao.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{locacao.numero}</CardTitle>
                          <p className="text-sm text-slate-500">{formatTipo(locacao.tipo)}</p>
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
                        <User className="h-4 w-4 text-slate-400" />
                        <span>{nomeClienteLocacao(locacao)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Zap className="h-4 w-4 text-slate-400" />
                        <span>
                          {locacao.geradores?.length
                            ? locacao.geradores.map((g) => g.codigo).join(', ')
                            : locacao.gerador?.codigo || 'Gerador não informado'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span>Início: {formatDate(locacao.dataInicio)}</span>
                      </div>
                      {locacao.dataFim && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span>Fim: {formatDate(locacao.dataFim)}</span>
                        </div>
                      )}
                      {locacao.valorMensal && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <span className="font-semibold">
                            R$ {locacao.valorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-slate-200">
                      <Button
                        variant="outline"
                        size="sm"
                        {...openButtonHandlers(`/locacoes/${locacao.id}`, navigate)}
                        className="flex-1 gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                      {locacao.status === StatusLocacao.ATIVA && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFinalizar(locacao.id)}
                          className="flex-1 gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Finalizar
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/locacoes/${locacao.id}/editar`)}
                        className="flex-1 gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(locacao.id)}
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
            {filteredLocacoes.map((locacao) => {
              const statusInfo = formatStatus(locacao.status)
              return (
                <motion.div
                  key={locacao.id}
                  role="button"
                  tabIndex={0}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  {...openButtonHandlers(`/locacoes/${locacao.id}`, navigate)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(`/locacoes/${locacao.id}`)
                    }
                  }}
                  className="w-full cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-sm ring-1 ring-slate-900/5 transition hover:border-slate-300 hover:shadow-md active:scale-[0.99]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold tabular-nums text-slate-900">{locacao.numero}</span>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm text-slate-700">{nomeClienteLocacao(locacao)}</p>
                      <p className="text-xs text-slate-500">
                        Gerador(es){' '}
                        {locacao.geradores?.length
                          ? locacao.geradores.map((g) => g.codigo).join(', ')
                          : locacao.gerador?.codigo || 'N/A'}{' '}
                        · {formatTipo(locacao.tipo)}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>Início {formatDate(locacao.dataInicio)}</span>
                        {locacao.dataFim ? <span>Fim {formatDate(locacao.dataFim)}</span> : null}
                      </div>
                      {locacao.valorMensal ? (
                        <p className="text-sm font-bold tabular-nums text-slate-900">
                          R${' '}
                          {locacao.valorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      ) : null}
                    </div>
                    <div
                      className="flex w-full flex-wrap justify-end gap-1 border-t border-slate-100 pt-3 sm:w-auto sm:border-0 sm:pt-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation" {...openButtonHandlers(`/locacoes/${locacao.id}`, navigate)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {locacao.status === StatusLocacao.ATIVA && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 touch-manipulation text-emerald-600 hover:bg-emerald-50"
                          title="Finalizar"
                          onClick={() => handleFinalizar(locacao.id)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation" onClick={() => navigate(`/locacoes/${locacao.id}/editar`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation text-red-600 hover:bg-red-50" onClick={() => handleDelete(locacao.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <DesktopDataTableShell tableMinClass="min-w-[68rem]">
            <thead>
              <tr>
                <th className={STH.left}>Número</th>
                <th className={STH.mid}>Tipo</th>
                <th className={STH.mid}>Cliente</th>
                <th className={STH.midHiddenLg}>Gerador</th>
                <th className={STH.midHiddenLg}>Início</th>
                <th className={STH.midHiddenXl}>Fim</th>
                <th className={STH.midNum}>Valor</th>
                <th className={STH.mid}>Status</th>
                <th className={STH.right}>Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLocacoes.map((locacao, index) => {
                const statusInfo = formatStatus(locacao.status)
                return (
                  <motion.tr
                    key={locacao.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={listInteractiveRow(index)}
                    {...openButtonHandlers(`/locacoes/${locacao.id}`, navigate)}
                  >
                    <td className="py-3.5 pl-4 pr-3 align-middle font-semibold tabular-nums text-slate-900">{locacao.numero}</td>
                    <td className="whitespace-nowrap px-3 py-3.5 align-middle text-sm text-slate-700">{formatTipo(locacao.tipo)}</td>
                    <td className="max-w-[12rem] px-3 py-3.5 align-middle">
                      <span className="line-clamp-2 text-sm text-slate-800">{nomeClienteLocacao(locacao)}</span>
                    </td>
                    <td className="hidden px-3 py-3.5 align-middle text-sm tabular-nums text-slate-600 lg:table-cell">
                      {locacao.geradores?.length
                        ? locacao.geradores.map((g) => g.codigo).join(', ')
                        : locacao.gerador?.codigo || 'N/A'}
                    </td>
                    <td className="hidden whitespace-nowrap px-3 py-3.5 align-middle text-sm tabular-nums text-slate-600 lg:table-cell">
                      {formatDate(locacao.dataInicio)}
                    </td>
                    <td className="hidden whitespace-nowrap px-3 py-3.5 align-middle text-sm tabular-nums text-slate-600 xl:table-cell">
                      {locacao.dataFim ? formatDate(locacao.dataFim) : '—'}
                    </td>
                    <td className="px-3 py-3.5 text-right align-middle text-sm font-semibold tabular-nums text-slate-900">
                      {locacao.valorMensal
                        ? `R$ ${locacao.valorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : '—'}
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
                            navigate(`/locacoes/${locacao.id}`)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {locacao.status === StatusLocacao.ATIVA && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 touch-manipulation text-emerald-600 hover:bg-emerald-50"
                            title="Finalizar"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleFinalizar(locacao.id)
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 touch-manipulation"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/locacoes/${locacao.id}/editar`)
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
                            handleDelete(locacao.id)
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
