import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Conta, StatusConta, TipoConta, ContaAuditoria, CategoriaFinanceira } from '@/types'
import { contaService } from '@/services/contaService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  DollarSign,
  Edit,
  Trash2,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  CreditCard,
  Tag,
  History,
  Clock,
} from 'lucide-react'
import { motion } from 'framer-motion'

export function ContaDetalhesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [conta, setConta] = useState<Conta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [historico, setHistorico] = useState<ContaAuditoria[]>([])
  const [loadingHistorico, setLoadingHistorico] = useState(false)

  useEffect(() => {
    if (id) {
      carregarConta(id)
      carregarHistorico(id)
    }
  }, [id])

  const carregarConta = async (contaId: string) => {
    try {
      setLoading(true)
      const data = await contaService.buscarPorId(contaId)
      setConta(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar detalhes da conta')
    } finally {
      setLoading(false)
    }
  }

  const carregarHistorico = async (contaId: string) => {
    try {
      setLoadingHistorico(true)
      const data = await contaService.buscarHistorico(contaId)
      setHistorico(data)
    } catch (err: any) {
      console.error('Erro ao carregar histórico:', err)
    } finally {
      setLoadingHistorico(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const formatCategoriaFinanceira = (categoria?: CategoriaFinanceira) => {
    if (!categoria) return null
    const labels: Record<CategoriaFinanceira, string> = {
      [CategoriaFinanceira.OPERACIONAL]: 'Operacional',
      [CategoriaFinanceira.INVESTIMENTO]: 'Investimento',
      [CategoriaFinanceira.FINANCIAMENTO]: 'Financiamento',
    }
    return labels[categoria]
  }

  const formatSubcategoria = (subcategoria?: string) => {
    if (!subcategoria) return null
    // Formatar subcategoria removendo underscores e capitalizando
    return subcategoria
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const handleDelete = async () => {
    if (id && window.confirm('Tem certeza que deseja excluir esta conta?')) {
      try {
        await contaService.deletar(id)
        navigate('/contas')
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir conta')
      }
    }
  }

  const handleMarcarComoPaga = async () => {
    if (!id || !conta) return

    const dataPagamento = prompt('Data de pagamento (YYYY-MM-DD):', new Date().toISOString().split('T')[0])
    if (!dataPagamento) return

    try {
      await contaService.marcarComoPaga(id, dataPagamento)
      await carregarConta(id)
      await carregarHistorico(id)
    } catch (err: any) {
      alert(err.message || 'Erro ao marcar conta como paga')
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500">Carregando detalhes da conta...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!conta) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500">Conta não encontrada.</p>
      </div>
    )
  }

  const isVencida =
    conta.status !== StatusConta.PAGO &&
    new Date(conta.dataVencimento) < new Date() &&
    !conta.dataPagamento

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/contas')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Detalhes da Conta</h1>
        <div className="flex gap-2">
          {conta.status === StatusConta.PENDENTE && (
            <Button onClick={handleMarcarComoPaga} variant="outline" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Marcar como Pago
            </Button>
          )}
          <Button onClick={() => navigate(`/contas/${conta.id}/editar`)} className="gap-2">
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          <Button variant="destructive" onClick={handleDelete} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={isVencida ? 'border-red-200 bg-red-50/30' : ''}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    conta.tipo === TipoConta.PAGAR ? 'bg-red-100' : 'bg-green-100'
                  }`}
                >
                  <DollarSign
                    className={`h-6 w-6 ${
                      conta.tipo === TipoConta.PAGAR ? 'text-red-600' : 'text-green-600'
                    }`}
                  />
                </div>
                <div>
                  <CardTitle className="text-2xl">{conta.descricao}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        conta.tipo === TipoConta.PAGAR
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {conta.tipo === TipoConta.PAGAR ? 'A Pagar' : 'A Receber'}
                    </span>
                    {conta.status === StatusConta.PAGO ? (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Pago
                      </span>
                    ) : conta.status === StatusConta.VENCIDO || isVencida ? (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                        <AlertCircle className="h-3 w-3" />
                        Vencido
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                        <AlertCircle className="h-3 w-3" />
                        Pendente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Valor
                  </p>
                  <p className="font-semibold text-xl">{formatCurrency(conta.valor)}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data de Vencimento
                  </p>
                  <p className={`font-semibold ${isVencida ? 'text-red-600' : ''}`}>
                    {formatDate(conta.dataVencimento)}
                  </p>
                </div>

                {conta.dataPagamento && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Data de Pagamento
                    </p>
                    <p className="font-semibold text-green-600">{formatDate(conta.dataPagamento)}</p>
                  </div>
                )}

                {conta.formaPagamento && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Forma de Pagamento
                    </p>
                    <p className="font-semibold">{conta.formaPagamento}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {conta.categoria && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Categoria
                    </p>
                    <p className="font-semibold">{conta.categoria}</p>
                  </div>
                )}

                {conta.categoriaFinanceira && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Categoria Financeira
                    </p>
                    <p className="font-semibold">
                      {formatCategoriaFinanceira(conta.categoriaFinanceira)}
                    </p>
                  </div>
                )}

                {conta.subcategoria && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Subcategoria
                    </p>
                    <p className="font-semibold">{formatSubcategoria(conta.subcategoria)}</p>
                  </div>
                )}

                {conta.cliente && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Cliente
                    </p>
                    <p className="font-semibold">{conta.cliente.nome}</p>
                    <p className="text-sm text-slate-600">{conta.cliente.email}</p>
                  </div>
                )}

                {conta.observacoes && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Observações
                    </p>
                    <p className="font-semibold whitespace-pre-wrap">{conta.observacoes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 space-y-2 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Criado em</span>
                <span className="font-medium">{formatDate(conta.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Última atualização</span>
                <span className="font-medium">{formatDate(conta.updatedAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Histórico de Auditoria */}
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
                                : item.acao === 'PAGAR'
                                ? 'bg-blue-100 text-blue-700'
                                : item.acao === 'DELETAR'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {item.acao === 'CRIAR'
                              ? 'Criada'
                              : item.acao === 'ATUALIZAR'
                              ? 'Atualizada'
                              : item.acao === 'PAGAR'
                              ? 'Paga'
                              : item.acao === 'DELETAR'
                              ? 'Deletada'
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
                          <span>{item.usuario.nome}</span>
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

