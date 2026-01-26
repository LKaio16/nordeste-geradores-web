import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Estoque, EstoqueMovimentacao } from '@/types'
import { estoqueService } from '@/services/estoqueService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Package,
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  AlertTriangle,
} from 'lucide-react'
import { motion } from 'framer-motion'

export function EstoqueDetalhesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [estoque, setEstoque] = useState<Estoque | null>(null)
  const [movimentacoes, setMovimentacoes] = useState<EstoqueMovimentacao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      carregarDados(id)
    }
  }, [id])

  const carregarDados = async (estoqueId: string) => {
    try {
      setLoading(true)
      const [estoqueData, movimentacoesData] = await Promise.all([
        estoqueService.buscarPorId(estoqueId),
        estoqueService.listarMovimentacoes(estoqueId),
      ])
      setEstoque(estoqueData)
      setMovimentacoes(movimentacoesData)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do estoque')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (estoque: Estoque) => {
    if (estoque.quantidade === 0) return 'bg-red-100 text-red-700'
    if (estoque.quantidade <= estoque.estoqueMinimo) return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  const getStatusText = (estoque: Estoque) => {
    if (estoque.quantidade === 0) return 'Sem Estoque'
    if (estoque.quantidade <= estoque.estoqueMinimo) return 'Abaixo do Mínimo'
    return 'Em Estoque'
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
          <p className="text-slate-500">Carregando dados do estoque...</p>
        </div>
      </div>
    )
  }

  if (error || !estoque) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/estoque')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">{error || 'Item de estoque não encontrado'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/estoque')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">{estoque.produto.descricao}</h1>
          <p className="text-slate-600 mt-1">Detalhes do estoque e movimentações</p>
        </div>
        <Button onClick={() => navigate(`/estoque/movimentacao?estoqueId=${estoque.id}`)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Movimentação
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do Produto */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados do Estoque */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Informações do Estoque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Produto</p>
                  <p className="font-semibold">{estoque.produto.descricao}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Categoria</p>
                  <p className="font-semibold">{estoque.produto.categoria}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Unidade</p>
                  <p className="font-semibold">{estoque.produto.unidade}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Preço Unitário</p>
                  <p className="font-semibold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(estoque.produto.precoUnitario)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Movimentações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Histórico de Movimentações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {movimentacoes.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  Nenhuma movimentação registrada
                </div>
              ) : (
                <div className="space-y-3">
                  {movimentacoes.map((movimentacao, index) => (
                    <motion.div
                      key={movimentacao.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {movimentacao.tipo === 'ENTRADA' ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {movimentacao.tipo === 'ENTRADA' ? 'Entrada' : 'Saída'}
                            </span>
                            <span className="text-sm text-slate-500">•</span>
                            <span className="font-semibold">{movimentacao.quantidade} {estoque.produto.unidade}</span>
                          </div>
                          {movimentacao.observacao && (
                            <p className="text-sm text-slate-600 mt-1">{movimentacao.observacao}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <Calendar className="h-3 w-3" />
                            {formatDate(movimentacao.data)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumo */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Resumo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Quantidade Atual</span>
                  <span className="text-3xl font-bold text-slate-900">{estoque.quantidade}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Estoque Mínimo</span>
                  <span className="font-medium">{estoque.estoqueMinimo}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Status</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(estoque)}`}>
                    {getStatusText(estoque)}
                  </span>
                </div>
                {estoque.quantidade <= estoque.estoqueMinimo && estoque.quantidade > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div className="text-xs text-yellow-800">
                        <p className="font-medium">Atenção!</p>
                        <p>Estoque abaixo do mínimo recomendado.</p>
                      </div>
                    </div>
                  </div>
                )}
                {estoque.quantidade === 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div className="text-xs text-red-800">
                        <p className="font-medium">Crítico!</p>
                        <p>Produto sem estoque.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {estoque.dataUltimaEntrada && (
                <div className="pt-4 border-t border-slate-200 space-y-2 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Última Entrada</span>
                    <span className="font-medium">
                      {new Date(estoque.dataUltimaEntrada).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 space-y-2 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Total de Movimentações</span>
                  <span className="font-medium">{movimentacoes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Criado em</span>
                  <span className="font-medium">
                    {new Date(estoque.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Atualizado em</span>
                  <span className="font-medium">
                    {new Date(estoque.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

