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
import { Locacao } from '@/types'
import { locacaoService } from '@/services/locacaoService'

type ViewMode = 'cards' | 'table'

export function OrdensServicoPage() {
  const navigate = useNavigate()
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([])
  const [locacoes, setLocacoes] = useState<Locacao[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusOrdemServico | ''>('')
  const [tipoFilter, setTipoFilter] = useState<TipoOrdemServico | ''>('')
  const [locacaoFilter, setLocacaoFilter] = useState<string>('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [ordensData, locacoesData] = await Promise.all([
        ordemServicoService.listar(),
        locacaoService.listar(),
      ])
      setOrdensServico(ordensData)
      setLocacoes(locacoesData)
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

  const filteredOrdensServico = ordensServico.filter((os) => {
    const matchesSearch =
      os.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      os.locacao?.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      os.gerador?.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      os.tecnicoResponsavel?.nome.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !statusFilter || os.status === statusFilter
    const matchesTipo = !tipoFilter || os.tipo === tipoFilter
    const matchesLocacao = !locacaoFilter || os.locacaoId === locacaoFilter

    return matchesSearch && matchesStatus && matchesTipo && matchesLocacao
  })

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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusOrdemServico | '')}
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
          onChange={(e) => setTipoFilter(e.target.value as TipoOrdemServico | '')}
          className="flex h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todos os Tipos</option>
          <option value={TipoOrdemServico.ENTREGA}>Entrega</option>
          <option value={TipoOrdemServico.RECOLHIMENTO}>Recolhimento</option>
          <option value={TipoOrdemServico.MANUTENCAO}>Manutenção</option>
        </select>
        <select
          value={locacaoFilter}
          onChange={(e) => setLocacaoFilter(e.target.value)}
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
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Número</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Locação</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Gerador</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Técnico</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Data Agendada</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredOrdensServico.map((os) => {
                    const statusInfo = formatStatus(os.status)
                    return (
                      <motion.tr
                        key={os.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/ordens-servico/${os.id}`)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{os.numero}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-slate-900">{formatTipo(os.tipo)}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-slate-600">{os.locacao?.numero || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-slate-600">{os.gerador?.codigo || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-slate-600">{os.tecnicoResponsavel?.nome || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-slate-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(os.dataAgendada)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/ordens-servico/${os.id}`)
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/ordens-servico/${os.id}/editar`)
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(os.id)
                              }}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
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
      )}
    </div>
  )
}
