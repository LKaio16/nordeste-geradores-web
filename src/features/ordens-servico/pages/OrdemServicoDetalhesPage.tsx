import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { OrdemServico, StatusOrdemServico } from '@/types'
import { ordemServicoService } from '@/services/ordemServicoService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Edit,
  ClipboardList,
  Calendar,
  User,
  Zap,
  CheckCircle2,
  Clock,
  FileText,
} from 'lucide-react'
import { motion } from 'framer-motion'

export function OrdemServicoDetalhesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [ordemServico, setOrdemServico] = useState<OrdemServico | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      carregarOrdemServico(id)
    }
  }, [id])

  const carregarOrdemServico = async (osId: string) => {
    try {
      setLoading(true)
      const data = await ordemServicoService.buscarPorId(osId)
      setOrdemServico(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar ordem de serviço')
    } finally {
      setLoading(false)
    }
  }

  const handleConcluir = async () => {
    if (!id || !ordemServico) return
    
    // Solicitar horímetro final apenas para MANUTENCAO e RECOLHIMENTO
    let horimetroFinal: number | undefined = undefined
    if (ordemServico.tipo === 'MANUTENCAO' || ordemServico.tipo === 'RECOLHIMENTO') {
      const horimetroInput = window.prompt('Informe o horímetro final (obrigatório):')
      if (!horimetroInput || horimetroInput.trim() === '') {
        alert('Horímetro final é obrigatório para este tipo de ordem de serviço')
        return
      }
      horimetroFinal = parseFloat(horimetroInput)
      if (isNaN(horimetroFinal)) {
        alert('Horímetro inválido')
        return
      }
    }
    
    try {
      await ordemServicoService.concluir(id, horimetroFinal)
      await carregarOrdemServico(id)
    } catch (err: any) {
      alert(err.message || 'Erro ao concluir ordem de serviço')
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

  const formatTipo = (tipo: string) => {
    const tipoMap: Record<string, string> = {
      ENTREGA: 'Entrega',
      RECOLHIMENTO: 'Recolhimento',
      MANUTENCAO: 'Manutenção',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Carregando ordem de serviço...</p>
        </div>
      </div>
    )
  }

  if (error || !ordemServico) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/ordens-servico')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">{error || 'Ordem de serviço não encontrada'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusInfo = formatStatus(ordemServico.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/ordens-servico')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{ordemServico.numero}</h1>
            <p className="text-slate-600 mt-1">Detalhes da ordem de serviço</p>
          </div>
        </div>
        <div className="flex gap-2">
          {ordemServico.status !== StatusOrdemServico.CONCLUIDA && ordemServico.status !== StatusOrdemServico.CANCELADA && (
            <Button onClick={handleConcluir} variant="outline" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Concluir OS
            </Button>
          )}
          <Button onClick={() => navigate(`/ordens-servico/${id}/editar`)} className="gap-2">
            <Edit className="h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      {/* Informações Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Informações da Ordem de Serviço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <span className="text-sm text-slate-500">Número</span>
                <p className="font-semibold text-slate-900">{ordemServico.numero}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Tipo</span>
                <p className="font-semibold text-slate-900">{formatTipo(ordemServico.tipo)}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Status</span>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm text-slate-500">Data Agendada</span>
                <p className="font-semibold text-slate-900">{formatDate(ordemServico.dataAgendada)}</p>
              </div>
              {ordemServico.dataExecucao && (
                <div>
                  <span className="text-sm text-slate-500">Data de Execução</span>
                  <p className="font-semibold text-slate-900">{formatDate(ordemServico.dataExecucao)}</p>
                </div>
              )}
              {ordemServico.tipo === 'ENTREGA' && ordemServico.horimetroInicial !== undefined && (
                <div>
                  <span className="text-sm text-slate-500">Horímetro Inicial</span>
                  <p className="font-semibold text-slate-900">{ordemServico.horimetroInicial.toLocaleString('pt-BR')}h</p>
                </div>
              )}
              {(ordemServico.tipo === 'MANUTENCAO' || ordemServico.tipo === 'RECOLHIMENTO') && ordemServico.horimetroFinal !== undefined && (
                <div>
                  <span className="text-sm text-slate-500">Horímetro Final</span>
                  <p className="font-semibold text-slate-900">{ordemServico.horimetroFinal.toLocaleString('pt-BR')}h</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {ordemServico.locacao && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Locação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-slate-500">Número</span>
                  <p className="font-semibold text-slate-900">{ordemServico.locacao.numero}</p>
                </div>
                {ordemServico.locacao.cliente && (
                  <div>
                    <span className="text-sm text-slate-500">Cliente</span>
                    <p className="font-semibold text-slate-900">{ordemServico.locacao.cliente.nome}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {ordemServico.gerador && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Gerador
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-slate-500">Código</span>
                  <p className="font-semibold text-slate-900">{ordemServico.gerador.codigo}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Modelo</span>
                  <p className="font-semibold text-slate-900">{ordemServico.gerador.modelo}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Marca</span>
                  <p className="font-semibold text-slate-900">{ordemServico.gerador.marca}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {ordemServico.tecnicoResponsavel && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Técnico Responsável
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-slate-500">Nome</span>
                  <p className="font-semibold text-slate-900">{ordemServico.tecnicoResponsavel.nome}</p>
                </div>
                {ordemServico.tecnicoResponsavel.email && (
                  <div>
                    <span className="text-sm text-slate-500">Email</span>
                    <p className="font-semibold text-slate-900">{ordemServico.tecnicoResponsavel.email}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {ordemServico.observacoes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Observações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 whitespace-pre-wrap">{ordemServico.observacoes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

