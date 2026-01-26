import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Produto } from '@/types'
import { produtoService } from '@/services/produtoService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Package,
  DollarSign,
  Tag,
  Calendar,
  Edit,
  ShoppingCart,
} from 'lucide-react'
import { motion } from 'framer-motion'

export function ProdutoDetalhesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [produto, setProduto] = useState<Produto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      carregarProduto(id)
    }
  }, [id])

  const carregarProduto = async (produtoId: string) => {
    try {
      setLoading(true)
      const data = await produtoService.buscarPorId(produtoId)
      setProduto(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar produto')
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Carregando produto...</p>
        </div>
      </div>
    )
  }

  if (error || !produto) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/produtos')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">{error || 'Produto não encontrado'}</p>
          </CardContent>
        </Card>
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">{produto.descricao}</h1>
          <p className="text-slate-600 mt-1">Detalhes do produto</p>
        </div>
        <Button onClick={() => navigate(`/produtos/${produto.id}/editar`)} className="gap-2">
          <Edit className="h-4 w-4" />
          Editar Produto
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do Produto */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados Principais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Informações do Produto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Descrição</p>
                  <p className="font-semibold">{produto.descricao}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Categoria</p>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-slate-400" />
                    <p className="font-semibold">{produto.categoria}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Unidade</p>
                  <p className="font-semibold">{produto.unidade}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Preço Unitário</p>
                  <p className="font-semibold text-emerald-600 text-xl">
                    {formatCurrency(produto.precoUnitario)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Resumo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Preço Unitário</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(produto.precoUnitario)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Unidade</span>
                  <span className="font-medium">{produto.unidade}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Categoria</span>
                  <span className="font-medium">{produto.categoria}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Criado em</span>
                  <span className="font-medium">
                    {new Date(produto.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Atualizado em</span>
                  <span className="font-medium">
                    {new Date(produto.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/produtos/${produto.id}/editar`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Produto
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

