import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  OrdemServicoRequest,
  TipoOrdemServico,
  StatusOrdemServico,
  Locacao,
  Gerador,
  Usuario,
  StatusLocacao,
} from '@/types'
import { ordemServicoService } from '@/services/ordemServicoService'
import { locacaoService } from '@/services/locacaoService'
import { usuarioService } from '@/services/usuarioService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  ClipboardList,
  MapPin,
  Wrench,
  Calendar,
  User,
  Gauge,
  FileText,
  Loader2,
  Save,
} from 'lucide-react'

const FORM_ID = 'form-ordem-servico'

const fieldClass =
  'flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#203d7b]/20 focus-visible:border-[#203d7b]/40'

const textareaClass =
  'flex min-h-[108px] w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#203d7b]/20 focus-visible:border-[#203d7b]/40'

const tipoLabels: Record<TipoOrdemServico, string> = {
  [TipoOrdemServico.ENTREGA]: 'Entrega',
  [TipoOrdemServico.RECOLHIMENTO]: 'Recolhimento',
  [TipoOrdemServico.MANUTENCAO]: 'Manutenção',
}

const statusLabels: Record<StatusOrdemServico, string> = {
  [StatusOrdemServico.PENDENTE]: 'Pendente',
  [StatusOrdemServico.EM_ANDAMENTO]: 'Em andamento',
  [StatusOrdemServico.CONCLUIDA]: 'Concluída',
  [StatusOrdemServico.CANCELADA]: 'Cancelada',
}

async function carregarTodasLocacoes(): Promise<Locacao[]> {
  const todas: Locacao[] = []
  let page = 0
  let last = false
  while (!last) {
    const res = await locacaoService.listar({ page, size: 200 })
    todas.push(...res.content)
    last = res.last
    page += 1
    if (page > 80) break
  }
  return todas
}

function formatDateBR(ymd: string) {
  if (!ymd) return '—'
  const p = ymd.split('T')[0].split('-')
  if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`
  return ymd
}

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
      const locacao = locacoes.find((l) => l.id === formData.locacaoId)
      if (locacao?.geradorId) {
        setFormData((prev) => ({ ...prev, geradorId: locacao.geradorId }))
      }
    }
  }, [formData.locacaoId, locacoes])

  useEffect(() => {
    if (formData.tipo === TipoOrdemServico.ENTREGA && formData.geradorId && !horimetroEditadoManualmente) {
      const gerador =
        geradores.find((g) => g.id === formData.geradorId) ||
        locacoes.find((l) => l.id === formData.locacaoId)?.gerador
      if (gerador?.horimetro !== undefined) {
        setFormData((prev) => ({ ...prev, horimetroInicial: gerador.horimetro }))
      }
    } else if (formData.tipo !== TipoOrdemServico.ENTREGA) {
      setFormData((prev) => ({ ...prev, horimetroInicial: undefined }))
      setHorimetroEditadoManualmente(false)
    }
  }, [formData.tipo, formData.geradorId, formData.locacaoId, geradores, locacoes, horimetroEditadoManualmente])

  useEffect(() => {
    setHorimetroEditadoManualmente(false)
  }, [formData.geradorId])

  const carregarDados = async () => {
    try {
      setLoadingData(true)
      const [locacoesData, usuariosData] = await Promise.all([carregarTodasLocacoes(), usuarioService.listarTodos()])
      setLocacoes(locacoesData)
      setTecnicos(usuariosData)

      const geradoresUnicos = new Map<string, Gerador>()
      locacoesData.forEach((locacao) => {
        if (locacao.gerador) {
          geradoresUnicos.set(locacao.gerador.id, locacao.gerador)
        }
      })
      setGeradores(Array.from(geradoresUnicos.values()))
    } catch (err: unknown) {
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
    } catch (err: unknown) {
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar ordem de serviço'
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  const locacaoSelecionada = useMemo(
    () => locacoes.find((l) => l.id === formData.locacaoId),
    [locacoes, formData.locacaoId]
  )
  const geradorSelecionado =
    geradores.find((g) => g.id === formData.geradorId) || locacaoSelecionada?.gerador
  const tecnicoSelecionado = tecnicos.find((t) => t.id === formData.tecnicoResponsavelId)

  const locacoesNoSelect = useMemo(() => {
    const ativas = locacoes.filter((l) => l.status === StatusLocacao.ATIVA)
    if (!formData.locacaoId) return ativas
    const sel = locacoes.find((l) => l.id === formData.locacaoId)
    if (!sel || ativas.some((l) => l.id === sel.id)) return ativas
    return [...ativas, sel]
  }, [locacoes, formData.locacaoId])

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Button variant="ghost" onClick={() => navigate('/ordens-servico')} className="w-fit gap-2 text-slate-600">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="min-w-0 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-[#203d7b]/[0.06] via-white to-slate-50/80 px-5 py-4 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {isEdit ? 'Editar ordem de serviço' : 'Nova ordem de serviço'}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {isEdit ? 'Atualize agendamento, equipe e horímetros.' : 'Vincule à locação, defina o tipo e o técnico responsável.'}
          </p>
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
                <MapPin className="h-5 w-5" />
                <CardTitle className="text-lg">Locação e equipamento</CardTitle>
              </div>
              <CardDescription>Selecione a locação ativa; o gerador é preenchido conforme o contrato.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="locacaoId">Locação *</Label>
                <select
                  id="locacaoId"
                  value={formData.locacaoId}
                  onChange={(e) => setFormData({ ...formData, locacaoId: e.target.value, geradorId: '' })}
                  className={fieldClass}
                  required
                >
                  <option value="">Selecione uma locação</option>
                  {locacoesNoSelect.map((locacao) => (
                    <option key={locacao.id} value={locacao.id}>
                      {locacao.numero} — {locacao.cliente?.nome ?? 'Cliente'}
                      {locacao.status !== StatusLocacao.ATIVA ? ` (${locacao.status})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="geradorId">Gerador *</Label>
                <select
                  id="geradorId"
                  value={formData.geradorId}
                  onChange={(e) => setFormData({ ...formData, geradorId: e.target.value })}
                  className={fieldClass}
                  required
                  disabled={!formData.locacaoId}
                >
                  <option value="">Selecione um gerador</option>
                  {geradorSelecionado ? (
                    <option value={geradorSelecionado.id}>
                      {geradorSelecionado.codigo} — {geradorSelecionado.modelo}
                    </option>
                  ) : null}
                </select>
                {locacaoSelecionada?.gerador ? (
                  <p className="text-xs text-slate-500">Gerador da locação: {locacaoSelecionada.gerador.codigo}</p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/90 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-[#203d7b]">
                <ClipboardList className="h-5 w-5" />
                <CardTitle className="text-lg">Serviço e equipe</CardTitle>
              </div>
              <CardDescription>Tipo de OS, técnico, data agendada e status.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => {
                    const novoTipo = e.target.value as TipoOrdemServico
                    setFormData({
                      ...formData,
                      tipo: novoTipo,
                      horimetroInicial:
                        novoTipo === TipoOrdemServico.ENTREGA ? formData.horimetroInicial : undefined,
                      horimetroFinal:
                        novoTipo === TipoOrdemServico.MANUTENCAO || novoTipo === TipoOrdemServico.RECOLHIMENTO
                          ? formData.horimetroFinal
                          : undefined,
                    })
                  }}
                  className={fieldClass}
                  required
                >
                  <option value={TipoOrdemServico.ENTREGA}>Entrega</option>
                  <option value={TipoOrdemServico.RECOLHIMENTO}>Recolhimento</option>
                  <option value={TipoOrdemServico.MANUTENCAO}>Manutenção</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tecnicoResponsavelId">Técnico responsável *</Label>
                <select
                  id="tecnicoResponsavelId"
                  value={formData.tecnicoResponsavelId}
                  onChange={(e) => setFormData({ ...formData, tecnicoResponsavelId: e.target.value })}
                  className={fieldClass}
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
                <Label htmlFor="dataAgendada">Data agendada *</Label>
                <Input
                  id="dataAgendada"
                  type="date"
                  value={formData.dataAgendada}
                  onChange={(e) => setFormData({ ...formData, dataAgendada: e.target.value })}
                  className={fieldClass}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusOrdemServico })}
                  className={fieldClass}
                  required
                >
                  <option value={StatusOrdemServico.PENDENTE}>Pendente</option>
                  <option value={StatusOrdemServico.EM_ANDAMENTO}>Em andamento</option>
                  <option value={StatusOrdemServico.CONCLUIDA}>Concluída</option>
                  <option value={StatusOrdemServico.CANCELADA}>Cancelada</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {(formData.tipo === TipoOrdemServico.ENTREGA ||
            formData.tipo === TipoOrdemServico.MANUTENCAO ||
            formData.tipo === TipoOrdemServico.RECOLHIMENTO) && (
            <Card className="border-slate-200/90 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 text-[#203d7b]">
                  <Gauge className="h-5 w-5" />
                  <CardTitle className="text-lg">Horímetro</CardTitle>
                </div>
                <CardDescription>Conforme o tipo de OS, informe leitura inicial ou final.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {formData.tipo === TipoOrdemServico.ENTREGA && (
                  <div className="space-y-2">
                    <Label htmlFor="horimetroInicial">Horímetro inicial *</Label>
                    <Input
                      id="horimetroInicial"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.horimetroInicial !== undefined ? formData.horimetroInicial : ''}
                      onChange={(e) => {
                        setHorimetroEditadoManualmente(true)
                        setFormData({
                          ...formData,
                          horimetroInicial: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }}
                      className={fieldClass}
                      required
                    />
                    <p className="text-xs text-slate-500">
                      Leitura na entrega.
                      {geradorSelecionado?.horimetro !== undefined ? (
                        <span className="ml-1 text-[#203d7b]">
                          Cadastro do gerador: {geradorSelecionado.horimetro.toLocaleString('pt-BR')} h
                        </span>
                      ) : null}
                    </p>
                  </div>
                )}
                {(formData.tipo === TipoOrdemServico.MANUTENCAO ||
                  formData.tipo === TipoOrdemServico.RECOLHIMENTO) && (
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="horimetroFinal">Horímetro final *</Label>
                    <Input
                      id="horimetroFinal"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.horimetroFinal ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          horimetroFinal: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      className={fieldClass}
                      required
                    />
                    <p className="text-xs text-slate-500">
                      {formData.tipo === TipoOrdemServico.MANUTENCAO
                        ? 'Após a manutenção (atualiza o gerador).'
                        : 'No recolhimento (atualiza o gerador).'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="border-slate-200/90 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-[#203d7b]">
                <FileText className="h-5 w-5" />
                <CardTitle className="text-lg">Observações</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                id="observacoes"
                value={formData.observacoes || ''}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value || undefined })}
                className={textareaClass}
                placeholder="Detalhes do atendimento, pendências, acesso ao local…"
              />
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end xl:hidden">
            <Button type="button" variant="outline" onClick={() => navigate('/ordens-servico')} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="w-full gap-2 bg-[#203d7b] hover:bg-[#203d7b]/90 sm:w-auto">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {loading ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar OS'}
            </Button>
          </div>
        </div>

        <aside className="mt-8 min-w-0 xl:mt-0">
          <div className="xl:sticky xl:top-[5.25rem] xl:z-[9]">
            <Card className="overflow-hidden border-slate-200/90 shadow-md ring-1 ring-slate-900/5">
              <div className="bg-gradient-to-br from-[#203d7b] to-[#2d4f94] px-5 py-4 text-white">
                <div className="flex items-center gap-2 text-white/90">
                  <Wrench className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Resumo</span>
                </div>
                <p className="mt-3 text-lg font-bold leading-snug">{tipoLabels[formData.tipo]}</p>
                <p className="mt-2 text-sm text-white/90">
                  {locacaoSelecionada ? (
                    <>
                      <span className="font-semibold">Loc. {locacaoSelecionada.numero}</span>
                      {locacaoSelecionada.cliente?.nome ? (
                        <span className="mt-1 block text-xs text-white/80">{locacaoSelecionada.cliente.nome}</span>
                      ) : null}
                    </>
                  ) : (
                    <span className="text-white/80">Nenhuma locação selecionada</span>
                  )}
                </p>
                {geradorSelecionado ? (
                  <p className="mt-2 text-xs text-white/80">
                    {geradorSelecionado.codigo} · {geradorSelecionado.modelo}
                  </p>
                ) : null}
              </div>
              <CardContent className="space-y-3 pt-5">
                <div className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-600">
                  <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <div>
                    <span className="font-medium text-slate-700">Agendada:</span> {formatDateBR(formData.dataAgendada)}
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-600">
                  <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <div>
                    <span className="font-medium text-slate-700">Técnico:</span>{' '}
                    {tecnicoSelecionado?.nome ?? '—'}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-600">
                  <span className="font-medium text-slate-700">Status:</span> {statusLabels[formData.status]}
                </div>
                <div className="hidden flex-col gap-2 xl:flex">
                  <Button type="button" variant="outline" onClick={() => navigate('/ordens-servico')} className="w-full">
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    form={FORM_ID}
                    disabled={loading}
                    className="w-full gap-2 bg-[#203d7b] hover:bg-[#203d7b]/90"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {loading ? 'Salvando…' : isEdit ? 'Salvar' : 'Criar OS'}
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
