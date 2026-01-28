import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { NotaFiscal, NotaFiscalRequest, NotaFiscalItemRequest, TipoNotaFiscal, FormaPagamento, Fornecedor, Produto, ProdutoRequest } from '@/types'
import { notaFiscalService } from '@/services/notaFiscalService'
import { fornecedorService } from '@/services/fornecedorService'
import { produtoService } from '@/services/produtoService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Save,
  FileText,
  Receipt,
  PlusCircle,
  MinusCircle,
  AlertCircle,
  Building2,
  Search,
  Package,
  X,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { maskCNPJ, unmaskCPFCNPJ } from '@/utils/validators'

const emptyItem: NotaFiscalItemRequest = {
  produtoId: undefined,
  descricao: '',
  quantidade: 1,
  valorUnitario: 0,
  desconto: 0,
}

export function NotaFiscalFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [loadingNota, setLoadingNota] = useState(false)
  const [error, setError] = useState('')
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [loadingFornecedores, setLoadingFornecedores] = useState(true)
  const [selectedFornecedorId, setSelectedFornecedorId] = useState<string>('')
  const [fornecedorSearchTerm, setFornecedorSearchTerm] = useState('')
  const [showFornecedorDropdown, setShowFornecedorDropdown] = useState(false)

  // Estados para produtos
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loadingProdutos, setLoadingProdutos] = useState(true)
  const [produtoSearchTerms, setProdutoSearchTerms] = useState<{ [key: number]: string }>({})
  const [showProdutoDropdowns, setShowProdutoDropdowns] = useState<{ [key: number]: boolean }>({})
  
  // Estados para modal de cadastro rápido de produto
  const [showProdutoModal, setShowProdutoModal] = useState(false)
  const [produtoModalIndex, setProdutoModalIndex] = useState<number | null>(null)
  const [novoProduto, setNovoProduto] = useState<ProdutoRequest>({
    descricao: '',
    unidade: 'UN',
    precoUnitario: 0,
    categoria: '',
  })
  const [categorias, setCategorias] = useState<string[]>([])
  const [loadingProduto, setLoadingProduto] = useState(false)

  const [formData, setFormData] = useState<NotaFiscalRequest>({
    tipo: TipoNotaFiscal.ENTRADA,
    fornecedor: '',
    cnpjEmpresa: '',
    dataEmissao: new Date().toISOString().split('T')[0],
    numeroNota: '',
    formaPagamento: FormaPagamento.PIX,
    itens: [{ ...emptyItem }],
  })

  const gerarNumeroNotaSaida = (dataEmissaoIso: string) => {
    const datePart = (dataEmissaoIso || new Date().toISOString().split('T')[0]).replaceAll('-', '')
    // Ex: SAI-20260128-1735839123456
    const numero = `SAI-${datePart}-${Date.now()}`
    return numero.length > 50 ? numero.slice(0, 50) : numero
  }

  useEffect(() => {
    carregarFornecedores()
    carregarProdutos()
    if (id) {
      carregarNota(id)
    }
  }, [id])

  const carregarFornecedores = async () => {
    try {
      setLoadingFornecedores(true)
      const data = await fornecedorService.listar()
      setFornecedores(data.filter(f => f.status === 'ATIVO'))
    } catch (err: any) {
      console.error('Erro ao carregar fornecedores:', err)
    } finally {
      setLoadingFornecedores(false)
    }
  }

  const carregarProdutos = async () => {
    try {
      setLoadingProdutos(true)
      const [produtosData, categoriasData] = await Promise.all([
        produtoService.listar(),
        produtoService.listarCategorias(),
      ])
      setProdutos(produtosData)
      setCategorias(categoriasData)
    } catch (err: any) {
      console.error('Erro ao carregar produtos:', err)
    } finally {
      setLoadingProdutos(false)
    }
  }

  const carregarNota = async (notaId: string) => {
    try {
      setLoadingNota(true)
      const nota = await notaFiscalService.buscarPorId(notaId)
      setFormData({
        tipo: nota.tipo,
        fornecedor: nota.fornecedor,
        cnpjEmpresa: maskCNPJ(nota.cnpjEmpresa),
        dataEmissao: nota.dataEmissao,
        numeroNota: nota.numeroNota,
        formaPagamento: nota.formaPagamento,
        itens: nota.itens.map(item => ({
          produtoId: item.produtoId,
          descricao: item.descricao,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          desconto: item.desconto || 0,
        })),
      })
      // Tentar encontrar o fornecedor pelo nome
      const fornecedor = fornecedores.find(f => f.nome === nota.fornecedor)
      if (fornecedor) {
        setSelectedFornecedorId(fornecedor.id)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar nota fiscal')
    } finally {
      setLoadingNota(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.itens.length === 0) {
      setError('Adicione pelo menos um item à nota fiscal')
      return
    }

    if (formData.itens.some(item => !item.descricao || item.quantidade <= 0 || item.valorUnitario <= 0)) {
      setError('Preencha todos os campos obrigatórios dos itens')
      return
    }

    try {
      setLoading(true)
      
      // Garantir que produtoId está sendo enviado corretamente
      const itensComProdutoId = formData.itens.map(item => ({
        produtoId: item.produtoId || undefined,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario,
        desconto: item.desconto || 0,
      }))
      
      const dataToSubmit: NotaFiscalRequest = {
        ...formData,
        cnpjEmpresa: unmaskCPFCNPJ(formData.cnpjEmpresa),
        itens: itensComProdutoId,
      }
      
      // Debug: verificar se produtoId está sendo enviado
      console.log('📦 Dados da nota fiscal a serem enviados:', {
        tipo: dataToSubmit.tipo,
        numeroNota: dataToSubmit.numeroNota,
        itens: itensComProdutoId.map(item => ({
          produtoId: item.produtoId,
          descricao: item.descricao,
          quantidade: item.quantidade,
        })),
      })

      if (isEditing && id) {
        await notaFiscalService.atualizar(id, dataToSubmit)
      } else {
        await notaFiscalService.criar(dataToSubmit)
      }
      navigate('/notas-entrada')
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar nota fiscal')
    } finally {
      setLoading(false)
    }
  }

  const addItem = () => {
    setFormData({
      ...formData,
      itens: [...formData.itens, { ...emptyItem }],
    })
  }

  const removeItem = (index: number) => {
    if (formData.itens.length > 1) {
      setFormData({
        ...formData,
        itens: formData.itens.filter((_, i) => i !== index),
      })
    }
  }

  const updateItem = (index: number, field: keyof NotaFiscalItemRequest, value: any) => {
    const newItens = [...formData.itens]
    newItens[index] = { ...newItens[index], [field]: value }
    
    // Se o produto foi selecionado, atualizar descrição e valor unitário
    if (field === 'produtoId' && value) {
      const produto = produtos.find(p => p.id === value)
      if (produto) {
        newItens[index].descricao = produto.descricao
        newItens[index].valorUnitario = produto.precoUnitario
      }
    }
    
    setFormData({ ...formData, itens: newItens })
  }

  const handleSelectProduto = (index: number, produto: Produto) => {
    updateItem(index, 'produtoId', produto.id)
    setProdutoSearchTerms({ ...produtoSearchTerms, [index]: '' })
    setShowProdutoDropdowns({ ...showProdutoDropdowns, [index]: false })
  }

  const handleOpenProdutoModal = (index: number) => {
    const item = formData.itens[index]
    setNovoProduto({
      descricao: item.descricao || '',
      unidade: 'UN',
      precoUnitario: item.valorUnitario || 0,
      categoria: '',
    })
    setProdutoModalIndex(index)
    setShowProdutoModal(true)
  }

  const handleCriarProduto = async () => {
    if (!novoProduto.descricao || !novoProduto.categoria || novoProduto.precoUnitario <= 0) {
      setError('Preencha todos os campos obrigatórios do produto')
      return
    }

    try {
      setLoadingProduto(true)
      const produtoCriado = await produtoService.criar(novoProduto)
      
      // Atualizar lista de produtos
      await carregarProdutos()
      
      // Selecionar o produto recém-criado no item
      if (produtoModalIndex !== null) {
        handleSelectProduto(produtoModalIndex, produtoCriado)
      }
      
      setShowProdutoModal(false)
      setNovoProduto({
        descricao: '',
        unidade: 'UN',
        precoUnitario: 0,
        categoria: '',
      })
      setProdutoModalIndex(null)
    } catch (err: any) {
      setError(err.message || 'Erro ao criar produto')
    } finally {
      setLoadingProduto(false)
    }
  }

  const filteredProdutos = (index: number) => {
    const searchTerm = produtoSearchTerms[index] || ''
    return produtos.filter(p =>
      p.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const calcularTotal = () => {
    return formData.itens.reduce((total, item) => {
      const subtotal = item.quantidade * item.valorUnitario - (item.desconto || 0)
      return total + subtotal
    }, 0)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const handleSelectFornecedor = (fornecedor: Fornecedor) => {
    setSelectedFornecedorId(fornecedor.id)
    setFormData({
      ...formData,
      fornecedor: fornecedor.nome,
      cnpjEmpresa: maskCNPJ(fornecedor.cnpj),
      fornecedorId: fornecedor.id,
    })
    setFornecedorSearchTerm('')
    setShowFornecedorDropdown(false)
  }

  const filteredFornecedores = fornecedores.filter(f =>
    f.nome.toLowerCase().includes(fornecedorSearchTerm.toLowerCase()) ||
    f.cnpj.includes(fornecedorSearchTerm)
  )

  if (loadingNota) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Carregando nota fiscal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/notas-entrada')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isEditing ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'}
          </h1>
          <p className="text-slate-600 mt-1">
            {isEditing ? 'Altere os dados da nota fiscal' : 'Preencha os dados para criar uma nova nota'}
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
        {/* Dados da Nota */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dados da Nota Fiscal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => {
                    const novoTipo = e.target.value as TipoNotaFiscal
                    setFormData((prev) => {
                      // Se for SAÍDA e o número estiver vazio, gerar automaticamente
                      const precisaGerarNumero =
                        novoTipo === TipoNotaFiscal.SAIDA && (!prev.numeroNota || !prev.numeroNota.trim())
                      return {
                        ...prev,
                        tipo: novoTipo,
                        numeroNota: precisaGerarNumero ? gerarNumeroNotaSaida(prev.dataEmissao) : prev.numeroNota,
                      }
                    })
                  }}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                  required
                >
                  <option value={TipoNotaFiscal.ENTRADA}>Entrada</option>
                  <option value={TipoNotaFiscal.SAIDA}>Saída</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroNota">Número da Nota *</Label>
                <Input
                  id="numeroNota"
                  value={formData.numeroNota}
                  onChange={(e) => setFormData({ ...formData, numeroNota: e.target.value })}
                  placeholder="Ex: 12345"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataEmissao">Data de Emissão *</Label>
                <Input
                  id="dataEmissao"
                  type="date"
                  value={formData.dataEmissao}
                  onChange={(e) => setFormData({ ...formData, dataEmissao: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="formaPagamento">Forma de Pagamento *</Label>
                <select
                  id="formaPagamento"
                  value={formData.formaPagamento}
                  onChange={(e) => setFormData({ ...formData, formaPagamento: e.target.value as FormaPagamento })}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                  required
                >
                  <option value={FormaPagamento.PIX}>PIX</option>
                  <option value={FormaPagamento.DINHEIRO}>Dinheiro</option>
                  <option value={FormaPagamento.CARTAO_CREDITO}>Cartão de Crédito</option>
                  <option value={FormaPagamento.CARTAO_DEBITO}>Cartão de Débito</option>
                  <option value={FormaPagamento.BOLETO}>Boleto</option>
                  <option value={FormaPagamento.TRANSFERENCIA}>Transferência</option>
                  <option value={FormaPagamento.CHEQUE}>Cheque</option>
                </select>
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
          <CardContent className="space-y-4">
            {/* Seletor de Fornecedor */}
            <div className="space-y-2">
              <Label>Selecionar Fornecedor Cadastrado</Label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar fornecedor por nome ou CNPJ..."
                    value={fornecedorSearchTerm}
                    onChange={(e) => {
                      setFornecedorSearchTerm(e.target.value)
                      setShowFornecedorDropdown(true)
                    }}
                    onFocus={() => setShowFornecedorDropdown(true)}
                    className="pl-10"
                  />
                </div>
                {showFornecedorDropdown && fornecedorSearchTerm && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {loadingFornecedores ? (
                      <div className="p-3 text-center text-slate-500">Carregando...</div>
                    ) : filteredFornecedores.length === 0 ? (
                      <div className="p-3 text-center text-slate-500">Nenhum fornecedor encontrado</div>
                    ) : (
                      filteredFornecedores.map((fornecedor) => (
                        <button
                          key={fornecedor.id}
                          type="button"
                          onClick={() => handleSelectFornecedor(fornecedor)}
                          className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">{fornecedor.nome}</div>
                            <div className="text-sm text-slate-500">{fornecedor.cnpj}</div>
                          </div>
                          {selectedFornecedorId === fornecedor.id && (
                            <span className="text-blue-600 text-sm">Selecionado</span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Dados do Fornecedor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fornecedor">Nome do Fornecedor *</Label>
                <Input
                  id="fornecedor"
                  value={formData.fornecedor}
                  onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                  placeholder="Nome do fornecedor"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpjEmpresa">CNPJ *</Label>
                <Input
                  id="cnpjEmpresa"
                  value={formData.cnpjEmpresa}
                  onChange={(e) => {
                    const masked = maskCNPJ(e.target.value)
                    setFormData({ ...formData, cnpjEmpresa: masked })
                  }}
                  placeholder="00.000.000/0000-00"
                  required
                  maxLength={18}
                />
              </div>
            </div>

            {selectedFornecedorId && (
              <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                Fornecedor selecionado da base de dados. Os dados serão vinculados automaticamente.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Itens */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Itens da Nota
              </CardTitle>
              <Button type="button" variant="outline" onClick={addItem} className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Adicionar Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.itens.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-slate-200 rounded-lg space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Item {index + 1}</span>
                  {formData.itens.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Seleção de Produto */}
                  <div className="md:col-span-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Produto</Label>
                      <Dialog open={showProdutoModal && produtoModalIndex === index} onOpenChange={(open) => {
                        if (!open) {
                          setShowProdutoModal(false)
                          setProdutoModalIndex(null)
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenProdutoModal(index)}
                            className="gap-1 text-xs h-7"
                          >
                            <PlusCircle className="h-3 w-3" />
                            Novo Produto
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Buscar produto cadastrado..."
                        value={produtoSearchTerms[index] || ''}
                        onChange={(e) => {
                          setProdutoSearchTerms({ ...produtoSearchTerms, [index]: e.target.value })
                          setShowProdutoDropdowns({ ...showProdutoDropdowns, [index]: true })
                        }}
                        onFocus={() => setShowProdutoDropdowns({ ...showProdutoDropdowns, [index]: true })}
                        className="pl-10"
                      />
                      {showProdutoDropdowns[index] && (produtoSearchTerms[index] || '') && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
                          {loadingProdutos ? (
                            <div className="p-3 text-center text-slate-500">Carregando...</div>
                          ) : filteredProdutos(index).length === 0 ? (
                            <div className="p-3 text-center text-slate-500">
                              <p className="mb-2">Nenhum produto encontrado</p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenProdutoModal(index)}
                                className="gap-1"
                              >
                                <PlusCircle className="h-3 w-3" />
                                Cadastrar Produto
                              </Button>
                            </div>
                          ) : (
                            filteredProdutos(index).map((produto) => (
                              <button
                                key={produto.id}
                                type="button"
                                onClick={() => handleSelectProduto(index, produto)}
                                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center justify-between"
                              >
                                <div>
                                  <div className="font-medium">{produto.descricao}</div>
                                  <div className="text-sm text-slate-500">
                                    {produto.categoria} • {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.precoUnitario)}
                                  </div>
                                </div>
                                {item.produtoId === produto.id && (
                                  <span className="text-blue-600 text-sm">Selecionado</span>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                    <Input
                      value={item.descricao}
                      onChange={(e) => updateItem(index, 'descricao', e.target.value)}
                      placeholder="Descrição do item *"
                      required
                      className="mt-2"
                    />
                    {item.produtoId && (
                      <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        Produto vinculado ao cadastro
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label>Quantidade *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantidade}
                      onChange={(e) => updateItem(index, 'quantidade', parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label>Valor Unitário *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.valorUnitario}
                      onChange={(e) => updateItem(index, 'valorUnitario', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label>Desconto</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.desconto || 0}
                      onChange={(e) => updateItem(index, 'desconto', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="md:col-span-1 flex items-end justify-end">
                    <div className="text-right">
                      <span className="text-xs text-slate-500">Subtotal</span>
                      <div className="font-semibold text-slate-900">
                        {formatCurrency(item.quantidade * item.valorUnitario - (item.desconto || 0))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Total */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <div className="text-right">
                <span className="text-sm text-slate-500">Total da Nota</span>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(calcularTotal())}
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
            onClick={() => navigate('/notas-entrada')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" className="gap-2" disabled={loading}>
            <Save className="h-4 w-4" />
            {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Nota Fiscal'}
          </Button>
        </div>
      </form>

      {/* Modal de Cadastro Rápido de Produto */}
      <Dialog open={showProdutoModal} onOpenChange={setShowProdutoModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Cadastrar Novo Produto
            </DialogTitle>
            <DialogDescription>
              Preencha os dados básicos do produto para cadastrá-lo rapidamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="produtoDescricao">Descrição *</Label>
              <Input
                id="produtoDescricao"
                value={novoProduto.descricao}
                onChange={(e) => setNovoProduto({ ...novoProduto, descricao: e.target.value })}
                placeholder="Ex: Filtro de óleo"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="produtoUnidade">Unidade *</Label>
                <select
                  id="produtoUnidade"
                  value={novoProduto.unidade}
                  onChange={(e) => setNovoProduto({ ...novoProduto, unidade: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                  required
                >
                  <option value="UN">UN</option>
                  <option value="KG">KG</option>
                  <option value="L">L</option>
                  <option value="M">M</option>
                  <option value="CX">CX</option>
                  <option value="PC">PC</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="produtoPreco">Preço Unitário *</Label>
                <Input
                  id="produtoPreco"
                  type="number"
                  step="0.01"
                  min="0"
                  value={novoProduto.precoUnitario}
                  onChange={(e) => setNovoProduto({ ...novoProduto, precoUnitario: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="produtoCategoria">Categoria *</Label>
              <div className="relative">
                <Input
                  id="produtoCategoria"
                  list="categorias-list"
                  value={novoProduto.categoria}
                  onChange={(e) => setNovoProduto({ ...novoProduto, categoria: e.target.value })}
                  placeholder="Digite ou selecione uma categoria"
                  required
                />
                <datalist id="categorias-list">
                  {categorias.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowProdutoModal(false)
                setProdutoModalIndex(null)
                setNovoProduto({
                  descricao: '',
                  unidade: 'UN',
                  precoUnitario: 0,
                  categoria: '',
                })
              }}
              disabled={loadingProduto}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCriarProduto}
              disabled={loadingProduto}
              className="gap-2"
            >
              {loadingProduto ? 'Salvando...' : (
                <>
                  <Save className="h-4 w-4" />
                  Cadastrar
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

