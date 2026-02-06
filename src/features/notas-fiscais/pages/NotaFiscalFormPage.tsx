import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { NotaFiscal, NotaFiscalRequest, NotaFiscalItemRequest, TipoNotaFiscal, FormaPagamento, Fornecedor, Cliente, ClienteRequest, FornecedorRequest, Produto, ProdutoRequest, StatusCliente, StatusFornecedor } from '@/types'
import { notaFiscalService } from '@/services/notaFiscalService'
import { fornecedorService } from '@/services/fornecedorService'
import { clienteService } from '@/services/clienteService'
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
  const location = window.location.pathname
  const isEditing = !!id && location.includes('/editar')

  const [loading, setLoading] = useState(false)
  const [loadingNota, setLoadingNota] = useState(false)
  const [error, setError] = useState('')
  const [showGerarSaidaDialog, setShowGerarSaidaDialog] = useState(false)
  const [notaCriadaId, setNotaCriadaId] = useState<string | null>(null)
  const [gerandoSaida, setGerandoSaida] = useState(false)
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loadingFornecedores, setLoadingFornecedores] = useState(true)
  const [loadingClientes, setLoadingClientes] = useState(true)
  const [selectedFornecedorId, setSelectedFornecedorId] = useState<string>('')
  const [selectedClienteId, setSelectedClienteId] = useState<string>('')
  const [tipoSelecao, setTipoSelecao] = useState<'FORNECEDOR' | 'CLIENTE'>('FORNECEDOR')
  const [fornecedorSearchTerm, setFornecedorSearchTerm] = useState('')
  const [clienteSearchTerm, setClienteSearchTerm] = useState('')
  const [showFornecedorDropdown, setShowFornecedorDropdown] = useState(false)
  const [showClienteDropdown, setShowClienteDropdown] = useState(false)
  const [showCriarFornecedorModal, setShowCriarFornecedorModal] = useState(false)
  const [showCriarClienteModal, setShowCriarClienteModal] = useState(false)
  const [novoFornecedor, setNovoFornecedor] = useState<FornecedorRequest>({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: 'CE',
    status: StatusFornecedor.ATIVO,
  })
  const [novoCliente, setNovoCliente] = useState<ClienteRequest>({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: 'CE',
    status: StatusCliente.ATIVO,
  })
  const [loadingCriarFornecedor, setLoadingCriarFornecedor] = useState(false)
  const [loadingCriarCliente, setLoadingCriarCliente] = useState(false)

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

  const handleGerarNotaSaida = async () => {
    if (!notaCriadaId || !formData) return

    try {
      setGerandoSaida(true)
      
      // Buscar a nota criada para pegar os itens
      const notaEntrada = await notaFiscalService.buscarPorId(notaCriadaId)
      
      // Criar nota de saída baseada na entrada
      const notaSaida = {
        tipo: TipoNotaFiscal.SAIDA,
        fornecedor: notaEntrada.fornecedor,
        cnpjEmpresa: notaEntrada.cnpjEmpresa,
        fornecedorId: notaEntrada.fornecedorId,
        clienteId: notaEntrada.clienteId,
        dataEmissao: new Date().toISOString().split('T')[0],
        numeroNota: gerarNumeroNotaSaida(new Date().toISOString().split('T')[0]),
        // Notas de saída não têm forma de pagamento
        formaPagamento: undefined,
        itens: notaEntrada.itens.map(item => ({
          produtoId: item.produtoId,
          descricao: item.descricao,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          desconto: item.desconto || 0,
        })),
      }

      const notaSaidaCriada = await notaFiscalService.criar(notaSaida)
      setShowGerarSaidaDialog(false)
      navigate(`/notas-entrada/${notaSaidaCriada.id}`)
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar nota de saída')
      setShowGerarSaidaDialog(false)
      navigate('/notas-entrada')
    } finally {
      setGerandoSaida(false)
    }
  }

  const handleCancelarGerarSaida = () => {
    setShowGerarSaidaDialog(false)
    navigate('/notas-entrada')
  }

  useEffect(() => {
    carregarFornecedores()
    carregarClientes()
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

  const carregarClientes = async () => {
    try {
      setLoadingClientes(true)
      const data = await clienteService.listar()
      setClientes(data.filter(c => c.status === 'ATIVO'))
    } catch (err: any) {
      console.error('Erro ao carregar clientes:', err)
    } finally {
      setLoadingClientes(false)
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
        fornecedorId: nota.fornecedorId,
        clienteId: nota.clienteId,
        itens: nota.itens.map(item => ({
          produtoId: item.produtoId,
          descricao: item.descricao,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          desconto: item.desconto || 0,
        })),
      })
      
      // Configurar seleção de fornecedor ou cliente
      if (nota.clienteId) {
        setSelectedClienteId(nota.clienteId)
        setSelectedFornecedorId('')
        setTipoSelecao('CLIENTE')
        const cliente = clientes.find(c => c.id === nota.clienteId)
        if (cliente) {
          setClienteSearchTerm(cliente.nome)
        }
      } else if (nota.fornecedorId) {
        setSelectedFornecedorId(nota.fornecedorId)
        setSelectedClienteId('')
        setTipoSelecao('FORNECEDOR')
        const fornecedor = fornecedores.find(f => f.id === nota.fornecedorId)
        if (fornecedor) {
          setFornecedorSearchTerm(fornecedor.nome)
        }
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

    // Validação: deve ter fornecedor OU cliente selecionado
    if (!selectedFornecedorId && !selectedClienteId) {
      setError('Por favor, selecione um fornecedor ou cliente cadastrado')
      return
    }

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
        // Notas de saída não têm forma de pagamento
        formaPagamento: formData.tipo === TipoNotaFiscal.SAIDA ? undefined : formData.formaPagamento,
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
        navigate('/notas-entrada')
      } else {
        const notaCriada = await notaFiscalService.criar(dataToSubmit)
        
        // Se for nota de entrada, perguntar se quer gerar nota de saída
        if (dataToSubmit.tipo === 'ENTRADA') {
          setNotaCriadaId(notaCriada.id)
          setShowGerarSaidaDialog(true)
        } else {
          navigate('/notas-entrada')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar nota fiscal')
    } finally {
      setLoading(false)
    }
  }

  const addItem = (scrollToNew = true) => {
    setFormData({
      ...formData,
      itens: [...formData.itens, { ...emptyItem }],
    })
    
    // Scroll automático para o novo item após um pequeno delay
    if (scrollToNew) {
      setTimeout(() => {
        const itemsContainer = document.getElementById('itens-container')
        if (itemsContainer) {
          const lastItem = itemsContainer.lastElementChild
          if (lastItem) {
            lastItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }
        }
      }, 100)
    }
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
    setSelectedClienteId('')
    setFormData({
      ...formData,
      fornecedor: fornecedor.nome,
      cnpjEmpresa: maskCNPJ(fornecedor.cnpj),
      fornecedorId: fornecedor.id,
      clienteId: undefined,
    })
    setFornecedorSearchTerm(fornecedor.nome) // Preencher com o nome para mostrar que está selecionado
    setShowFornecedorDropdown(false)
    setError('') // Limpar erros ao selecionar
  }

  const handleSelectCliente = (cliente: Cliente) => {
    setSelectedClienteId(cliente.id)
    setSelectedFornecedorId('')
    setFormData({
      ...formData,
      fornecedor: cliente.nome,
      cnpjEmpresa: maskCNPJ(cliente.cnpj),
      clienteId: cliente.id,
      fornecedorId: undefined,
    })
    setClienteSearchTerm(cliente.nome) // Preencher com o nome para mostrar que está selecionado
    setShowClienteDropdown(false)
    setError('') // Limpar erros ao selecionar
  }

  const filteredFornecedores = fornecedores.filter(f =>
    f.nome.toLowerCase().includes(fornecedorSearchTerm.toLowerCase()) ||
    f.cnpj.includes(fornecedorSearchTerm)
  )

  const filteredClientes = clientes.filter(c =>
    c.nome.toLowerCase().includes(clienteSearchTerm.toLowerCase()) ||
    c.cnpj.includes(clienteSearchTerm)
  )

  const handleCriarFornecedor = async () => {
    if (!novoFornecedor.nome || !novoFornecedor.cnpj || !novoFornecedor.endereco || !novoFornecedor.cidade) {
      setError('Preencha todos os campos obrigatórios do fornecedor')
      return
    }

    try {
      setLoadingCriarFornecedor(true)
      setError('') // Limpar erros anteriores
      const fornecedorCriado = await fornecedorService.criar({
        ...novoFornecedor,
        cnpj: unmaskCPFCNPJ(novoFornecedor.cnpj),
      })
      
      // Atualizar lista e selecionar
      await carregarFornecedores()
      
      // Garantir que o tipo de seleção está correto
      setTipoSelecao('FORNECEDOR')
      
      // Selecionar o fornecedor criado
      handleSelectFornecedor(fornecedorCriado)
      
      setShowCriarFornecedorModal(false)
      setNovoFornecedor({
        nome: '',
        cnpj: '',
        email: '',
        telefone: '',
        endereco: '',
        cidade: '',
        estado: 'CE',
        status: StatusFornecedor.ATIVO,
      })
    } catch (err: any) {
      setError(err.message || 'Erro ao criar fornecedor')
    } finally {
      setLoadingCriarFornecedor(false)
    }
  }

  const handleCriarCliente = async () => {
    if (!novoCliente.nome || !novoCliente.cnpj || !novoCliente.endereco || !novoCliente.cidade) {
      setError('Preencha todos os campos obrigatórios do cliente')
      return
    }

    try {
      setLoadingCriarCliente(true)
      setError('') // Limpar erros anteriores
      const clienteCriado = await clienteService.criar({
        ...novoCliente,
        cnpj: unmaskCPFCNPJ(novoCliente.cnpj),
      })
      
      // Atualizar lista e selecionar
      await carregarClientes()
      
      // Garantir que o tipo de seleção está correto
      setTipoSelecao('CLIENTE')
      
      // Selecionar o cliente criado
      handleSelectCliente(clienteCriado)
      
      setShowCriarClienteModal(false)
      setNovoCliente({
        nome: '',
        cnpj: '',
        email: '',
        telefone: '',
        endereco: '',
        cidade: '',
        estado: 'CE',
        status: StatusCliente.ATIVO,
      })
    } catch (err: any) {
      setError(err.message || 'Erro ao criar cliente')
    } finally {
      setLoadingCriarCliente(false)
    }
  }

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
                        // Limpar forma de pagamento se mudar para SAIDA
                        formaPagamento: novoTipo === TipoNotaFiscal.SAIDA ? undefined : (prev.formaPagamento || FormaPagamento.PIX),
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

              {/* Forma de Pagamento - apenas para notas de ENTRADA */}
              {formData.tipo === TipoNotaFiscal.ENTRADA && (
                <div className="space-y-2">
                  <Label htmlFor="formaPagamento">Forma de Pagamento *</Label>
                  <select
                    id="formaPagamento"
                    value={formData.formaPagamento || FormaPagamento.PIX}
                    onChange={(e) => setFormData({ ...formData, formaPagamento: e.target.value as FormaPagamento })}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                    required
                  >
                    <option value={FormaPagamento.PIX}>PIX</option>
                    <option value={FormaPagamento.CARTAO}>Cartão</option>
                    <option value={FormaPagamento.BOLETO}>Boleto</option>
                    <option value={FormaPagamento.TRANSFERENCIA}>Transferência</option>
                  </select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fornecedor/Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Fornecedor ou Cliente
            </CardTitle>
          </CardHeader>
            <CardContent className="space-y-4">
              {/* Seletor de Tipo */}
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={tipoSelecao === 'FORNECEDOR' ? 'default' : 'outline'}
                    onClick={() => {
                      setTipoSelecao('FORNECEDOR')
                      setSelectedClienteId('')
                      setClienteSearchTerm('')
                      setFormData({ ...formData, clienteId: undefined })
                    }}
                    className="flex-1"
                  >
                    Fornecedor
                  </Button>
                  <Button
                    type="button"
                    variant={tipoSelecao === 'CLIENTE' ? 'default' : 'outline'}
                    onClick={() => {
                      setTipoSelecao('CLIENTE')
                      setSelectedFornecedorId('')
                      setFornecedorSearchTerm('')
                      setFormData({ ...formData, fornecedorId: undefined })
                    }}
                    className="flex-1"
                  >
                    Cliente
                  </Button>
                </div>
              </div>

              {/* Seletor de Fornecedor */}
              {tipoSelecao === 'FORNECEDOR' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Selecionar Fornecedor Cadastrado *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCriarFornecedorModal(true)}
                      className="gap-1 text-xs"
                    >
                      <PlusCircle className="h-3 w-3" />
                      Novo Fornecedor
                    </Button>
                  </div>
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder={selectedFornecedorId ? "Fornecedor selecionado" : "Buscar fornecedor por nome ou CNPJ..."}
                        value={fornecedorSearchTerm}
                        onChange={(e) => {
                          setFornecedorSearchTerm(e.target.value)
                          setShowFornecedorDropdown(true)
                        }}
                        onFocus={() => {
                          if (!selectedFornecedorId) {
                            setShowFornecedorDropdown(true)
                          }
                        }}
                        className="pl-10"
                        readOnly={!!selectedFornecedorId}
                      />
                    </div>
                    {showFornecedorDropdown && fornecedorSearchTerm && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
                        {loadingFornecedores ? (
                          <div className="p-3 text-center text-slate-500">Carregando...</div>
                        ) : filteredFornecedores.length === 0 ? (
                          <div className="p-3 text-center text-slate-500">
                            <p className="mb-2">Nenhum fornecedor encontrado</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowCriarFornecedorModal(true)}
                              className="gap-1"
                            >
                              <PlusCircle className="h-3 w-3" />
                              Cadastrar Fornecedor
                            </Button>
                          </div>
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
              )}

              {/* Seletor de Cliente */}
              {tipoSelecao === 'CLIENTE' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Selecionar Cliente Cadastrado *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCriarClienteModal(true)}
                      className="gap-1 text-xs"
                    >
                      <PlusCircle className="h-3 w-3" />
                      Novo Cliente
                    </Button>
                  </div>
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder={selectedClienteId ? "Cliente selecionado" : "Buscar cliente por nome ou CNPJ..."}
                        value={clienteSearchTerm}
                        onChange={(e) => {
                          setClienteSearchTerm(e.target.value)
                          setShowClienteDropdown(true)
                        }}
                        onFocus={() => {
                          if (!selectedClienteId) {
                            setShowClienteDropdown(true)
                          }
                        }}
                        className="pl-10"
                        readOnly={!!selectedClienteId}
                      />
                    </div>
                    {showClienteDropdown && clienteSearchTerm && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
                        {loadingClientes ? (
                          <div className="p-3 text-center text-slate-500">Carregando...</div>
                        ) : filteredClientes.length === 0 ? (
                          <div className="p-3 text-center text-slate-500">
                            <p className="mb-2">Nenhum cliente encontrado</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowCriarClienteModal(true)}
                              className="gap-1"
                            >
                              <PlusCircle className="h-3 w-3" />
                              Cadastrar Cliente
                            </Button>
                          </div>
                        ) : (
                          filteredClientes.map((cliente) => (
                            <button
                              key={cliente.id}
                              type="button"
                              onClick={() => handleSelectCliente(cliente)}
                              className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center justify-between"
                            >
                              <div>
                                <div className="font-medium">{cliente.nome}</div>
                                <div className="text-sm text-slate-500">{cliente.cnpj}</div>
                              </div>
                              {selectedClienteId === cliente.id && (
                                <span className="text-blue-600 text-sm">Selecionado</span>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dados Selecionados (somente leitura) */}
              {(selectedFornecedorId || selectedClienteId) && (
                <div className="p-3 bg-blue-50 rounded-lg space-y-2">
                  <div className="text-sm font-semibold text-blue-900">
                    {selectedFornecedorId ? 'Fornecedor' : 'Cliente'} Selecionado:
                  </div>
                  <div className="text-sm text-blue-700">
                    <div><strong>Nome:</strong> {formData.fornecedor}</div>
                    <div><strong>CNPJ:</strong> {formData.cnpjEmpresa}</div>
                  </div>
                </div>
              )}

              {/* Botão para limpar seleção */}
              {(selectedFornecedorId || selectedClienteId) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedFornecedorId) {
                      setSelectedFornecedorId('')
                      setFornecedorSearchTerm('')
                    }
                    if (selectedClienteId) {
                      setSelectedClienteId('')
                      setClienteSearchTerm('')
                    }
                    setFormData({
                      ...formData,
                      fornecedor: '',
                      cnpjEmpresa: '',
                      fornecedorId: undefined,
                      clienteId: undefined,
                    })
                  }}
                  className="gap-1 text-xs"
                >
                  <X className="h-3 w-3" />
                  Limpar Seleção
                </Button>
              )}

              {/* Validação: obrigatório selecionar */}
              {!selectedFornecedorId && !selectedClienteId && (
                <div className="p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700">
                  Por favor, selecione um {tipoSelecao === 'FORNECEDOR' ? 'fornecedor' : 'cliente'} cadastrado ou crie um novo.
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
                Itens da Nota ({formData.itens.length})
              </CardTitle>
              <Button type="button" variant="outline" onClick={() => addItem(true)} className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Adicionar Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4" id="itens-container">
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
                
                {/* Botão para adicionar item após este */}
                <div className="flex justify-end pt-2 border-t border-slate-100 mt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Adicionar item após o atual
                      const newItens = [...formData.itens]
                      newItens.splice(index + 1, 0, { ...emptyItem })
                      setFormData({ ...formData, itens: newItens })
                      
                      // Scroll para o novo item
                      setTimeout(() => {
                        const itemsContainer = document.getElementById('itens-container')
                        if (itemsContainer) {
                          const newItemIndex = index + 1
                          const newItem = itemsContainer.children[newItemIndex]
                          if (newItem) {
                            newItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                            // Focar no primeiro input do novo item
                            const firstInput = newItem.querySelector('input, select') as HTMLElement
                            if (firstInput) {
                              setTimeout(() => firstInput.focus(), 300)
                            }
                          }
                        }
                      }, 100)
                    }}
                    className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Adicionar Item Abaixo
                  </Button>
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

      {/* Botão Fixo para Adicionar Item - posicionado respeitando o menu lateral */}
      <div className="fixed bottom-6 z-50 left-0 right-0 flex justify-center lg:justify-start lg:left-[calc(256px+1.5rem)] lg:right-auto">
        <Button
          type="button"
          onClick={() => addItem(true)}
          className="gap-2 shadow-lg h-12 px-6 rounded-full"
          size="lg"
        >
          <PlusCircle className="h-5 w-5" />
          Adicionar Item
        </Button>
      </div>

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

      {/* Dialog para gerar nota de saída após criar entrada */}
      <Dialog open={showGerarSaidaDialog} onOpenChange={setShowGerarSaidaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nota de Entrada Criada!</DialogTitle>
            <DialogDescription>
              Deseja gerar uma nota de saída baseada nesta nota de entrada? 
              Os itens e valores serão copiados automaticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={handleCancelarGerarSaida}
              disabled={gerandoSaida}
            >
              Não, apenas salvar
            </Button>
            <Button
              onClick={handleGerarNotaSaida}
              disabled={gerandoSaida}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {gerandoSaida ? 'Gerando...' : 'Sim, gerar nota de saída'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Cadastro Rápido de Fornecedor */}
      <Dialog open={showCriarFornecedorModal} onOpenChange={setShowCriarFornecedorModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Cadastrar Novo Fornecedor
            </DialogTitle>
            <DialogDescription>
              Preencha os dados básicos do fornecedor para cadastrá-lo rapidamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fornecedorNome">Nome / Razão Social *</Label>
              <Input
                id="fornecedorNome"
                value={novoFornecedor.nome}
                onChange={(e) => setNovoFornecedor({ ...novoFornecedor, nome: e.target.value })}
                placeholder="Nome completo ou razão social"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fornecedorCnpj">CNPJ *</Label>
              <Input
                id="fornecedorCnpj"
                value={novoFornecedor.cnpj}
                onChange={(e) => {
                  const masked = maskCNPJ(e.target.value)
                  setNovoFornecedor({ ...novoFornecedor, cnpj: masked })
                }}
                placeholder="00.000.000/0000-00"
                required
                maxLength={18}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fornecedorEmail">Email</Label>
                <Input
                  id="fornecedorEmail"
                  type="email"
                  value={novoFornecedor.email}
                  onChange={(e) => setNovoFornecedor({ ...novoFornecedor, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fornecedorTelefone">Telefone</Label>
                <Input
                  id="fornecedorTelefone"
                  value={novoFornecedor.telefone}
                  onChange={(e) => setNovoFornecedor({ ...novoFornecedor, telefone: e.target.value })}
                  placeholder="(85) 99999-9999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fornecedorEndereco">Endereço *</Label>
              <Input
                id="fornecedorEndereco"
                value={novoFornecedor.endereco}
                onChange={(e) => setNovoFornecedor({ ...novoFornecedor, endereco: e.target.value })}
                placeholder="Rua, número, bairro"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fornecedorCidade">Cidade *</Label>
                <Input
                  id="fornecedorCidade"
                  value={novoFornecedor.cidade}
                  onChange={(e) => setNovoFornecedor({ ...novoFornecedor, cidade: e.target.value })}
                  placeholder="Fortaleza"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fornecedorEstado">Estado *</Label>
                <Input
                  id="fornecedorEstado"
                  value={novoFornecedor.estado}
                  onChange={(e) => setNovoFornecedor({ ...novoFornecedor, estado: e.target.value.toUpperCase().slice(0, 2) })}
                  placeholder="CE"
                  required
                  maxLength={2}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCriarFornecedorModal(false)
                setNovoFornecedor({
                  nome: '',
                  cnpj: '',
                  email: '',
                  telefone: '',
                  endereco: '',
                  cidade: '',
                  estado: 'CE',
                  status: StatusFornecedor.ATIVO,
                })
              }}
              disabled={loadingCriarFornecedor}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCriarFornecedor}
              disabled={loadingCriarFornecedor}
              className="gap-2"
            >
              {loadingCriarFornecedor ? 'Salvando...' : (
                <>
                  <Save className="h-4 w-4" />
                  Cadastrar
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Cadastro Rápido de Cliente */}
      <Dialog open={showCriarClienteModal} onOpenChange={setShowCriarClienteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Cadastrar Novo Cliente
            </DialogTitle>
            <DialogDescription>
              Preencha os dados básicos do cliente para cadastrá-lo rapidamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clienteNome">Nome / Razão Social *</Label>
              <Input
                id="clienteNome"
                value={novoCliente.nome}
                onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                placeholder="Nome completo ou razão social"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clienteCnpj">CNPJ *</Label>
              <Input
                id="clienteCnpj"
                value={novoCliente.cnpj}
                onChange={(e) => {
                  const masked = maskCNPJ(e.target.value)
                  setNovoCliente({ ...novoCliente, cnpj: masked })
                }}
                placeholder="00.000.000/0000-00"
                required
                maxLength={18}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clienteEmail">Email</Label>
                <Input
                  id="clienteEmail"
                  type="email"
                  value={novoCliente.email}
                  onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clienteTelefone">Telefone</Label>
                <Input
                  id="clienteTelefone"
                  value={novoCliente.telefone}
                  onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                  placeholder="(85) 99999-9999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clienteEndereco">Endereço *</Label>
              <Input
                id="clienteEndereco"
                value={novoCliente.endereco}
                onChange={(e) => setNovoCliente({ ...novoCliente, endereco: e.target.value })}
                placeholder="Rua, número, bairro"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clienteCidade">Cidade *</Label>
                <Input
                  id="clienteCidade"
                  value={novoCliente.cidade}
                  onChange={(e) => setNovoCliente({ ...novoCliente, cidade: e.target.value })}
                  placeholder="Fortaleza"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clienteEstado">Estado *</Label>
                <Input
                  id="clienteEstado"
                  value={novoCliente.estado}
                  onChange={(e) => setNovoCliente({ ...novoCliente, estado: e.target.value.toUpperCase().slice(0, 2) })}
                  placeholder="CE"
                  required
                  maxLength={2}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCriarClienteModal(false)
                setNovoCliente({
                  nome: '',
                  cnpj: '',
                  email: '',
                  telefone: '',
                  endereco: '',
                  cidade: '',
                  estado: 'CE',
                  status: StatusCliente.ATIVO,
                })
              }}
              disabled={loadingCriarCliente}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCriarCliente}
              disabled={loadingCriarCliente}
              className="gap-2"
            >
              {loadingCriarCliente ? 'Salvando...' : (
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

