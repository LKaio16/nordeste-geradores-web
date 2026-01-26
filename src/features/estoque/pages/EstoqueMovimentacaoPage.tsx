import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Estoque, EstoqueMovimentacaoRequest, TipoMovimentacao, Produto } from '@/types'
import { estoqueService } from '@/services/estoqueService'
import { produtoService } from '@/services/produtoService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Save,
  Package,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'

export function EstoqueMovimentacaoPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const estoqueIdParam = searchParams.get('estoqueId')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [estoques, setEstoques] = useState<Estoque[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loadingEstoques, setLoadingEstoques] = useState(true)
  const [selectedProdutoId, setSelectedProdutoId] = useState<string>('')

  const [formData, setFormData] = useState<EstoqueMovimentacaoRequest>({
    estoqueId: estoqueIdParam || '',
    produtoId: '',
    tipo: TipoMovimentacao.ENTRADA,
    quantidade: 1,
    observacao: '',
  })

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    if (estoqueIdParam && estoques.length > 0) {
      const estoque = estoques.find((e) => e.id === estoqueIdParam)
      if (estoque) {
        setSelectedProdutoId(estoque.produto.id)
        setFormData((prev) => ({ ...prev, estoqueId: estoqueIdParam, produtoId: '' }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estoqueIdParam, estoques])

  const carregarDados = async () => {
    try {
      setLoadingEstoques(true)
      const [estoquesData, produtosData] = await Promise.all([
        estoqueService.listar(),
        produtoService.listar(),
      ])
      setEstoques(estoquesData)
      setProdutos(produtosData)
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoadingEstoques(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.estoqueId && !formData.produtoId) {
      setError('Selecione um produto')
      return
    }

    if (formData.quantidade <= 0) {
      setError('Quantidade deve ser maior que zero')
      return
    }

    try {
      setLoading(true)
      const response = await estoqueService.registrarMovimentacao(formData)
      
      // Navegar para detalhes do estoque criado/atualizado
      if (response.estoqueId) {
        navigate(`/estoque/${response.estoqueId}`)
      } else {
        navigate('/estoque')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar movimentação')
    } finally {
      setLoading(false)
    }
  }

  const handleProdutoChange = (produtoId: string) => {
    setSelectedProdutoId(produtoId)
    // Verificar se já existe estoque para este produto
    const estoqueExistente = estoques.find((e) => e.produto.id === produtoId)
    if (estoqueExistente) {
      setFormData({ ...formData, estoqueId: estoqueExistente.id, produtoId: '' })
    } else {
      setFormData({ ...formData, estoqueId: '', produtoId: produtoId })
    }
  }

  const selectedEstoque = estoques.find((e) => e.id === formData.estoqueId)
  const selectedProduto = produtos.find((p) => p.id === selectedProdutoId || p.id === formData.produtoId)
  const produtoParaExibir = selectedEstoque?.produto || selectedProduto

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/estoque')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Nova Movimentação de Estoque</h1>
          <p className="text-slate-600 mt-1">Registre uma entrada ou saída de produtos no estoque</p>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Dados da Movimentação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tipo de Movimentação */}
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Movimentação *</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipo"
                    value={TipoMovimentacao.ENTRADA}
                    checked={formData.tipo === TipoMovimentacao.ENTRADA}
                    onChange={(e) =>
                      setFormData({ ...formData, tipo: e.target.value as TipoMovimentacao })
                    }
                    className="w-4 h-4"
                  />
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span>Entrada</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipo"
                    value={TipoMovimentacao.SAIDA}
                    checked={formData.tipo === TipoMovimentacao.SAIDA}
                    onChange={(e) =>
                      setFormData({ ...formData, tipo: e.target.value as TipoMovimentacao })
                    }
                    className="w-4 h-4"
                  />
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span>Saída</span>
                </label>
              </div>
            </div>

            {/* Produto */}
            <div className="space-y-2">
              <Label htmlFor="produtoId">Produto *</Label>
              <select
                id="produtoId"
                value={selectedProdutoId || formData.produtoId || formData.estoqueId || ''}
                onChange={(e) => handleProdutoChange(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                required
                disabled={loadingEstoques}
              >
                <option value="">Selecione um produto</option>
                {produtos.map((produto) => {
                  const estoqueExistente = estoques.find((e) => e.produto.id === produto.id)
                  return (
                    <option key={produto.id} value={produto.id}>
                      {produto.descricao} - {produto.categoria}
                      {estoqueExistente
                        ? ` (Estoque: ${estoqueExistente.quantidade} ${produto.unidade})`
                        : ' (Sem estoque cadastrado)'}
                    </option>
                  )
                })}
              </select>
              {selectedEstoque && (
                <p className="text-sm text-slate-500">
                  Estoque atual: <strong>{selectedEstoque.quantidade}</strong> {selectedEstoque.produto.unidade}
                  {formData.tipo === TipoMovimentacao.SAIDA && formData.quantidade > selectedEstoque.quantidade && (
                    <span className="ml-2 text-red-600">
                      (Atenção: Quantidade insuficiente!)
                    </span>
                  )}
                </p>
              )}
              {!selectedEstoque && selectedProduto && (
                <p className="text-sm text-blue-600">
                  <strong>Produto sem estoque cadastrado.</strong> O estoque será criado automaticamente ao registrar a movimentação de entrada.
                </p>
              )}
              {!selectedEstoque && selectedProduto && formData.tipo === TipoMovimentacao.SAIDA && (
                <p className="text-sm text-red-600">
                  Não é possível fazer saída de produto sem estoque. Selecione uma entrada primeiro.
                </p>
              )}
            </div>

            {/* Quantidade */}
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                value={formData.quantidade}
                onChange={(e) =>
                  setFormData({ ...formData, quantidade: parseInt(e.target.value) || 0 })
                }
                required
              />
              {produtoParaExibir && (
                <p className="text-xs text-slate-500">
                  Unidade: {produtoParaExibir.unidade}
                </p>
              )}
            </div>

            {/* Observação */}
            <div className="space-y-2">
              <Label htmlFor="observacao">Observação</Label>
              <textarea
                id="observacao"
                value={formData.observacao || ''}
                onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                className="w-full min-h-[100px] px-3 py-2 rounded-md border border-slate-200"
                placeholder="Observações sobre a movimentação (opcional)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Resumo */}
        {produtoParaExibir && (
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Produto:</span>
                  <span className="font-medium">{produtoParaExibir.descricao}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Quantidade Atual:</span>
                  <span className="font-medium">
                    {selectedEstoque ? selectedEstoque.quantidade : 0} {produtoParaExibir.unidade}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    {formData.tipo === TipoMovimentacao.ENTRADA ? 'Quantidade a Adicionar:' : 'Quantidade a Remover:'}
                  </span>
                  <span className={`font-medium ${formData.tipo === TipoMovimentacao.ENTRADA ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.tipo === TipoMovimentacao.ENTRADA ? '+' : '-'}{formData.quantidade} {produtoParaExibir.unidade}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-semibold">
                  <span>Nova Quantidade:</span>
                  <span className={formData.tipo === TipoMovimentacao.ENTRADA ? 'text-green-600' : 'text-red-600'}>
                    {formData.tipo === TipoMovimentacao.ENTRADA
                      ? (selectedEstoque?.quantidade || 0) + formData.quantidade
                      : (selectedEstoque?.quantidade || 0) - formData.quantidade}{' '}
                    {produtoParaExibir.unidade}
                  </span>
                </div>
                {!selectedEstoque && formData.tipo === TipoMovimentacao.ENTRADA && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs">
                    O estoque será criado automaticamente para este produto.
                  </div>
                )}
                {formData.tipo === TipoMovimentacao.SAIDA &&
                  selectedEstoque &&
                  selectedEstoque.quantidade - formData.quantidade < 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                      Atenção: Esta operação resultará em estoque negativo!
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ações */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/estoque')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="gap-2"
            disabled={
              loading ||
              (!formData.estoqueId && !formData.produtoId) ||
              (!selectedEstoque && selectedProduto && formData.tipo === TipoMovimentacao.SAIDA)
            }
          >
            <Save className="h-4 w-4" />
            {loading ? 'Registrando...' : 'Registrar Movimentação'}
          </Button>
        </div>
      </form>
    </div>
  )
}

