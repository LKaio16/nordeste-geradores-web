import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { OrdemServicoRequest, TipoOrdemServico, StatusOrdemServico, Locacao, Gerador, Usuario } from '@/types'
import { ordemServicoService } from '@/services/ordemServicoService'
import { locacaoService } from '@/services/locacaoService'
import { usuarioService } from '@/services/usuarioService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export function OrdemServicoFormPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const locacaoIdFromQuery = searchParams.get('locacaoId')

  const [formData, setFormData] = useState<OrdemServicoRequest>({
    tipo: TipoOrdemServico.ENTREGA,
    locacaoId: locacaoIdFromQuery || '',
    geradorId: '',
    tecnicoResponsavelId: '',
    dataAgendada: new Date().toISOString().split('T')[0],
    status: StatusOrdemServico.PENDENTE,
    observacoes: undefined,
    horimetroInicial: undefined,
    horimetroFinal: undefined,
    assinaturaCliente: false,
    assinaturaDigital: undefined,
  })

  const [locacoes, setLocacoes] = useState<Locacao[]>([])
  const [geradores, setGeradores] = useState<Gerador[]>([])
  const [tecnicos, setTecnicos] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [horimetroEditadoManualmente, setHorimetroEditadoManualmente] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    if (isEdit && id) {
      carregarOrdemServico(id)
    }
  }, [id, isEdit])

  useEffect(() => {
    if (formData.locacaoId) {
      const locacao = locacoes.find(l => l.id === formData.locacaoId)
      if (locacao && locacao.geradorId) {
        setFormData(prev => ({ ...prev, geradorId: locacao.geradorId }))
      }
    }
  }, [formData.locacaoId, locacoes])

  // Preencher horímetro inicial quando gerador for selecionado e tipo for ENTREGA
  useEffect(() => {
    if (formData.tipo === TipoOrdemServico.ENTREGA && formData.geradorId && !horimetroEditadoManualmente) {
      const gerador = geradores.find(g => g.id === formData.geradorId) || 
                      locacoes.find(l => l.id === formData.locacaoId)?.gerador
      if (gerador && gerador.horimetro !== undefined) {
        // Preencher automaticamente com o horímetro do gerador
        setFormData(prev => ({ ...prev, horimetroInicial: gerador.horimetro }))
      }
    } else if (formData.tipo !== TipoOrdemServico.ENTREGA) {
      // Limpar horímetro inicial se o tipo não for ENTREGA
      setFormData(prev => ({ ...prev, horimetroInicial: undefined }))
      setHorimetroEditadoManualmente(false)
    }
  }, [formData.tipo, formData.geradorId, formData.locacaoId, geradores, locacoes, horimetroEditadoManualmente])

  // Resetar flag quando gerador mudar
  useEffect(() => {
    setHorimetroEditadoManualmente(false)
  }, [formData.geradorId])

  const carregarDados = async () => {
    try {
      setLoadingData(true)
      const [locacoesData, usuariosData] = await Promise.all([
        locacaoService.listar(),
        usuarioService.listar(),
      ])
      setLocacoes(locacoesData)
      setTecnicos(usuariosData)
      
      // Carregar geradores das locações
      const geradoresUnicos = new Map<string, Gerador>()
      locacoesData.forEach(locacao => {
        if (locacao.gerador) {
          geradoresUnicos.set(locacao.gerador.id, locacao.gerador)
        }
      })
      setGeradores(Array.from(geradoresUnicos.values()))
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err)
      alert('Erro ao carregar dados')
    } finally {
      setLoadingData(false)
    }
  }

  const carregarOrdemServico = async (osId: string) => {
    try {
      setLoadingData(true)
      const os = await ordemServicoService.buscarPorId(osId)
      setFormData({
        tipo: os.tipo,
        locacaoId: os.locacaoId,
        geradorId: os.geradorId,
        tecnicoResponsavelId: os.tecnicoResponsavelId,
        dataAgendada: os.dataAgendada.split('T')[0],
        status: os.status,
        observacoes: os.observacoes,
        horimetroInicial: os.horimetroInicial,
        horimetroFinal: os.horimetroFinal,
        assinaturaCliente: os.assinaturaCliente,
        assinaturaDigital: os.assinaturaDigital,
      })
    } catch (err: any) {
      console.error('Erro ao carregar ordem de serviço:', err)
      alert('Erro ao carregar ordem de serviço')
      navigate('/ordens-servico')
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (isEdit && id) {
        await ordemServicoService.atualizar(id, formData)
      } else {
        await ordemServicoService.criar(formData)
      }
      navigate('/ordens-servico')
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar ordem de serviço')
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

  const locacaoSelecionada = locacoes.find(l => l.id === formData.locacaoId)
  const geradorSelecionado = geradores.find(g => g.id === formData.geradorId) || locacaoSelecionada?.gerador

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/ordens-servico')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isEdit ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
          </h1>
          <p className="text-slate-600 mt-1">
            {isEdit ? 'Edite os dados da ordem de serviço' : 'Cadastre uma nova ordem de serviço'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Ordem de Serviço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="locacaoId">Locação *</Label>
                <select
                  id="locacaoId"
                  value={formData.locacaoId}
                  onChange={(e) => setFormData({ ...formData, locacaoId: e.target.value, geradorId: '' })}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                  required
                >
                  <option value="">Selecione uma locação</option>
                  {locacoes
                    .filter(l => l.status === 'ATIVA')
                    .map((locacao) => (
                      <option key={locacao.id} value={locacao.id}>
                        {locacao.numero} - {locacao.cliente?.nome}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="geradorId">Gerador *</Label>
                <select
                  id="geradorId"
                  value={formData.geradorId}
                  onChange={(e) => setFormData({ ...formData, geradorId: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                  required
                  disabled={!formData.locacaoId}
                >
                  <option value="">Selecione um gerador</option>
                  {geradorSelecionado && (
                    <option value={geradorSelecionado.id}>
                      {geradorSelecionado.codigo} - {geradorSelecionado.modelo}
                    </option>
                  )}
                </select>
                {locacaoSelecionada && locacaoSelecionada.gerador && (
                  <p className="text-xs text-slate-500 mt-1">
                    Gerador da locação: {locacaoSelecionada.gerador.codigo}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => {
                    const novoTipo = e.target.value as TipoOrdemServico
                    // Limpar horímetros ao mudar o tipo
                    setFormData({ 
                      ...formData, 
                      tipo: novoTipo,
                      horimetroInicial: novoTipo === TipoOrdemServico.ENTREGA ? formData.horimetroInicial : undefined,
                      horimetroFinal: (novoTipo === TipoOrdemServico.MANUTENCAO || novoTipo === TipoOrdemServico.RECOLHIMENTO) ? formData.horimetroFinal : undefined,
                    })
                  }}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                  required
                >
                  <option value={TipoOrdemServico.ENTREGA}>Entrega</option>
                  <option value={TipoOrdemServico.RECOLHIMENTO}>Recolhimento</option>
                  <option value={TipoOrdemServico.MANUTENCAO}>Manutenção</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tecnicoResponsavelId">Técnico Responsável *</Label>
                <select
                  id="tecnicoResponsavelId"
                  value={formData.tecnicoResponsavelId}
                  onChange={(e) => setFormData({ ...formData, tecnicoResponsavelId: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                  required
                >
                  <option value="">Selecione um técnico</option>
                  {tecnicos.map((tecnico) => (
                    <option key={tecnico.id} value={tecnico.id}>
                      {tecnico.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataAgendada">Data Agendada *</Label>
                <Input
                  id="dataAgendada"
                  type="date"
                  value={formData.dataAgendada}
                  onChange={(e) => setFormData({ ...formData, dataAgendada: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusOrdemServico })}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                  required
                >
                  <option value={StatusOrdemServico.PENDENTE}>Pendente</option>
                  <option value={StatusOrdemServico.EM_ANDAMENTO}>Em Andamento</option>
                  <option value={StatusOrdemServico.CONCLUIDA}>Concluída</option>
                  <option value={StatusOrdemServico.CANCELADA}>Cancelada</option>
                </select>
              </div>

              {formData.tipo === TipoOrdemServico.ENTREGA && (
                <div className="space-y-2">
                  <Label htmlFor="horimetroInicial">Horímetro Inicial *</Label>
                  <Input
                    id="horimetroInicial"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.horimetroInicial !== undefined ? formData.horimetroInicial : ''}
                    onChange={(e) => {
                      setHorimetroEditadoManualmente(true)
                      setFormData({ ...formData, horimetroInicial: e.target.value ? parseFloat(e.target.value) : undefined })
                    }}
                    required={formData.tipo === TipoOrdemServico.ENTREGA}
                  />
                  <p className="text-xs text-slate-500">
                    Horímetro do gerador no momento da entrega
                    {geradorSelecionado && geradorSelecionado.horimetro !== undefined && (
                      <span className="ml-2 text-blue-600">
                        (Atual do gerador: {geradorSelecionado.horimetro.toLocaleString('pt-BR')}h)
                      </span>
                    )}
                  </p>
                </div>
              )}

              {(formData.tipo === TipoOrdemServico.MANUTENCAO || formData.tipo === TipoOrdemServico.RECOLHIMENTO) && (
                <div className="space-y-2">
                  <Label htmlFor="horimetroFinal">Horímetro Final *</Label>
                  <Input
                    id="horimetroFinal"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.horimetroFinal || ''}
                    onChange={(e) => setFormData({ ...formData, horimetroFinal: e.target.value ? parseFloat(e.target.value) : undefined })}
                    required={formData.tipo === TipoOrdemServico.MANUTENCAO || formData.tipo === TipoOrdemServico.RECOLHIMENTO}
                  />
                  <p className="text-xs text-slate-500">
                    {formData.tipo === TipoOrdemServico.MANUTENCAO 
                      ? 'Horímetro do gerador após a manutenção (será atualizado no gerador)'
                      : 'Horímetro do gerador no momento do recolhimento (será atualizado no gerador)'}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <textarea
                id="observacoes"
                value={formData.observacoes || ''}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value || undefined })}
                className="w-full min-h-[100px] px-3 py-2 rounded-md border border-slate-200 bg-white"
                placeholder="Observações sobre a ordem de serviço..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Salvando...' : 'Salvar Ordem de Serviço'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/ordens-servico')}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

