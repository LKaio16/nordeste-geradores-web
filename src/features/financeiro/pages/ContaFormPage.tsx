import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Conta, ContaRequest, TipoConta, StatusConta, Cliente, FormaPagamento, CategoriaFinanceira } from '@/types'
import { contaService } from '@/services/contaService'
import { clienteService } from '@/services/clienteService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Save,
  DollarSign,
  AlertCircle,
  Calendar,
  User,
  FileText,
} from 'lucide-react'
import { motion } from 'framer-motion'

// Opções de subcategoria por categoria financeira
const SUBCATEGORIAS_OPERACIONAL = [
  { value: 'FORNECEDOR', label: 'Fornecedor' },
  { value: 'DESPESA_VARIAVEL', label: 'Despesa Variável' },
  { value: 'IMPOSTO', label: 'Imposto' },
  { value: 'DESPESA_ADMINISTRATIVA', label: 'Despesa Administrativa' },
  { value: 'PESSOAL', label: 'Pessoal' },
  { value: 'DESPESA_FINANCEIRA', label: 'Despesa Financeira' },
  { value: 'SERVICO_TERCEIRO', label: 'Serviço de Terceiros' },
  { value: 'MANUTENCAO', label: 'Manutenção' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'OUTROS', label: 'Outros' },
]

const SUBCATEGORIAS_INVESTIMENTO = [
  { value: 'APLICACAO_AUTOMATICA', label: 'Aplicação Automática' },
  { value: 'RESGATE_AUTOMATICO', label: 'Resgate Automático' },
  { value: 'BONUS_RENDIMENTO', label: 'Bônus e Rendimentos' },
  { value: 'AQUISICAO_ATIVO_IMOBILIZADO', label: 'Aquisição de Ativo Imobilizado' },
  { value: 'OBRAS_REFORMAS', label: 'Obras e Reformas' },
  { value: 'INVESTIMENTO', label: 'Outros Investimentos' },
]

const SUBCATEGORIAS_FINANCIAMENTO = [
  { value: 'EMPRESTIMO_RECEBIDO', label: 'Recebimento de Empréstimo' },
  { value: 'SEGURO_RECEBIDO', label: 'Recebimento de Seguro' },
  { value: 'OUTRAS_EMPRESAS', label: 'Recebimento de Outras Empresas' },
  { value: 'EMPRESTIMO_PAGO', label: 'Pagamento de Empréstimo' },
  { value: 'FINANCIAMENTO_PAGO', label: 'Pagamento de Financiamento' },
  { value: 'RETIRADA_NORDESTE_SERVICO', label: 'Retirada Nordeste Serviço' },
  { value: 'RETIRADA_RENTAL_CAR', label: 'Retirada Rental Car' },
  { value: 'RETIRADA_SOCIO_NSERVICOS', label: 'Retirada Sócios - N. Serviços' },
  { value: 'RETIRADA_SOCIO', label: 'Retirada de Sócios' },
  { value: 'RESSARCIMENTO_CLIENTE', label: 'Ressarcimento de Cliente' },
]

export function ContaFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [loadingConta, setLoadingConta] = useState(false)
  const [error, setError] = useState('')
  const [clientes, setClientes] = useState<Cliente[]>([])

  const [formData, setFormData] = useState<ContaRequest>({
    tipo: TipoConta.PAGAR,
    clienteId: undefined,
    descricao: '',
    valor: 0,
    dataVencimento: '',
    dataPagamento: undefined,
    formaPagamento: undefined,
    status: StatusConta.PENDENTE,
    observacoes: '',
    categoria: '',
    categoriaFinanceira: CategoriaFinanceira.OPERACIONAL, // Padrão: Operacional
    subcategoria: 'OUTROS', // Padrão: Outros (pode ser alterado)
  })

  useEffect(() => {
    carregarClientes()
    if (id) {
      carregarConta(id)
    }
  }, [id])

  // Opções de subcategoria baseadas na categoria financeira
  const opcoesSubcategoria = useMemo(() => {
    if (!formData.categoriaFinanceira) {
      return []
    }

    if (formData.categoriaFinanceira === CategoriaFinanceira.OPERACIONAL) {
      return SUBCATEGORIAS_OPERACIONAL
    }

    if (formData.categoriaFinanceira === CategoriaFinanceira.INVESTIMENTO) {
      return SUBCATEGORIAS_INVESTIMENTO
    }

    if (formData.categoriaFinanceira === CategoriaFinanceira.FINANCIAMENTO) {
      return SUBCATEGORIAS_FINANCIAMENTO
    }

    return []
  }, [formData.categoriaFinanceira])

  const carregarClientes = async () => {
    try {
      const data = await clienteService.listar()
      setClientes(data.filter((c) => c.status === 'ATIVO'))
    } catch (err: any) {
      console.error('Erro ao carregar clientes:', err)
    }
  }

  const carregarConta = async (contaId: string) => {
    try {
      setLoadingConta(true)
      const conta = await contaService.buscarPorId(contaId)
      setFormData({
        tipo: conta.tipo,
        clienteId: conta.clienteId || undefined,
        descricao: conta.descricao,
        valor: conta.valor,
        dataVencimento: conta.dataVencimento,
        dataPagamento: conta.dataPagamento || undefined,
        formaPagamento: conta.formaPagamento,
        status: conta.status,
        observacoes: conta.observacoes || '',
        categoria: conta.categoria || '',
        categoriaFinanceira: conta.categoriaFinanceira || CategoriaFinanceira.OPERACIONAL, // Padrão se não tiver
        subcategoria: conta.subcategoria || 'OUTROS', // Padrão se não tiver
      })
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar conta')
    } finally {
      setLoadingConta(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.descricao.trim()) {
      setError('Descrição é obrigatória')
      return
    }

    if (formData.valor <= 0) {
      setError('Valor deve ser maior que zero')
      return
    }

    if (!formData.dataVencimento) {
      setError('Data de vencimento é obrigatória')
      return
    }

    // Validar categoria financeira
    if (!formData.categoriaFinanceira) {
      setError('Categoria financeira é obrigatória')
      return
    }

    // Validar subcategoria quando necessário
    if (!formData.subcategoria) {
      setError('Subcategoria é obrigatória')
      return
    }

    try {
      setLoading(true)
      const dataToSubmit: ContaRequest = {
        ...formData,
        clienteId: formData.clienteId || undefined,
        dataPagamento: formData.dataPagamento || undefined,
        formaPagamento: formData.formaPagamento || undefined,
        categoriaFinanceira: formData.categoriaFinanceira || CategoriaFinanceira.OPERACIONAL, // Garantir que sempre tenha valor
        subcategoria: formData.subcategoria, // Sempre enviar subcategoria
      }

      if (isEditing && id) {
        await contaService.atualizar(id, dataToSubmit)
      } else {
        await contaService.criar(dataToSubmit)
      }
      navigate('/contas')
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar conta')
    } finally {
      setLoading(false)
    }
  }

  if (loadingConta) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Carregando conta...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/contas')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isEditing ? 'Editar Conta' : 'Nova Conta'}
          </h1>
          <p className="text-slate-600 mt-1">
            {isEditing ? 'Altere os dados da conta' : 'Preencha os dados para criar uma nova conta'}
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
        {/* Dados da Conta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Dados da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoConta })}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                  required
                >
                  <option value={TipoConta.PAGAR}>A Pagar</option>
                  <option value={TipoConta.RECEBER}>A Receber</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusConta })}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                  required
                >
                  <option value={StatusConta.PENDENTE}>Pendente</option>
                  <option value={StatusConta.PAGO}>Pago</option>
                  <option value={StatusConta.VENCIDO}>Vencido</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  required
                  placeholder="Descrição da conta"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clienteId">Cliente (Opcional)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <select
                    id="clienteId"
                    value={formData.clienteId || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, clienteId: e.target.value || undefined })
                    }
                    className="w-full h-10 px-10 rounded-md border border-slate-200 bg-white"
                  >
                    <option value="">Nenhum</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">Valor *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor}
                    onChange={(e) =>
                      setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })
                    }
                    required
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataVencimento">Data de Vencimento *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="dataVencimento"
                    type="date"
                    value={formData.dataVencimento}
                    onChange={(e) => setFormData({ ...formData, dataVencimento: e.target.value })}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              {formData.status === StatusConta.PAGO && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="dataPagamento">Data de Pagamento</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="dataPagamento"
                        type="date"
                        value={formData.dataPagamento || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dataPagamento: e.target.value || undefined,
                          })
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                    <select
                      id="formaPagamento"
                      value={formData.formaPagamento || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          formaPagamento: e.target.value as FormaPagamento | undefined,
                        })
                      }
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                    >
                      <option value="">Selecione</option>
                      <option value={FormaPagamento.BOLETO}>Boleto</option>
                      <option value={FormaPagamento.TRANSFERENCIA}>Transferência</option>
                      <option value={FormaPagamento.PIX}>PIX</option>
                      <option value={FormaPagamento.CARTAO}>Cartão</option>
                    </select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="categoriaFinanceira">Categoria Financeira *</Label>
                <select
                  id="categoriaFinanceira"
                  value={formData.categoriaFinanceira || CategoriaFinanceira.OPERACIONAL}
                  onChange={(e) => {
                    const novaCategoria = (e.target.value as CategoriaFinanceira) || CategoriaFinanceira.OPERACIONAL
                    // Resetar subcategoria ao mudar categoria
                    let novaSubcategoria: string | undefined = undefined
                    if (novaCategoria === CategoriaFinanceira.OPERACIONAL) {
                      novaSubcategoria = 'OUTROS'
                    } else if (novaCategoria === CategoriaFinanceira.INVESTIMENTO) {
                      novaSubcategoria = undefined // Usuário deve escolher
                    } else if (novaCategoria === CategoriaFinanceira.FINANCIAMENTO) {
                      novaSubcategoria = undefined // Usuário deve escolher
                    }
                    setFormData({
                      ...formData,
                      categoriaFinanceira: novaCategoria,
                      subcategoria: novaSubcategoria,
                    })
                  }}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                  required
                >
                  <option value={CategoriaFinanceira.OPERACIONAL}>Operacional</option>
                  <option value={CategoriaFinanceira.INVESTIMENTO}>Investimento</option>
                  <option value={CategoriaFinanceira.FINANCIAMENTO}>Financiamento</option>
                </select>
                <p className="text-xs text-slate-500">
                  {formData.categoriaFinanceira === CategoriaFinanceira.OPERACIONAL
                    ? 'Para receitas e despesas operacionais do dia a dia'
                    : formData.categoriaFinanceira === CategoriaFinanceira.INVESTIMENTO
                    ? 'Para aplicações, resgates e aquisições de ativos'
                    : 'Para empréstimos, financiamentos e retiradas'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  value={formData.categoria || ''}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  placeholder="Ex: Fornecedor, Imposto, Pessoal"
                />
              </div>

              {formData.categoriaFinanceira && opcoesSubcategoria.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="subcategoria">Subcategoria *</Label>
                  <select
                    id="subcategoria"
                    value={formData.subcategoria || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subcategoria: e.target.value || undefined,
                      })
                    }
                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                    required
                  >
                    <option value="">Selecione uma subcategoria</option>
                    {opcoesSubcategoria.map((opcao) => (
                      <option key={opcao.value} value={opcao.value}>
                        {opcao.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <textarea
                    id="observacoes"
                    value={formData.observacoes || ''}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    className="w-full h-24 px-10 py-2 rounded-md border border-slate-200 bg-white resize-none"
                    placeholder="Observações sobre a conta"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/contas')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" className="gap-2" disabled={loading}>
            <Save className="h-4 w-4" />
            {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Conta'}
          </Button>
        </div>
      </form>
    </div>
  )
}

