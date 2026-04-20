import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Locacao,
  StatusLocacao,
  TipoLocacao,
  OrdemServico,
  TipoOrdemServico,
  StatusOrdemServico,
} from '@/types'
import { locacaoService } from '@/services/locacaoService'
import { ordemServicoService } from '@/services/ordemServicoService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/utils/cn'
import {
  ArrowLeft,
  Edit,
  Calendar,
  Zap,
  User,
  DollarSign,
  FileText,
  CheckCircle2,
  ClipboardList,
  Plus,
  Eye,
  Clock,
  Loader2,
  ExternalLink,
  FileDown,
} from 'lucide-react'
import { motion } from 'framer-motion'

function DetField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-1 text-sm font-semibold text-slate-900">{children}</div>
    </div>
  )
}

function valorPrincipalLocacao(loc: Locacao): { label: string; valor: number } | null {
  if (loc.tipo === TipoLocacao.MENSAL && loc.valorMensal != null) {
    return { label: 'Valor mensal', valor: loc.valorMensal }
  }
  if (loc.tipo === TipoLocacao.DIARIA && loc.valorDiario != null) {
    return { label: 'Valor diário', valor: loc.valorDiario }
  }
  if (loc.tipo === TipoLocacao.EVENTO && loc.valorTotal != null) {
    return { label: 'Valor do evento', valor: loc.valorTotal }
  }
  if (loc.valorTotal != null) return { label: 'Valor total', valor: loc.valorTotal }
  if (loc.valorMensal != null) return { label: 'Valor', valor: loc.valorMensal }
  if (loc.valorDiario != null) return { label: 'Valor diário', valor: loc.valorDiario }
  return null
}

export function LocacaoDetalhesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [locacao, setLocacao] = useState<Locacao | null>(null)
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingOS, setLoadingOS] = useState(false)
  const [error, setError] = useState('')
  const [gerandoPdf, setGerandoPdf] = useState(false)

  useEffect(() => {
    if (id) {
      carregarLocacao(id)
      carregarOrdensServico(id)
    }
  }, [id])

  const carregarLocacao = async (locacaoId: string) => {
    try {
      setLoading(true)
      const data = await locacaoService.buscarPorId(locacaoId)
      setLocacao(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar locação'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const carregarOrdensServico = async (locacaoId: string) => {
    try {
      setLoadingOS(true)
      const data = await ordemServicoService.buscarPorLocacaoId(locacaoId)
      setOrdensServico(data)
    } catch (err: unknown) {
      console.error('Erro ao carregar ordens de serviço:', err)
    } finally {
      setLoadingOS(false)
    }
  }

  const handleBaixarPdf = async () => {
    if (!id || !locacao) return
    try {
      setGerandoPdf(true)
      const blob = await locacaoService.gerarPdfRelatorio(id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const safe = locacao.numero.replace(/[^\w.-]+/g, '_')
      link.download = `locacao-${safe}-relatorio.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao gerar PDF'
      alert(msg)
    } finally {
      setGerandoPdf(false)
    }
  }

  const handleFinalizar = async () => {
    if (!id) return
    if (window.confirm('Tem certeza que deseja finalizar esta locação?')) {
      try {
        await locacaoService.finalizar(id)
        await carregarLocacao(id)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro ao finalizar locação'
        alert(msg)
      }
    }
  }

  const formatStatus = (status: StatusLocacao) => {
    const statusMap: Record<StatusLocacao, { label: string; color: string }> = {
      [StatusLocacao.ATIVA]: { label: 'Ativa', color: 'bg-emerald-100 text-emerald-800' },
      [StatusLocacao.ENCERRADA]: { label: 'Encerrada', color: 'bg-sky-100 text-sky-800' },
      [StatusLocacao.CANCELADA]: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
    }
    return statusMap[status] || { label: status, color: 'bg-slate-100 text-slate-800' }
  }

  const formatTipo = (tipo: TipoLocacao) => {
    const tipoMap: Record<TipoLocacao, string> = {
      [TipoLocacao.MENSAL]: 'Mensal',
      [TipoLocacao.DIARIA]: 'Diária',
      [TipoLocacao.EVENTO]: 'Evento',
    }
    return tipoMap[tipo] || tipo
  }

  const formatDate = (date: string) => {
    if (!date) return '—'
    const parts = date.split('T')[0].split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const formatTipoOS = (tipo: TipoOrdemServico) => {
    const tipoMap: Record<TipoOrdemServico, string> = {
      [TipoOrdemServico.ENTREGA]: 'Entrega',
      [TipoOrdemServico.RECOLHIMENTO]: 'Recolhimento',
      [TipoOrdemServico.MANUTENCAO]: 'Manutenção',
      [TipoOrdemServico.DIARIO]: 'Diário',
    }
    return tipoMap[tipo] || tipo
  }

  const formatStatusOS = (status: StatusOrdemServico) => {
    const statusMap: Record<StatusOrdemServico, { label: string; color: string }> = {
      [StatusOrdemServico.PENDENTE]: { label: 'Pendente', color: 'bg-amber-100 text-amber-800' },
      [StatusOrdemServico.EM_ANDAMENTO]: { label: 'Em andamento', color: 'bg-sky-100 text-sky-800' },
      [StatusOrdemServico.CONCLUIDA]: { label: 'Concluída', color: 'bg-emerald-100 text-emerald-800' },
      [StatusOrdemServico.CANCELADA]: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
    }
    return statusMap[status] || { label: status, color: 'bg-slate-100 text-slate-800' }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[#203d7b]" />
          <p className="text-slate-500">Carregando locação…</p>
        </div>
      </div>
    )
  }

  if (error || !locacao) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/locacoes')} className="gap-2 text-slate-600">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Card className="border-slate-200/90">
          <CardContent className="py-12 text-center">
            <p className="text-red-600">{error || 'Locação não encontrada'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusInfo = formatStatus(locacao.status)
  const valorInfo = valorPrincipalLocacao(locacao)

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button variant="ghost" onClick={() => navigate('/locacoes')} className="w-fit gap-2 text-slate-600">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="min-w-0 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-[#203d7b]/[0.07] via-white to-slate-50/90 px-5 py-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 gap-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{locacao.numero}</h1>
              <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', statusInfo.color)}>
                {statusInfo.label}
              </span>
              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                {formatTipo(locacao.tipo)}
              </span>
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                Início <span className="font-medium text-slate-800">{formatDate(locacao.dataInicio)}</span>
              </span>
              {locacao.dataFim ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-slate-400">→</span>
                  Fim <span className="font-medium text-slate-800">{formatDate(locacao.dataFim)}</span>
                </span>
              ) : (
                <span className="text-slate-500">Sem data de fim</span>
              )}
            </p>
            {valorInfo ? (
              <p className="mt-2 flex items-center gap-2 text-lg font-bold tabular-nums text-[#203d7b]">
                <DollarSign className="h-5 w-5 shrink-0 opacity-80" />
                {valorInfo.label}: R${' '}
                {valorInfo.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
            disabled={gerandoPdf}
            onClick={() => void handleBaixarPdf()}
          >
            {gerandoPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            PDF completo
          </Button>
          {locacao.status === StatusLocacao.ATIVA ? (
            <Button onClick={handleFinalizar} variant="outline" className="gap-2 border-emerald-200 text-emerald-800 hover:bg-emerald-50">
              <CheckCircle2 className="h-4 w-4" />
              Finalizar locação
            </Button>
          ) : null}
          <Button onClick={() => navigate(`/locacoes/${id}/editar`)} className="gap-2 bg-[#203d7b] hover:bg-[#203d7b]/90">
            <Edit className="h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="grid gap-4 lg:grid-cols-3"
      >
        <Card className="border-slate-200/90 shadow-sm lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-[#203d7b]">
              <Calendar className="h-5 w-5" />
              <CardTitle className="text-lg">Contrato</CardTitle>
            </div>
            <CardDescription>Prazos e valores conforme o tipo de locação.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <DetField label="Número">{locacao.numero}</DetField>
            <DetField label="Tipo">{formatTipo(locacao.tipo)}</DetField>
            <DetField label="Status">
              <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-semibold', statusInfo.color)}>
                {statusInfo.label}
              </span>
            </DetField>
            <DetField label="Data de início">{formatDate(locacao.dataInicio)}</DetField>
            <DetField label="Data de fim">{locacao.dataFim ? formatDate(locacao.dataFim) : '—'}</DetField>
            {valorInfo ? (
              <div className="rounded-lg border border-[#203d7b]/15 bg-[#203d7b]/[0.04] px-3 py-3 sm:col-span-2 lg:col-span-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#203d7b]/80">{valorInfo.label}</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-[#203d7b]">
                  R$ {valorInfo.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 shadow-sm lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[#203d7b]">
                <User className="h-5 w-5" />
                <CardTitle className="text-lg">Cliente</CardTitle>
              </div>
              {locacao.cliente ? (
                <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-xs text-[#203d7b]" asChild>
                  <Link to={`/clientes/${locacao.cliente.id}`}>
                    Ficha
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            {locacao.cliente ? (
              <div className="space-y-3 text-sm">
                <p className="text-base font-semibold text-slate-900">{locacao.cliente.nome}</p>
                <DetField label="CNPJ">{locacao.cliente.cnpj}</DetField>
                {locacao.cliente.email ? <DetField label="E-mail">{locacao.cliente.email}</DetField> : null}
                {locacao.cliente.telefone ? <DetField label="Telefone">{locacao.cliente.telefone}</DetField> : null}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">Cliente não informado.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 shadow-sm lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[#203d7b]">
                <Zap className="h-5 w-5" />
                <CardTitle className="text-lg">Gerador</CardTitle>
              </div>
              {locacao.gerador ? (
                <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-xs text-[#203d7b]" asChild>
                  <Link to={`/geradores/${locacao.gerador.id}`}>
                    Ficha
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            {locacao.gerador ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <DetField label="Código">{locacao.gerador.codigo}</DetField>
                <DetField label="Modelo">{locacao.gerador.modelo}</DetField>
                <DetField label="Marca">{locacao.gerador.marca}</DetField>
                <DetField label="Potência">{locacao.gerador.potencia}</DetField>
                <DetField label="Status equipamento">{locacao.gerador.status}</DetField>
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">Gerador não informado.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {locacao.observacoes ? (
        <Card className="border-slate-200/90 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-[#203d7b]">
              <FileText className="h-5 w-5" />
              <CardTitle className="text-lg">Observações</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm leading-relaxed text-slate-800">
              {locacao.observacoes}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.08 }}
      >
        <Card className="border-slate-200/90 shadow-sm">
          <CardHeader className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#203d7b]">
                <ClipboardList className="h-5 w-5" />
                <CardTitle className="text-lg">Ordens de serviço</CardTitle>
              </div>
              <CardDescription className="mt-1">Histórico vinculado a esta locação.</CardDescription>
            </div>
            <Button
              onClick={() => navigate(`/ordens-servico/novo?locacaoId=${id}`)}
              size="sm"
              className="w-full gap-2 bg-[#203d7b] hover:bg-[#203d7b]/90 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Nova OS
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {loadingOS ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-9 w-9 animate-spin text-[#203d7b]" />
              </div>
            ) : ordensServico.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
                <ClipboardList className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                <p className="text-sm font-medium text-slate-700">Nenhuma OS nesta locação</p>
                <p className="mt-1 text-xs text-slate-500">Crie entregas, manutenções ou recolhimentos.</p>
                <Button
                  onClick={() => navigate(`/ordens-servico/novo?locacaoId=${id}`)}
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Criar primeira OS
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3 md:hidden">
                  {ordensServico.map((os) => {
                    const st = formatStatusOS(os.status)
                    return (
                      <motion.div
                        key={os.id}
                        role="button"
                        tabIndex={0}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full cursor-pointer rounded-xl border border-slate-200/90 bg-white p-4 text-left shadow-sm ring-1 ring-slate-900/5 transition hover:border-slate-300"
                        onClick={() => navigate(`/ordens-servico/${os.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            navigate(`/ordens-servico/${os.id}`)
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-slate-900">{os.numero}</p>
                            <p className="text-xs text-slate-600">{formatTipoOS(os.tipo)}</p>
                          </div>
                          <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold', st.color)}>
                            {st.label}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-3 text-xs text-slate-500">
                          <span>{os.tecnicoResponsavel?.nome ?? '—'}</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(os.dataAgendada)}
                          </span>
                        </div>
                        <div className="mt-3 flex justify-end border-t border-slate-100 pt-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 text-[#203d7b]"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/ordens-servico/${os.id}`)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            Ver
                          </Button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="hidden overflow-x-auto rounded-lg border border-slate-200 md:block">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/90">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Número
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Tipo
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Técnico
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Agendada
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {ordensServico.map((os, i) => {
                        const st = formatStatusOS(os.status)
                        return (
                          <tr
                            key={os.id}
                            className={cn(
                              'cursor-pointer transition-colors hover:bg-[#203d7b]/[0.04]',
                              i % 2 === 1 && 'bg-slate-50/40'
                            )}
                            onClick={() => navigate(`/ordens-servico/${os.id}`)}
                          >
                            <td className="px-4 py-3 font-semibold text-slate-900">{os.numero}</td>
                            <td className="px-4 py-3 text-slate-700">{formatTipoOS(os.tipo)}</td>
                            <td className="px-4 py-3 text-slate-600">{os.tecnicoResponsavel?.nome ?? '—'}</td>
                            <td className="px-4 py-3 tabular-nums text-slate-600">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                {formatDate(os.dataAgendada)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-semibold', st.color)}>
                                {st.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-[#203d7b]"
                                title="Ver OS"
                                onClick={() => navigate(`/ordens-servico/${os.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
