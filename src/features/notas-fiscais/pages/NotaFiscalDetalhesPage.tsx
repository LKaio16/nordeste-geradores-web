import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { NotaFiscal } from '@/types'
import { notaFiscalService } from '@/services/notaFiscalService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  FileText,
  Receipt,
  Calendar,
  DollarSign,
  Package,
  Building2,
  Printer,
  Download,
} from 'lucide-react'
import { motion } from 'framer-motion'

export function NotaFiscalDetalhesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [nota, setNota] = useState<NotaFiscal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      carregarNota(id)
    }
  }, [id])

  const carregarNota = async (notaId: string) => {
    try {
      setLoading(true)
      const data = await notaFiscalService.buscarPorId(notaId)
      setNota(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar nota fiscal')
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Carregando nota fiscal...</p>
        </div>
      </div>
    )
  }

  if (error || !nota) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/notas-entrada')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">{error || 'Nota fiscal não encontrada'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/notas-entrada')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Nota Fiscal #{nota.numeroNota}</h1>
            <p className="text-slate-600 mt-1">Detalhes da nota fiscal</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados da Nota */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Informações da Nota Fiscal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Tipo</p>
                  <p className="font-semibold">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        nota.tipo === 'ENTRADA'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {nota.tipo === 'ENTRADA' ? 'Entrada' : 'Saída'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Número da Nota</p>
                  <p className="font-semibold">{nota.numeroNota}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Data de Emissão</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {formatDate(nota.dataEmissao)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Forma de Pagamento</p>
                  <p className="font-semibold">{nota.formaPagamento.replace('_', ' ')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fornecedor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Fornecedor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Nome</p>
                  <p className="font-semibold">{nota.fornecedor}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">CNPJ</p>
                  <p className="font-semibold">{formatCNPJ(nota.cnpjEmpresa)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Itens da Nota */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Itens da Nota Fiscal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Descrição</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Quantidade</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Valor Unit.</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Desconto</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nota.itens.map((item, index) => (
                      <motion.tr
                        key={item.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 px-4">{item.descricao}</td>
                        <td className="py-3 px-4 text-right">{item.quantidade}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(item.valorUnitario)}</td>
                        <td className="py-3 px-4 text-right text-slate-500">
                          {item.desconto ? formatCurrency(item.desconto) : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">
                          {formatCurrency(item.valorTotal)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal dos Itens</span>
                  <span className="font-medium">
                    {formatCurrency(
                      nota.itens.reduce((sum, item) => sum + item.valorUnitario * item.quantidade, 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Descontos</span>
                  <span className="font-medium text-red-600">
                    -{' '}
                    {formatCurrency(
                      nota.itens.reduce((sum, item) => sum + (item.desconto || 0), 0)
                    )}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(nota.valorTotal)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Quantidade de Itens</span>
                  <span className="font-medium">{nota.itens.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Criado em</span>
                  <span className="font-medium">
                    {new Date(nota.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Atualizado em</span>
                  <span className="font-medium">
                    {new Date(nota.updatedAt).toLocaleDateString('pt-BR')}
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

