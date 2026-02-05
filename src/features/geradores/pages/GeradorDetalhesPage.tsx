import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Gerador, StatusGerador } from '@/types'
import { geradorService } from '@/services/geradorService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Edit,
  Zap,
  Calendar,
  Gauge,
  Hash,
  Building2,
  FileText,
  History,
  Clock,
  User,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { GeradorAuditoria } from '@/types'

export function GeradorDetalhesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [gerador, setGerador] = useState<Gerador | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [historico, setHistorico] = useState<GeradorAuditoria[]>([])
  const [loadingHistorico, setLoadingHistorico] = useState(false)

  useEffect(() => {
    if (id) {
      carregarGerador(id)
      carregarHistorico(id)
    }
  }, [id])

  const carregarGerador = async (geradorId: string) => {
    try {
      setLoading(true)
      const data = await geradorService.buscarPorId(geradorId)
      setGerador(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar gerador')
    } finally {
      setLoading(false)
    }
  }

  const carregarHistorico = async (geradorId: string) => {
    try {
      setLoadingHistorico(true)
      const data = await geradorService.buscarHistorico(geradorId)
      setHistorico(data)
    } catch (err: any) {
      console.error('Erro ao carregar histórico:', err)
    } finally {
      setLoadingHistorico(false)
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Carregando gerador...</p>
        </div>
      </div>
    )
  }

  if (error || !gerador) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/geradores')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">{error || 'Gerador não encontrado'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusInfo = formatStatus(gerador.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/geradores')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{gerador.modelo}</h1>
            <p className="text-slate-600 mt-1">Detalhes do gerador</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/geradores/${id}/editar`)} className="gap-2">
          <Edit className="h-4 w-4" />
          Editar
        </Button>
      </div>

      {/* Informações Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Informações do Gerador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <span className="text-sm text-slate-500">Código</span>
                <p className="font-semibold text-slate-900">{gerador.codigo}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Modelo</span>
                <p className="font-semibold text-slate-900">{gerador.modelo}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Marca</span>
                <p className="font-semibold text-slate-900">{gerador.marca}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Número de Série</span>
                <p className="font-semibold text-slate-900 flex items-center gap-2">
                  <Hash className="h-4 w-4 text-slate-400" />
                  {gerador.numeroSerie}
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Potência</span>
                <p className="font-semibold text-slate-900 flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-slate-400" />
                  {gerador.potencia}
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Ano de Fabricação</span>
                <p className="font-semibold text-slate-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {gerador.anoFabricacao}
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Horímetro</span>
                <p className="font-semibold text-slate-900">{gerador.horimetro.toLocaleString('pt-BR')} horas</p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Status</span>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Observações e Informações Adicionais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {gerador.observacoes ? (
              <p className="text-slate-700 whitespace-pre-wrap">{gerador.observacoes}</p>
            ) : (
              <p className="text-slate-400 italic">Nenhuma observação cadastrada</p>
            )}
            
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <div>
                <span className="text-sm text-slate-500">Data de Cadastro</span>
                <p className="font-semibold text-slate-900">{formatDate(gerador.createdAt)}</p>
              </div>
              {gerador.updatedAt !== gerador.createdAt && (
                <div>
                  <span className="text-sm text-slate-500">Última Atualização</span>
                  <p className="font-semibold text-slate-900">{formatDate(gerador.updatedAt)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Alterações */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Alterações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingHistorico ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : historico.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <History className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>Nenhum registro de auditoria encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {historico.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="border-l-4 border-blue-500 pl-4 py-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              item.acao === 'CRIAR'
                                ? 'bg-green-100 text-green-700'
                                : item.acao === 'DELETAR'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {item.acao === 'CRIAR'
                              ? 'Criado'
                              : item.acao === 'ATUALIZAR'
                              ? 'Atualizado'
                              : item.acao === 'DELETAR'
                              ? 'Deletado'
                              : item.acao}
                          </span>
                          {item.campoAlterado && (
                            <span className="text-sm text-slate-600">
                              Campo: <strong>{item.campoAlterado}</strong>
                            </span>
                          )}
                        </div>
                        {item.campoAlterado && item.valorAnterior !== null && item.valorNovo !== null && (
                          <div className="text-sm text-slate-600 mb-2">
                            <span className="line-through text-red-500 mr-2">{item.valorAnterior}</span>
                            <span className="text-green-600">→ {item.valorNovo}</span>
                          </div>
                        )}
                        {item.observacoes && (
                          <p className="text-sm text-slate-600 mb-2">{item.observacoes}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <User className="h-3 w-3" />
                          <span>{item.usuarioNome}</span>
                          <span className="mx-1">•</span>
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(item.dataAcao)} {new Date(item.dataAcao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

