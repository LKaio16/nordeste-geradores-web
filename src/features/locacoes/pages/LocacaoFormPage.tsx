import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LocacaoRequest, TipoLocacao, StatusLocacao, Cliente, Gerador } from '@/types'
import { locacaoService } from '@/services/locacaoService'
import { clienteService } from '@/services/clienteService'
import { geradorService } from '@/services/geradorService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export function LocacaoFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const [modoClienteAvulso, setModoClienteAvulso] = useState(false)

  const [formData, setFormData] = useState<LocacaoRequest>({
    clienteId: undefined,
    clienteAvulsoNome: undefined,
    geradorIds: [],
    tipo: TipoLocacao.MENSAL,
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: undefined,
    valorMensal: 0,
    status: StatusLocacao.ATIVA,
    observacoes: undefined,
  })

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [geradores, setGeradores] = useState<Gerador[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    if (isEdit && id) {
      carregarLocacao(id)
    }
  }, [id, isEdit])

  const carregarDados = async () => {
    try {
      setLoadingData(true)
      const [clientesData, geradoresData] = await Promise.all([
        clienteService.listarTodos(),
        geradorService.listarTodos(),
      ])
      setClientes(clientesData)
      setGeradores(geradoresData)
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err)
      alert('Erro ao carregar dados')
    } finally {
      setLoadingData(false)
    }
  }

  const carregarLocacao = async (locacaoId: string) => {
    try {
      setLoadingData(true)
      const locacao = await locacaoService.buscarPorId(locacaoId)
      const avulso = Boolean(locacao.clienteAvulsoNome?.trim())
      setModoClienteAvulso(avulso)
      setFormData({
        clienteId: avulso ? undefined : locacao.clienteId,
        clienteAvulsoNome: avulso ? locacao.clienteAvulsoNome : undefined,
        geradorIds: locacao.geradorIds?.length ? locacao.geradorIds : locacao.geradorId ? [locacao.geradorId] : [],
        tipo: locacao.tipo,
        dataInicio: locacao.dataInicio.split('T')[0],
        dataFim: locacao.dataFim ? locacao.dataFim.split('T')[0] : undefined,
        valorMensal: locacao.valorMensal || 0,
        status: locacao.status,
        observacoes: locacao.observacoes,
      })
    } catch (err: any) {
      console.error('Erro ao carregar locação:', err)
      alert('Erro ao carregar locação')
      navigate('/locacoes')
    } finally {
      setLoadingData(false)
    }
  }

  const toggleGerador = (geradorId: string) => {
    setFormData((prev) => {
      const ids = prev.geradorIds.includes(geradorId)
        ? prev.geradorIds.filter((id) => id !== geradorId)
        : [...prev.geradorIds, geradorId]
      return { ...prev, geradorIds: ids }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.geradorIds.length === 0) {
      alert('Selecione ao menos um gerador.')
      return
    }
    if (modoClienteAvulso) {
      const nome = formData.clienteAvulsoNome?.trim()
      if (!nome) {
        alert('Informe o nome do contratante avulso.')
        return
      }
    } else if (!formData.clienteId) {
      alert('Selecione um cliente cadastrado ou use nome avulso.')
      return
    }

    const payload: LocacaoRequest = {
      ...formData,
      clienteId: modoClienteAvulso ? undefined : formData.clienteId,
      clienteAvulsoNome: modoClienteAvulso ? formData.clienteAvulsoNome?.trim() : undefined,
    }

    try {
      setLoading(true)
      if (isEdit && id) {
        await locacaoService.atualizar(id, payload)
      } else {
        await locacaoService.criar(payload)
      }
      navigate('/locacoes')
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar locação')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/locacoes')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isEdit ? 'Editar Locação' : 'Nova Locação'}
          </h1>
          <p className="text-slate-600 mt-1">
            {isEdit ? 'Edite os dados da locação' : 'Cadastre uma nova locação'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Locação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Contratante *</Label>
                <div className="flex flex-wrap gap-4 text-sm">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      checked={!modoClienteAvulso}
                      onChange={() => {
                        setModoClienteAvulso(false)
                        setFormData((p) => ({ ...p, clienteAvulsoNome: undefined }))
                      }}
                    />
                    Cliente cadastrado
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      checked={modoClienteAvulso}
                      onChange={() => {
                        setModoClienteAvulso(true)
                        setFormData((p) => ({ ...p, clienteId: undefined }))
                      }}
                    />
                    Nome avulso (sem cadastro)
                  </label>
                </div>
                {modoClienteAvulso ? (
                  <Input
                    id="clienteAvulsoNome"
                    placeholder="Nome do contratante *"
                    value={formData.clienteAvulsoNome ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, clienteAvulsoNome: e.target.value, clienteId: undefined })
                    }
                    required
                    className="mt-2"
                  />
                ) : (
                  <select
                    id="clienteId"
                    value={formData.clienteId ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        clienteId: e.target.value || undefined,
                        clienteAvulsoNome: undefined,
                      })
                    }
                    className="mt-2 w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                    required
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Geradores *</Label>
                <p className="text-xs text-slate-500">Marque um ou mais equipamentos desta locação.</p>
                <div className="max-h-48 overflow-y-auto rounded-md border border-slate-200 bg-white p-3 space-y-2">
                  {geradores
                    .filter(
                      (g) =>
                        g.status === 'DISPONIVEL' || formData.geradorIds.includes(g.id),
                    )
                    .map((gerador) => (
                      <label
                        key={gerador.id}
                        className="flex cursor-pointer items-center gap-2 text-sm text-slate-800"
                      >
                        <input
                          type="checkbox"
                          checked={formData.geradorIds.includes(gerador.id)}
                          onChange={() => toggleGerador(gerador.id)}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                        <span>
                          {gerador.codigo} — {gerador.modelo}
                          {gerador.status !== 'DISPONIVEL' ? ` (${gerador.status})` : ''}
                        </span>
                      </label>
                    ))}
                </div>
                {formData.geradorIds.length > 0 ? (
                  <p className="text-xs text-slate-600">
                    Selecionados: {formData.geradorIds.length} gerador(es)
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoLocacao })}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                  required
                >
                  <option value={TipoLocacao.MENSAL}>Mensal</option>
                  <option value={TipoLocacao.DIARIA}>Diária</option>
                  <option value={TipoLocacao.EVENTO}>Evento</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusLocacao })}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                  required
                >
                  <option value={StatusLocacao.ATIVA}>Ativa</option>
                  <option value={StatusLocacao.ENCERRADA}>Encerrada</option>
                  <option value={StatusLocacao.CANCELADA}>Cancelada</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data de Início *</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataFim">Data de Fim</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={formData.dataFim || ''}
                  onChange={(e) => setFormData({ ...formData, dataFim: e.target.value || undefined })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorMensal">
                  {formData.tipo === TipoLocacao.MENSAL 
                    ? 'Valor Mensal (R$) *'
                    : formData.tipo === TipoLocacao.DIARIA
                    ? 'Valor Diário (R$) *'
                    : 'Valor do Evento (R$) *'}
                </Label>
                <Input
                  id="valorMensal"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valorMensal}
                  onChange={(e) => setFormData({ ...formData, valorMensal: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <textarea
                id="observacoes"
                value={formData.observacoes || ''}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value || undefined })}
                className="w-full min-h-[100px] px-3 py-2 rounded-md border border-slate-200 bg-white"
                placeholder="Observações sobre a locação..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Salvando...' : 'Salvar Locação'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/locacoes')}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

