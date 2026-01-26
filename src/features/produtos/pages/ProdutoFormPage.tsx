import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Produto, ProdutoRequest } from '@/types'
import { produtoService } from '@/services/produtoService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Save,
  Package,
  AlertCircle,
  DollarSign,
  Tag,
  Warehouse,
} from 'lucide-react'
import { motion } from 'framer-motion'

export function ProdutoFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [loadingProduto, setLoadingProduto] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<ProdutoRequest>({
    descricao: '',
    unidade: '',
    precoUnitario: 0,
    categoria: '',
    quantidadeInicial: undefined,
    estoqueMinimo: undefined,
  })

  useEffect(() => {
    if (id) {
      carregarProduto(id)
    }
  }, [id])

  const carregarProduto = async (produtoId: string) => {
    try {
      setLoadingProduto(true)
      const produto = await produtoService.buscarPorId(produtoId)
      setFormData({
        descricao: produto.descricao,
        unidade: produto.unidade,
        precoUnitario: produto.precoUnitario,
        categoria: produto.categoria,
      })
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar produto')
    } finally {
      setLoadingProduto(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.descricao.trim()) {
      setError('Descrição é obrigatória')
      return
    }

    if (!formData.unidade.trim()) {
      setError('Unidade é obrigatória')
      return
    }

    if (!formData.categoria.trim()) {
      setError('Categoria é obrigatória')
      return
    }

    if (formData.precoUnitario <= 0) {
      setError('Preço unitário deve ser maior que zero')
      return
    }

    try {
      setLoading(true)
      if (isEditing && id) {
        await produtoService.atualizar(id, formData)
      } else {
        await produtoService.criar(formData)
      }
      navigate('/produtos')
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar produto')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  if (loadingProduto) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Carregando produto...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/produtos')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isEditing ? 'Editar Produto' : 'Novo Produto'}
          </h1>
          <p className="text-slate-600 mt-1">
            {isEditing ? 'Altere os dados do produto' : 'Preencha os dados para criar um novo produto'}
          </p>
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
        {/* Dados do Produto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Dados do Produto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Ex: Óleo Diesel, Filtro de Ar, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  placeholder="Ex: Lubrificantes, Filtros, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidade">Unidade *</Label>
                <Input
                  id="unidade"
                  value={formData.unidade}
                  onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                  placeholder="Ex: L, UN, KG, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="precoUnitario">Preço Unitário *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="precoUnitario"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.precoUnitario || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        precoUnitario: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="pl-10"
                    placeholder="0.00"
                    required
                  />
                </div>
                {formData.precoUnitario > 0 && (
                  <p className="text-xs text-slate-500">
                    {formatCurrency(formData.precoUnitario)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estoque Inicial (apenas na criação) */}
        {!isEditing && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="h-5 w-5" />
                Estoque Inicial (Opcional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Você pode definir um estoque inicial para este produto. Se não informar, o estoque será criado quando você fizer a primeira movimentação.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantidadeInicial">Quantidade Inicial</Label>
                  <Input
                    id="quantidadeInicial"
                    type="number"
                    min="0"
                    value={formData.quantidadeInicial !== undefined ? formData.quantidadeInicial : ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantidadeInicial: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="0"
                  />
                  <p className="text-xs text-slate-500">
                    Deixe em branco para criar estoque vazio
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
                  <Input
                    id="estoqueMinimo"
                    type="number"
                    min="0"
                    value={formData.estoqueMinimo !== undefined ? formData.estoqueMinimo : ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estoqueMinimo: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="0"
                  />
                  <p className="text-xs text-slate-500">
                    Quantidade mínima recomendada
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ações */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/produtos')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" className="gap-2" disabled={loading}>
            <Save className="h-4 w-4" />
            {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Produto'}
          </Button>
        </div>
      </form>
    </div>
  )
}

