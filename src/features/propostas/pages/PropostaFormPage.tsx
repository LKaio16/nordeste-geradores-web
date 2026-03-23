import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PropostaRequest, TipoProposta, StatusProposta, CategoriaPropostaItem, Cliente, PropostaItemRequest } from '@/types'
import { propostaService } from '@/services/propostaService'
import { clienteService } from '@/services/clienteService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

export function PropostaFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const [formData, setFormData] = useState<PropostaRequest>({
    clienteId: '',
    tipo: TipoProposta.MENSAL,
    dataEmissao: new Date().toISOString().split('T')[0],
    validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
    observacoes: '',
    dadosBancarios: '',
    status: StatusProposta.RASCUNHO,
    formaPagamento: '',
    itens: [],
  })

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

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
    } catch (err: any) {
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
        clienteId: proposta.cliente.id,
        tipo: proposta.tipo,
        dataEmissao: proposta.dataEmissao.split('T')[0],
        validade: proposta.validade.split('T')[0],
        observacoes: proposta.observacoes || '',
        dadosBancarios: proposta.dadosBancarios || '',
        status: proposta.status,
        formaPagamento: proposta.formaPagamento || '',
        itens: proposta.itens.map(item => ({
          categoria: item.categoria,
          descricao: item.descricao,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
        })),
      })
    } catch (err: any) {
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

    try {
      setLoading(true)
      if (isEdit && id) {
        await propostaService.atualizar(id, formData)
      } else {
        await propostaService.criar(formData)
      }
      navigate('/propostas')
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar proposta')
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
          valorUnitario: 0,
        },
      ],
    })
  }

  const removerItem = (index: number) => {
    setFormData({
      ...formData,
      itens: formData.itens.filter((_, i) => i !== index),
    })
  }

  const atualizarItem = (index: number, campo: keyof PropostaItemRequest, valor: any) => {
    const novosItens = [...formData.itens]
    novosItens[index] = {
      ...novosItens[index],
      [campo]: valor,
    }
    
    // Calcular valor total do item
    if (campo === 'quantidade' || campo === 'valorUnitario') {
      const quantidade = campo === 'quantidade' ? valor : novosItens[index].quantidade
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

  const calcularTotal = () => {
    return formData.itens.reduce((total, item) => {
      return total + (item.quantidade * item.valorUnitario)
    }, 0)
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#203d7b] mx-auto mb-4"></div>
          <p className="text-slate-500">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/propostas')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isEdit ? 'Editar Proposta' : 'Nova Proposta'}
          </h1>
          <p className="text-slate-600 mt-1">
            {isEdit ? 'Edite os dados da proposta' : 'Preencha os dados da proposta'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cliente */}
          <div className="space-y-2">
            <Label htmlFor="clienteId">Cliente *</Label>
            <select
              id="clienteId"
              value={formData.clienteId}
              onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              required
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome} - {cliente.cnpj}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo *</Label>
            <select
              id="tipo"
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoProposta })}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              required
            >
              <option value={TipoProposta.MENSAL}>Mensal</option>
              <option value={TipoProposta.EVENTO}>Evento</option>
            </select>
          </div>

          {/* Data Emissão */}
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

          {/* Validade */}
          <div className="space-y-2">
            <Label htmlFor="validade">Validade *</Label>
            <Input
              id="validade"
              type="date"
              value={formData.validade}
              onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
              required
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusProposta })}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              required
            >
              <option value={StatusProposta.RASCUNHO}>Rascunho</option>
              <option value={StatusProposta.ENVIADA}>Enviada</option>
              <option value={StatusProposta.APROVADA}>Aprovada</option>
              <option value={StatusProposta.RECUSADA}>Recusada</option>
            </select>
          </div>

          {/* Forma de Pagamento */}
          <div className="space-y-2">
            <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
            <Input
              id="formaPagamento"
              type="text"
              value={formData.formaPagamento || ''}
              onChange={(e) => setFormData({ ...formData, formaPagamento: e.target.value })}
              placeholder="Ex: Boleto, PIX, etc."
            />
          </div>
        </div>

        {/* Observações */}
        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações</Label>
          <textarea
            id="observacoes"
            value={formData.observacoes || ''}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            className="flex min-h-[100px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            placeholder="Digite as observações da proposta..."
          />
        </div>

        {/* Dados bancários */}
        <div className="space-y-2">
          <Label htmlFor="dadosBancarios">Dados bancários</Label>
          <textarea
            id="dadosBancarios"
            value={formData.dadosBancarios || ''}
            onChange={(e) => setFormData({ ...formData, dadosBancarios: e.target.value })}
            className="flex min-h-[100px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            placeholder="Banco, agência, conta, PIX, etc."
          />
        </div>

        {/* Itens */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Itens da Proposta</CardTitle>
              <Button type="button" onClick={adicionarItem} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {formData.itens.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Nenhum item adicionado. Clique em "Adicionar Item" para começar.</p>
            ) : (
              <div className="space-y-4">
                {formData.itens.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-12 gap-3 p-4 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <div className="col-span-12 md:col-span-3">
                      <Label>Categoria *</Label>
                      <select
                        value={item.categoria}
                        onChange={(e) => atualizarItem(index, 'categoria', e.target.value as CategoriaPropostaItem)}
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                        required
                      >
                        <option value={CategoriaPropostaItem.GERADOR}>Gerador</option>
                        <option value={CategoriaPropostaItem.CABOS}>Cabos</option>
                        <option value={CategoriaPropostaItem.FRETE}>Frete</option>
                        <option value={CategoriaPropostaItem.SERVICO}>Serviço</option>
                      </select>
                    </div>
                    <div className="col-span-12 md:col-span-4">
                      <Label>Descrição *</Label>
                      <Input
                        value={item.descricao}
                        onChange={(e) => atualizarItem(index, 'descricao', e.target.value)}
                        placeholder="Ex: Gerador 150KVA"
                        required
                      />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <Label>Quantidade *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) => atualizarItem(index, 'quantidade', parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <Label>Valor Unitário *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.valorUnitario}
                        onChange={(e) => atualizarItem(index, 'valorUnitario', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div className="col-span-12 md:col-span-1 flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removerItem(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-slate-900">Valor Total:</span>
              <span className="text-2xl font-bold text-[#203d7b]">
                R$ {calcularTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/propostas')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar'} Proposta
          </Button>
        </div>
      </form>
    </div>
  )
}





