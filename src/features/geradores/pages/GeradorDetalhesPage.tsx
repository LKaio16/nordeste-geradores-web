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
} from 'lucide-react'
import { motion } from 'framer-motion'

export function GeradorDetalhesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [gerador, setGerador] = useState<Gerador | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      carregarGerador(id)
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
    </div>
  )
}

