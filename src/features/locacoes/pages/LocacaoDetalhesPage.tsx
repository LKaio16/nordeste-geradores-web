import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Locacao, StatusLocacao, TipoLocacao, OrdemServico, TipoOrdemServico, StatusOrdemServico } from '@/types'
import { locacaoService } from '@/services/locacaoService'
import { ordemServicoService } from '@/services/ordemServicoService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Edit,
  Calendar,
  Zap,
  User,
  DollarSign,
  FileText,
  CheckCircle2,
  ClipboardList,
  Plus,
  Eye,
  Clock,
} from 'lucide-react'
import { motion } from 'framer-motion'

export function LocacaoDetalhesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [locacao, setLocacao] = useState<Locacao | null>(null)
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingOS, setLoadingOS] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      carregarLocacao(id)
      carregarOrdensServico(id)
    }
  }, [id])

  const carregarLocacao = async (locacaoId: string) => {
    try {
      setLoading(true)
      const data = await locacaoService.buscarPorId(locacaoId)
      setLocacao(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar locação')
    } finally {
      setLoading(false)
    }
  }

  const carregarOrdensServico = async (locacaoId: string) => {
    try {
      setLoadingOS(true)
      const data = await ordemServicoService.buscarPorLocacaoId(locacaoId)
      setOrdensServico(data)
    } catch (err: any) {
      console.error('Erro ao carregar ordens de serviço:', err)
    } finally {
      setLoadingOS(false)
    }
  }

  const handleFinalizar = async () => {
    if (!id) return
    if (window.confirm('Tem certeza que deseja finalizar esta locação?')) {
      try {
        await locacaoService.finalizar(id)
        await carregarLocacao(id)
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

  const formatTipo = (tipo: string) => {
    const tipoMap: Record<string, string> = {
      MENSAL: 'Mensal',
      DIARIA: 'Diária',
      EVENTO: 'Evento',
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

  const formatTipoOS = (tipo: TipoOrdemServico) => {
    const tipoMap: Record<TipoOrdemServico, string> = {
      [TipoOrdemServico.ENTREGA]: 'Entrega',
      [TipoOrdemServico.RECOLHIMENTO]: 'Recolhimento',
      [TipoOrdemServico.MANUTENCAO]: 'Manutenção',
    }
    return tipoMap[tipo] || tipo
  }

  const formatStatusOS = (status: StatusOrdemServico) => {
    const statusMap: Record<StatusOrdemServico, { label: string; color: string }> = {
      [StatusOrdemServico.PENDENTE]: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      [StatusOrdemServico.EM_ANDAMENTO]: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' },
      [StatusOrdemServico.CONCLUIDA]: { label: 'Concluída', color: 'bg-green-100 text-green-800' },
      [StatusOrdemServico.CANCELADA]: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
    }
    return statusMap[status] || { label: status, color: 'bg-slate-100 text-slate-800' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Carregando locação...</p>
        </div>
      </div>
    )
  }

  if (error || !locacao) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/locacoes')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">{error || 'Locação não encontrada'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusInfo = formatStatus(locacao.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/locacoes')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{locacao.numero}</h1>
            <p className="text-slate-600 mt-1">Detalhes da locação</p>
          </div>
        </div>
        <div className="flex gap-2">
          {locacao.status === StatusLocacao.ATIVA && (
            <Button onClick={handleFinalizar} variant="outline" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Finalizar Locação
            </Button>
          )}
          <Button onClick={() => navigate(`/locacoes/${id}/editar`)} className="gap-2">
            <Edit className="h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      {/* Informações Principais */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              Informações da Locação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Número</span>
                <p className="font-bold text-lg text-slate-900 mt-1">{locacao.numero}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tipo</span>
                  <p className="font-semibold text-slate-900 mt-1">{formatTipo(locacao.tipo)}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</span>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Data de Início</span>
                  <p className="font-semibold text-slate-900 mt-1">{formatDate(locacao.dataInicio)}</p>
                </div>
                {locacao.dataFim && (
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Data de Fim</span>
                    <p className="font-semibold text-slate-900 mt-1">{formatDate(locacao.dataFim)}</p>
                  </div>
                )}
              </div>
              {locacao.valorMensal && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {locacao.tipo === TipoLocacao.MENSAL 
                      ? 'Valor Mensal'
                      : locacao.tipo === TipoLocacao.DIARIA
                      ? 'Valor Diário'
                      : 'Valor do Evento'}
                  </span>
                  <p className="font-bold text-xl text-slate-900 mt-1 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    R$ {locacao.valorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {locacao.cliente ? (
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Nome</span>
                  <p className="font-semibold text-slate-900 mt-1">{locacao.cliente.nome}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">CNPJ</span>
                  <p className="font-semibold text-slate-900 mt-1">{locacao.cliente.cnpj}</p>
                </div>
                {locacao.cliente.email && (
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</span>
                    <p className="font-semibold text-slate-900 mt-1">{locacao.cliente.email}</p>
                  </div>
                )}
                {locacao.cliente.telefone && (
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Telefone</span>
                    <p className="font-semibold text-slate-900 mt-1">{locacao.cliente.telefone}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400 italic text-center py-4">Cliente não informado</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Zap className="h-5 w-5 text-yellow-600" />
              </div>
              Gerador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {locacao.gerador ? (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Código</span>
                  <p className="font-bold text-lg text-slate-900 mt-1">{locacao.gerador.codigo}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Modelo</span>
                    <p className="font-semibold text-slate-900 mt-1">{locacao.gerador.modelo}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Marca</span>
                    <p className="font-semibold text-slate-900 mt-1">{locacao.gerador.marca}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Potência</span>
                    <p className="font-semibold text-slate-900 mt-1">{locacao.gerador.potencia}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</span>
                    <p className="font-semibold text-slate-900 mt-1">{locacao.gerador.status}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic text-center py-4">Gerador não informado</p>
            )}
          </CardContent>
        </Card>

        {locacao.observacoes && (
          <Card className="shadow-sm md:col-span-2">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <FileText className="h-5 w-5 text-slate-600" />
                </div>
                Observações
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{locacao.observacoes}</p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Ordens de Serviço */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ClipboardList className="h-5 w-5 text-green-600" />
                </div>
                Ordens de Serviço
              </CardTitle>
              <Button
                onClick={() => navigate(`/ordens-servico/novo?locacaoId=${id}`)}
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Nova OS
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingOS ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : ordensServico.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>Nenhuma ordem de serviço vinculada a esta locação</p>
                <Button
                  onClick={() => navigate(`/ordens-servico/novo?locacaoId=${id}`)}
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Criar Primeira OS
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Número</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Tipo</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Técnico</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Data Agendada</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {ordensServico.map((os) => {
                      const statusInfo = formatStatusOS(os.status)
                      return (
                        <motion.tr
                          key={os.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-semibold text-slate-900">{os.numero}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-slate-900">{formatTipoOS(os.tipo)}</div>
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/ordens-servico/${os.id}`)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

