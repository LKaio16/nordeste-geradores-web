import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Proposta, TipoProposta, StatusProposta, CategoriaPropostaItem } from '@/types'
import { propostaService } from '@/services/propostaService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Edit,
  FileText,
  Calendar,
  User,
  DollarSign,
  FileDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Landmark,
} from 'lucide-react'
import { motion } from 'framer-motion'

export function PropostaDetalhesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [proposta, setProposta] = useState<Proposta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      carregarProposta(id)
    }
  }, [id])

  const carregarProposta = async (propostaId: string) => {
    try {
      setLoading(true)
      const data = await propostaService.buscarPorId(propostaId)
      setProposta(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar proposta')
    } finally {
      setLoading(false)
    }
  }

  const handleGerarPdf = async () => {
    if (!id) return
    try {
      const blob = await propostaService.gerarPdf(id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `proposta-${proposta?.numero || id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      alert(err.message || 'Erro ao gerar PDF')
    }
  }

  const formatStatus = (status: StatusProposta) => {
    const statusMap: Record<StatusProposta, { label: string; color: string; icon: any }> = {
      [StatusProposta.RASCUNHO]: { label: 'Rascunho', color: 'bg-gray-100 text-gray-800', icon: FileText },
      [StatusProposta.ENVIADA]: { label: 'Enviada', color: 'bg-blue-100 text-blue-800', icon: Clock },
      [StatusProposta.APROVADA]: { label: 'Aprovada', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      [StatusProposta.RECUSADA]: { label: 'Recusada', color: 'bg-red-100 text-red-800', icon: XCircle },
    }
    return statusMap[status] || { label: status, color: 'bg-slate-100 text-slate-800', icon: AlertCircle }
  }

  const formatTipo = (tipo: TipoProposta) => {
    const tipoMap: Record<TipoProposta, string> = {
      [TipoProposta.MENSAL]: 'Mensal',
      [TipoProposta.EVENTO]: 'Evento',
    }
    return tipoMap[tipo] || tipo
  }

  const formatCategoria = (categoria: CategoriaPropostaItem) => {
    const categoriaMap: Record<CategoriaPropostaItem, string> = {
      [CategoriaPropostaItem.GERADOR]: 'Gerador',
      [CategoriaPropostaItem.CABOS]: 'Cabos',
      [CategoriaPropostaItem.FRETE]: 'Frete',
      [CategoriaPropostaItem.SERVICO]: 'Serviço',
    }
    return categoriaMap[categoria] || categoria
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#203d7b] mx-auto mb-4"></div>
          <p className="text-slate-500">Carregando proposta...</p>
        </div>
      </div>
    )
  }

  if (error || !proposta) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/propostas')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">{error || 'Proposta não encontrada'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusInfo = formatStatus(proposta.status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/propostas')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{proposta.numero}</h1>
            <p className="text-slate-600 mt-1">Detalhes da proposta</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleGerarPdf} variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Gerar PDF
          </Button>
          <Button onClick={() => navigate(`/propostas/${id}/editar`)} className="gap-2">
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
              <div className="p-2 bg-[#203d7b]/10 rounded-lg">
                <FileText className="h-5 w-5 text-[#203d7b]" />
              </div>
              Informações da Proposta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Número</span>
                <p className="font-bold text-lg text-slate-900 mt-1">{proposta.numero}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tipo</span>
                  <p className="font-semibold text-slate-900 mt-1">{formatTipo(proposta.tipo)}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</span>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color} gap-1`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Data de Emissão</span>
                  <p className="font-semibold text-slate-900 mt-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(proposta.dataEmissao)}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Validade</span>
                  <p className="font-semibold text-slate-900 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(proposta.validade)}
                  </p>
                </div>
              </div>
              {proposta.formaPagamento && (
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Forma de Pagamento</span>
                  <p className="font-semibold text-slate-900 mt-1">{proposta.formaPagamento}</p>
                </div>
              )}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Valor Total</span>
                <p className="font-bold text-xl text-slate-900 mt-1 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  R$ {proposta.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
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
            {proposta.cliente ? (
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Nome</span>
                  <p className="font-semibold text-slate-900 mt-1">{proposta.cliente.nome}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">CNPJ</span>
                  <p className="font-semibold text-slate-900 mt-1">{proposta.cliente.cnpj}</p>
                </div>
                {proposta.cliente.email && (
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</span>
                    <p className="font-semibold text-slate-900 mt-1">{proposta.cliente.email}</p>
                  </div>
                )}
                {proposta.cliente.telefone && (
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Telefone</span>
                    <p className="font-semibold text-slate-900 mt-1">{proposta.cliente.telefone}</p>
                  </div>
                )}
                {proposta.cliente.endereco && (
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Endereço</span>
                    <p className="font-semibold text-slate-900 mt-1">
                      {proposta.cliente.endereco}, {proposta.cliente.cidade} - {proposta.cliente.estado}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400 italic text-center py-4">Cliente não informado</p>
            )}
          </CardContent>
        </Card>

        {proposta.observacoes && (
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
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{proposta.observacoes}</p>
            </CardContent>
          </Card>
        )}

        {proposta.dadosBancarios && (
          <Card className="shadow-sm md:col-span-2">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Landmark className="h-5 w-5 text-slate-600" />
                </div>
                Dados bancários
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{proposta.dadosBancarios}</p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Itens */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              Itens da Proposta
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Categoria</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Descrição</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Quantidade</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Valor Unitário</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Valor Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {proposta.itens.map((item) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{formatCategoria(item.categoria)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-slate-900">{item.descricao}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-slate-600">{item.quantidade}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-slate-600">
                          R$ {item.valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="text-sm font-semibold text-slate-900">
                          R$ {item.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  <tr className="bg-slate-50 font-semibold">
                    <td colSpan={4} className="px-4 py-3 text-right text-sm text-slate-700">
                      Total:
                    </td>
                    <td className="px-4 py-3 text-right text-lg text-[#203d7b]">
                      R$ {proposta.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}





