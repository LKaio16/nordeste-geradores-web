import { useMemo, useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  PropostaRequest,
  TipoProposta,
  StatusProposta,
  CategoriaPropostaItem,
  Cliente,
  PropostaItemRequest,
  StatusCliente,
} from '@/types'
import { propostaService } from '@/services/propostaService'
import { clienteService } from '@/services/clienteService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/utils/cn'
import {
  isCategoriaPreset,
  loadCategoriasCustomSalvas,
  rememberCategoriaCustom,
} from '@/utils/propostaCategoriasCustom'
import {
  ArrowLeft,
  Plus,
  Trash2,
  User,
  CalendarClock,
  FileText,
  Landmark,
  Package,
  Zap,
  Link2,
  Truck,
  Wrench,
  Loader2,
  Save,
  AlertTriangle,
  Tag,
} from 'lucide-react'
import { motion } from 'framer-motion'

const FORM_ID = 'form-proposta'

const fieldClass =
  'flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#203d7b]/20 focus-visible:border-[#203d7b]/40'

const textareaClass =
  'flex min-h-[108px] w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#203d7b]/20 focus-visible:border-[#203d7b]/40'

type PropostaItemDraft = Omit<PropostaItemRequest, 'valorUnitario'> & {
  valorUnitario: number | ''
}

type PropostaDraft = Omit<PropostaRequest, 'itens'> & {
  itens: PropostaItemDraft[]
}

const categoriaMeta: Record<
  CategoriaPropostaItem,
  { label: string; icon: typeof Zap; boxClass: string; iconClass: string }
> = {
  [CategoriaPropostaItem.GERADOR]: {
    label: 'Gerador',
    icon: Zap,
    boxClass: 'bg-amber-50',
    iconClass: 'text-amber-600',
  },
  [CategoriaPropostaItem.CABOS]: {
    label: 'Cabos',
    icon: Link2,
    boxClass: 'bg-slate-100',
    iconClass: 'text-slate-600',
  },
  [CategoriaPropostaItem.FRETE]: {
    label: 'Frete',
    icon: Truck,
    boxClass: 'bg-blue-50',
    iconClass: 'text-blue-600',
  },
  [CategoriaPropostaItem.SERVICO]: {
    label: 'Serviço',
    icon: Wrench,
    boxClass: 'bg-emerald-50',
    iconClass: 'text-emerald-600',
  },
}

const OUTRA_CATEGORIA = '__OUTRA__'

function resolveCategoriaVisual(categoria: string): {
  label: string
  icon: typeof Zap
  boxClass: string
  iconClass: string
} {
  const c = categoria.trim()
  if (c && Object.prototype.hasOwnProperty.call(categoriaMeta, c)) {
    const m = categoriaMeta[c as CategoriaPropostaItem]
    return { label: m.label, icon: m.icon, boxClass: m.boxClass, iconClass: m.iconClass }
  }
  return {
    label: c || 'Personalizada',
    icon: Tag,
    boxClass: 'bg-violet-50',
    iconClass: 'text-violet-600',
  }
}

function valorSelectCategoria(categoria: string, salvas: string[]): string {
  const c = categoria.trim()
  if (!c) return OUTRA_CATEGORIA
  if (isCategoriaPreset(c) || salvas.includes(c)) return c
  return OUTRA_CATEGORIA
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function parseLocalDate(ymd: string) {
  const parts = ymd.split('T')[0].split('-').map(Number)
  if (parts.length !== 3) return null
  return new Date(parts[0], parts[1] - 1, parts[2])
}

function diffDaysValidade(dataEmissao: string, validade: string) {
  const a = parseLocalDate(dataEmissao)
  const b = parseLocalDate(validade)
  if (!a || !b) return null
  a.setHours(0, 0, 0, 0)
  b.setHours(0, 0, 0, 0)
  return Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000))
}

export function PropostaFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const [formData, setFormData] = useState<PropostaDraft>({
    clienteId: undefined,
    clienteNome: '',
    tipo: TipoProposta.MENSAL,
    dataEmissao: new Date().toISOString().split('T')[0],
    validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    observacoes: '',
    dadosBancarios: '',
    status: StatusProposta.RASCUNHO,
    formaPagamento: '',
    itens: [],
  })

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteBusca, setClienteBusca] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [clienteModo, setClienteModo] = useState<'cadastrado' | 'avulso'>('cadastrado')
  const [categoriasSalvas, setCategoriasSalvas] = useState<string[]>(() => loadCategoriasCustomSalvas())
  /** Com o input personalizado focado, o select permanece em "Outra" para não casar com categoria salva enquanto o texto ainda vai crescer. */
  const [categoriaPersonalizadaFocadaIndex, setCategoriaPersonalizadaFocadaIndex] = useState<number | null>(null)

  const clienteLabel = useMemo(() => {
    if (clienteModo === 'cadastrado') {
      const c = clientes.find((x) => x.id === formData.clienteId)
      return c?.nome || ''
    }
    return formData.clienteNome?.trim() || ''
  }, [clienteModo, clientes, formData.clienteId, formData.clienteNome])

  const filteredClientes = useMemo(() => {
    const q = clienteBusca.trim().toLowerCase()
    const digits = q.replace(/\D/g, '')
    let list = clientes
    if (q) {
      list = clientes.filter((c) => {
        const nomeOk = c.nome.toLowerCase().includes(q)
        const doc = c.cnpj.replace(/\D/g, '')
        const docOk = digits.length > 0 && doc.includes(digits)
        return nomeOk || docOk
      })
    }
    return [...list].sort((a, b) => {
      const ao = a.status === StatusCliente.ATIVO ? 0 : 1
      const bo = b.status === StatusCliente.ATIVO ? 0 : 1
      if (ao !== bo) return ao - bo
      return a.nome.localeCompare(b.nome, 'pt-BR')
    })
  }, [clientes, clienteBusca])

  const diasValidade = useMemo(
    () => diffDaysValidade(formData.dataEmissao, formData.validade),
    [formData.dataEmissao, formData.validade]
  )

  const validadeAntesEmissao = diasValidade !== null && diasValidade < 0

  const totalProposta = useMemo(
    () =>
      formData.itens.reduce((acc, item) => {
        const vu = item.valorUnitario === '' ? 0 : Number(item.valorUnitario)
        return acc + item.quantidade * vu
      }, 0),
    [formData.itens]
  )

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    if (isEdit && id) {
      carregarProposta(id)
    }
  }, [id, isEdit])

  const carregarDados = async () => {
    try {
      setLoadingData(true)
      const clientesData = await clienteService.listar()
      setClientes(clientesData)
    } catch (err: unknown) {
      console.error('Erro ao carregar dados:', err)
      alert('Erro ao carregar dados')
    } finally {
      setLoadingData(false)
    }
  }

  const carregarProposta = async (propostaId: string) => {
    try {
      setLoadingData(true)
      const proposta = await propostaService.buscarPorId(propostaId)
      setFormData({
        clienteId: proposta.cliente?.id || undefined,
        clienteNome: proposta.cliente?.nome || proposta.clienteNome || '',
        tipo: proposta.tipo,
        dataEmissao: proposta.dataEmissao.split('T')[0],
        validade: proposta.validade.split('T')[0],
        observacoes: proposta.observacoes || '',
        dadosBancarios: proposta.dadosBancarios || '',
        status: proposta.status,
        formaPagamento: proposta.formaPagamento || '',
        itens: proposta.itens.map((item) => ({
          categoria: item.categoria,
          descricao: item.descricao,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
        })),
      })

      setClienteModo(proposta.cliente ? 'cadastrado' : 'avulso')
    } catch (err: unknown) {
      console.error('Erro ao carregar proposta:', err)
      alert('Erro ao carregar proposta')
      navigate('/propostas')
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.itens.length === 0) {
      alert('Adicione pelo menos um item à proposta')
      return
    }

    if (clienteModo === 'cadastrado' && !formData.clienteId) {
      alert('Selecione um cliente cadastrado ou use Cliente avulso.')
      return
    }
    if (clienteModo === 'avulso' && !formData.clienteNome?.trim()) {
      alert('Informe o nome do cliente (avulso).')
      return
    }

    if (formData.itens.some((item) => item.valorUnitario === '' || Number(item.valorUnitario) <= 0)) {
      alert('Informe o valor unitário de todos os itens (maior que zero).')
      return
    }

    if (formData.itens.some((item) => !String(item.categoria).trim())) {
      alert('Informe a categoria de todos os itens (padrão ou personalizada).')
      return
    }

    try {
      setLoading(true)
      const itensNormalizados = formData.itens.map((item) => ({
        ...item,
        categoria: String(item.categoria).trim(),
        valorUnitario: Number(item.valorUnitario),
      }))
      itensNormalizados.forEach((it) => {
        if (!isCategoriaPreset(it.categoria)) {
          rememberCategoriaCustom(it.categoria)
        }
      })
      setCategoriasSalvas(loadCategoriasCustomSalvas())

      const payload: PropostaRequest = {
        ...(formData as unknown as PropostaRequest),
        clienteId: clienteModo === 'cadastrado' ? formData.clienteId : undefined,
        clienteNome: clienteModo === 'avulso' ? (formData.clienteNome?.trim() || undefined) : undefined,
        itens: itensNormalizados,
      }
      if (isEdit && id) {
        await propostaService.atualizar(id, payload)
      } else {
        await propostaService.criar(payload)
      }
      navigate('/propostas')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar proposta'
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  const adicionarItem = () => {
    setFormData({
      ...formData,
      itens: [
        ...formData.itens,
        {
          categoria: CategoriaPropostaItem.GERADOR,
          descricao: '',
          quantidade: 1,
          valorUnitario: '',
        },
      ],
    })
  }

  const removerItem = (index: number) => {
    setCategoriaPersonalizadaFocadaIndex(null)
    setFormData({
      ...formData,
      itens: formData.itens.filter((_, i) => i !== index),
    })
  }

  const atualizarItem = (index: number, campo: keyof PropostaItemRequest, valor: unknown) => {
    const novosItens = [...formData.itens]
    novosItens[index] = {
      ...novosItens[index],
      [campo]: valor,
    }

    if (campo === 'quantidade' || campo === 'valorUnitario') {
      const quantidade = campo === 'quantidade' ? (valor as number) : novosItens[index].quantidade
      const valorUnitario = campo === 'valorUnitario' ? valor : novosItens[index].valorUnitario
      novosItens[index] = {
        ...novosItens[index],
        quantidade,
        valorUnitario,
      }
    }

    setFormData({
      ...formData,
      itens: novosItens,
    })
  }

  const linhaSubtotal = (item: PropostaItemDraft) => {
    const vu = item.valorUnitario === '' ? 0 : Number(item.valorUnitario)
    return item.quantidade * vu
  }

  if (loadingData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[#203d7b]" />
          <p className="text-slate-500">Carregando…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button variant="ghost" onClick={() => navigate('/propostas')} className="w-fit gap-2 text-slate-600">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="min-w-0 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-[#203d7b]/[0.06] via-white to-slate-50/80 px-5 py-4 shadow-sm">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {isEdit ? 'Editar proposta' : 'Nova proposta'}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {isEdit ? 'Atualize valores, itens e condições comerciais.' : 'Monte a proposta com cliente, prazos e itens.'}
            </p>
            {clienteLabel ? (
              <p className="mt-2 flex items-center gap-2 text-sm font-medium text-[#203d7b]">
                <User className="h-4 w-4 shrink-0 opacity-80" />
                <span className="truncate">{clienteLabel}</span>
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        className="xl:grid xl:grid-cols-[minmax(0,1fr),300px] xl:items-stretch xl:gap-8"
      >
        <div className="min-w-0 space-y-6">
          <Card className="border-slate-200/90 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-[#203d7b]">
                <User className="h-5 w-5" />
                <CardTitle className="text-lg">Cliente</CardTitle>
              </div>
              <CardDescription>Cliente cadastrado no sistema ou nome avulso para orçamento rápido.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium text-slate-700">Origem do cliente</span>
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50/80 p-1">
                  <button
                    type="button"
                    onClick={() => setClienteModo('cadastrado')}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                      clienteModo === 'cadastrado' ? 'bg-[#203d7b] text-white shadow-sm' : 'text-slate-600 hover:bg-white'
                    )}
                  >
                    Cadastrado
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setClienteModo('avulso')
                      setFormData({ ...formData, clienteId: undefined })
                    }}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                      clienteModo === 'avulso' ? 'bg-[#203d7b] text-white shadow-sm' : 'text-slate-600 hover:bg-white'
                    )}
                  >
                    Avulso
                  </button>
                </div>
              </div>

              {clienteModo === 'cadastrado' ? (
                <div className="space-y-2">
                  <Label htmlFor="buscaCliente">Buscar cliente</Label>
                  <Input
                    id="buscaCliente"
                    value={clienteBusca}
                    onChange={(e) => setClienteBusca(e.target.value)}
                    placeholder="Nome ou CNPJ…"
                    className={fieldClass}
                  />
                  <Label htmlFor="clienteId">Cliente *</Label>
                  <select
                    id="clienteId"
                    value={formData.clienteId || ''}
                    onChange={(e) => setFormData({ ...formData, clienteId: e.target.value || undefined })}
                    className={fieldClass}
                    required
                  >
                    <option value="">Selecione um cliente</option>
                    {filteredClientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                        {cliente.status !== StatusCliente.ATIVO ? ' (inativo)' : ''} — {cliente.cnpj}
                      </option>
                    ))}
                  </select>
                  {filteredClientes.length === 0 && clientes.length > 0 ? (
                    <p className="text-xs text-amber-700">
                      Nenhum cliente encontrado.{' '}
                      <Link to="/clientes/novo" className="font-semibold underline underline-offset-2">
                        Cadastrar cliente
                      </Link>
                    </p>
                  ) : null}
                  {clientes.length === 0 ? (
                    <p className="text-xs text-slate-600">
                      Não há clientes cadastrados.{' '}
                      <Link to="/clientes/novo" className="font-semibold text-[#203d7b] underline underline-offset-2">
                        Criar primeiro cliente
                      </Link>
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="clienteNome">Nome do cliente (avulso) *</Label>
                  <Input
                    id="clienteNome"
                    value={formData.clienteNome || ''}
                    onChange={(e) => setFormData({ ...formData, clienteNome: e.target.value })}
                    placeholder="Razão social ou nome para a proposta"
                    className={fieldClass}
                    required
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200/90 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-[#203d7b]">
                <CalendarClock className="h-5 w-5" />
                <CardTitle className="text-lg">Prazos e status</CardTitle>
              </div>
              <CardDescription>Tipo de contrato, datas e situação da proposta no funil.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <select
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoProposta })}
                    className={fieldClass}
                    required
                  >
                    <option value={TipoProposta.MENSAL}>Mensal</option>
                    <option value={TipoProposta.EVENTO}>Evento</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusProposta })}
                    className={fieldClass}
                    required
                  >
                    <option value={StatusProposta.RASCUNHO}>Rascunho</option>
                    <option value={StatusProposta.ENVIADA}>Enviada</option>
                    <option value={StatusProposta.APROVADA}>Aprovada</option>
                    <option value={StatusProposta.RECUSADA}>Recusada</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataEmissao">Data de emissão *</Label>
                  <Input
                    id="dataEmissao"
                    type="date"
                    value={formData.dataEmissao}
                    onChange={(e) => setFormData({ ...formData, dataEmissao: e.target.value })}
                    className={fieldClass}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validade">Validade *</Label>
                  <Input
                    id="validade"
                    type="date"
                    value={formData.validade}
                    onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
                    className={cn(fieldClass, validadeAntesEmissao && 'border-red-300 focus-visible:ring-red-200')}
                    required
                  />
                  {validadeAntesEmissao ? (
                    <p className="flex items-center gap-1.5 text-xs text-red-600">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      A validade está antes da data de emissão.
                    </p>
                  ) : diasValidade !== null && diasValidade >= 0 ? (
                    <p className="text-xs text-slate-500">Prazo de {diasValidade} dia(s) após a emissão.</p>
                  ) : null}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="formaPagamento">Forma de pagamento</Label>
                  <Input
                    id="formaPagamento"
                    type="text"
                    value={formData.formaPagamento || ''}
                    onChange={(e) => setFormData({ ...formData, formaPagamento: e.target.value })}
                    placeholder="Ex.: PIX, boleto 30/60, cartão…"
                    className={fieldClass}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/90 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-[#203d7b]">
                <FileText className="h-5 w-5" />
                <CardTitle className="text-lg">Textos da proposta</CardTitle>
              </div>
              <CardDescription>Observações gerais e dados para pagamento que aparecem no documento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <textarea
                  id="observacoes"
                  value={formData.observacoes || ''}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className={textareaClass}
                  placeholder="Condições comerciais, escopo, entrega, garantias…"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dadosBancarios">Dados bancários</Label>
                <textarea
                  id="dadosBancarios"
                  value={formData.dadosBancarios || ''}
                  onChange={(e) => setFormData({ ...formData, dadosBancarios: e.target.value })}
                  className={textareaClass}
                  placeholder="Banco, agência, conta corrente, chave PIX…"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/90 shadow-sm">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#203d7b]">
                  <Package className="h-5 w-5" />
                  <CardTitle className="text-lg">Itens</CardTitle>
                </div>
                <CardDescription className="mt-1.5">
                  Linhas com categoria padrão ou personalizada. Nomes personalizados ficam salvos neste navegador para reutilizar em novas propostas.
                </CardDescription>
              </div>
              <Button type="button" onClick={adicionarItem} size="sm" className="shrink-0 gap-2 bg-[#203d7b] hover:bg-[#203d7b]/90">
                <Plus className="h-4 w-4" />
                Adicionar item
              </Button>
            </CardHeader>
            <CardContent>
              {formData.itens.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-14 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200/80">
                    <Package className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="max-w-sm text-sm font-medium text-slate-700">Nenhum item nesta proposta</p>
                  <p className="mt-1 max-w-sm text-xs text-slate-500">
                    Inclua geradores, frete, serviços ou cabos. Você pode adicionar quantas linhas precisar.
                  </p>
                  <Button type="button" variant="outline" className="mt-5 gap-2" onClick={adicionarItem}>
                    <Plus className="h-4 w-4" />
                    Primeiro item
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.itens.map((item, index) => {
                    const meta = resolveCategoriaVisual(item.categoria)
                    const IconCat = meta.icon
                    const sub = linhaSubtotal(item)
                    const selCategoria =
                      categoriaPersonalizadaFocadaIndex === index
                        ? OUTRA_CATEGORIA
                        : valorSelectCategoria(item.categoria, categoriasSalvas)
                    const mostrarCampoPersonalizado = selCategoria === OUTRA_CATEGORIA
                    return (
                      <motion.div
                        key={index}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.04]"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className={cn(
                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                                meta.boxClass
                              )}
                            >
                              <IconCat className={cn('h-4 w-4', meta.iconClass)} />
                            </span>
                            <span className="truncate text-sm font-semibold text-slate-800">Item {index + 1}</span>
                            <span className="hidden text-xs text-slate-500 sm:inline">— {meta.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="hidden text-sm font-semibold tabular-nums text-[#203d7b] sm:inline">
                              {formatBRL(sub)}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removerItem(index)}
                              className="h-9 w-9 shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                              title="Remover item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-4">
                          <div className="space-y-1.5 lg:col-span-3">
                            <Label className="text-xs text-slate-600">Categoria *</Label>
                            <select
                              value={selCategoria}
                              autoComplete="off"
                              onChange={(e) => {
                                const v = e.target.value
                                setCategoriaPersonalizadaFocadaIndex(null)
                                if (v === OUTRA_CATEGORIA) {
                                  atualizarItem(index, 'categoria', '')
                                } else {
                                  atualizarItem(index, 'categoria', v)
                                }
                              }}
                              className={fieldClass}
                            >
                              <optgroup label="Padrão">
                                <option value={CategoriaPropostaItem.GERADOR}>Gerador</option>
                                <option value={CategoriaPropostaItem.CABOS}>Cabos</option>
                                <option value={CategoriaPropostaItem.FRETE}>Frete</option>
                                <option value={CategoriaPropostaItem.SERVICO}>Serviço</option>
                              </optgroup>
                              {categoriasSalvas.length > 0 ? (
                                <optgroup label="Suas categorias">
                                  {categoriasSalvas.map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </optgroup>
                              ) : null}
                              <option value={OUTRA_CATEGORIA}>Outra (personalizada)…</option>
                            </select>
                            {mostrarCampoPersonalizado ? (
                              <Input
                                className={cn(fieldClass, 'mt-2')}
                                placeholder="Digite o nome da categoria"
                                maxLength={100}
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck={false}
                                name={`proposta-categoria-livre-${index}`}
                                value={item.categoria}
                                onChange={(e) => atualizarItem(index, 'categoria', e.target.value)}
                                onFocus={() => setCategoriaPersonalizadaFocadaIndex(index)}
                                onBlur={() => {
                                  const t = item.categoria.trim()
                                  if (t && !isCategoriaPreset(t)) {
                                    rememberCategoriaCustom(t)
                                    setCategoriasSalvas(loadCategoriasCustomSalvas())
                                  }
                                  window.setTimeout(() => {
                                    setCategoriaPersonalizadaFocadaIndex((cur) => (cur === index ? null : cur))
                                  }, 200)
                                }}
                              />
                            ) : null}
                          </div>
                          <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
                            <Label className="text-xs text-slate-600">Descrição *</Label>
                            <Input
                              value={item.descricao}
                              onChange={(e) => atualizarItem(index, 'descricao', e.target.value)}
                              placeholder="Ex.: Gerador 150 kVA trifásico"
                              className={fieldClass}
                              required
                            />
                          </div>
                          <div className="space-y-1.5 lg:col-span-2">
                            <Label className="text-xs text-slate-600">Qtd. *</Label>
                            <Input
                              type="number"
                              min={1}
                              value={item.quantidade}
                              onChange={(e) => atualizarItem(index, 'quantidade', parseInt(e.target.value, 10) || 1)}
                              className={fieldClass}
                              required
                            />
                          </div>
                          <div className="space-y-1.5 lg:col-span-2">
                            <Label className="text-xs text-slate-600">Valor unit. (R$) *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.valorUnitario}
                              onChange={(e) => {
                                const v = e.target.value
                                atualizarItem(index, 'valorUnitario', v === '' ? '' : parseFloat(v) || 0)
                              }}
                              className={fieldClass}
                              required
                            />
                          </div>
                          <div className="flex items-end justify-between gap-2 border-t border-slate-100 pt-3 lg:col-span-1 lg:border-0 lg:pt-0">
                            <span className="text-xs font-medium text-slate-500 lg:hidden">Subtotal</span>
                            <span className="text-sm font-bold tabular-nums text-[#203d7b] lg:hidden">{formatBRL(sub)}</span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end xl:hidden">
            <Button type="button" variant="outline" onClick={() => navigate('/propostas')} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="w-full gap-2 bg-[#203d7b] hover:bg-[#203d7b]/90 sm:w-auto">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {loading ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar proposta'}
            </Button>
          </div>
        </div>

        <aside className="mt-8 min-w-0 xl:mt-0">
          <div className="xl:sticky xl:top-[5.25rem] xl:z-[9]">
            <Card className="overflow-hidden border-slate-200/90 shadow-md ring-1 ring-slate-900/5">
              <div className="bg-gradient-to-br from-[#203d7b] to-[#2d4f94] px-5 py-4 text-white">
                <div className="flex items-center gap-2 text-white/90">
                  <Landmark className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Resumo</span>
                </div>
                <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight">{formatBRL(totalProposta)}</p>
                <p className="mt-1 text-xs text-white/80">
                  {formData.itens.length} {formData.itens.length === 1 ? 'item' : 'itens'}
                  {clienteLabel ? ` · ${clienteLabel}` : ''}
                </p>
              </div>
              <CardContent className="space-y-3 pt-5">
                <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-600">
                  <span className="font-medium text-slate-700">Tipo:</span>{' '}
                  {formData.tipo === TipoProposta.MENSAL ? 'Mensal' : 'Evento'}
                  <span className="mx-2 text-slate-300">|</span>
                  <span className="font-medium text-slate-700">Status:</span>{' '}
                  {{
                    [StatusProposta.RASCUNHO]: 'Rascunho',
                    [StatusProposta.ENVIADA]: 'Enviada',
                    [StatusProposta.APROVADA]: 'Aprovada',
                    [StatusProposta.RECUSADA]: 'Recusada',
                  }[formData.status]}
                </div>
                <div className="hidden flex-col gap-2 xl:flex">
                  <Button type="button" variant="outline" onClick={() => navigate('/propostas')} className="w-full">
                    Cancelar
                  </Button>
                  <Button type="submit" form={FORM_ID} disabled={loading} className="w-full gap-2 bg-[#203d7b] hover:bg-[#203d7b]/90">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {loading ? 'Salvando…' : isEdit ? 'Salvar' : 'Criar proposta'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>
      </form>
    </div>
  )
}
