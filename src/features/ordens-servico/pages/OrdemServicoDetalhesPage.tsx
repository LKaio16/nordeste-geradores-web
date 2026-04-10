import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { NivelAcesso, OrdemServico, StatusOrdemServico, TipoFoto, TipoOrdemServico } from '@/types'
import { ordemServicoService } from '@/services/ordemServicoService'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { OsFotoAutenticada } from '@/components/os/OsFotoAutenticada'
import { cn } from '@/utils/cn'
import {
  ArrowLeft,
  Edit,
  ClipboardList,
  Calendar,
  User,
  Zap,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  Gauge,
  PenLine,
  ExternalLink,
  Camera,
  Upload,
  Trash2,
  Pencil,
} from 'lucide-react'

function DetField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-1 text-sm font-semibold text-slate-900">{children}</div>
    </div>
  )
}

export function OrdemServicoDetalhesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [ordemServico, setOrdemServico] = useState<OrdemServico | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tipoFotoNova, setTipoFotoNova] = useState<TipoFoto>(TipoFoto.ANTES)
  const [descricaoFoto, setDescricaoFoto] = useState('')
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [editingFotoId, setEditingFotoId] = useState<string | null>(null)
  const [editFotoTipo, setEditFotoTipo] = useState<TipoFoto>(TipoFoto.ANTES)
  const [editFotoDesc, setEditFotoDesc] = useState('')
  const [savingFoto, setSavingFoto] = useState(false)

  useEffect(() => {
    if (id) {
      carregarOrdemServico(id)
    }
  }, [id])

  const carregarOrdemServico = async (osId: string) => {
    try {
      setLoading(true)
      const data = await ordemServicoService.buscarPorId(osId)
      setOrdemServico(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar ordem de serviço'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleConcluir = async () => {
    if (!id || !ordemServico) return

    let horimetroFinal: number | undefined
    if (ordemServico.tipo === TipoOrdemServico.MANUTENCAO || ordemServico.tipo === TipoOrdemServico.RECOLHIMENTO) {
      const horimetroInput = window.prompt('Informe o horímetro final (obrigatório):')
      if (!horimetroInput || horimetroInput.trim() === '') {
        alert('Horímetro final é obrigatório para este tipo de ordem de serviço')
        return
      }
      horimetroFinal = parseFloat(horimetroInput)
      if (Number.isNaN(horimetroFinal)) {
        alert('Horímetro inválido')
        return
      }
    }

    try {
      await ordemServicoService.concluir(id, horimetroFinal)
      await carregarOrdemServico(id)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao concluir ordem de serviço'
      alert(msg)
    }
  }

  const formatStatus = (status: StatusOrdemServico) => {
    const statusMap: Record<StatusOrdemServico, { label: string; color: string }> = {
      [StatusOrdemServico.PENDENTE]: { label: 'Pendente', color: 'bg-amber-100 text-amber-800' },
      [StatusOrdemServico.EM_ANDAMENTO]: { label: 'Em andamento', color: 'bg-sky-100 text-sky-800' },
      [StatusOrdemServico.CONCLUIDA]: { label: 'Concluída', color: 'bg-emerald-100 text-emerald-800' },
      [StatusOrdemServico.CANCELADA]: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
    }
    return statusMap[status] || { label: status, color: 'bg-slate-100 text-slate-800' }
  }

  const formatTipo = (tipo: TipoOrdemServico) => {
    const tipoMap: Record<TipoOrdemServico, string> = {
      [TipoOrdemServico.ENTREGA]: 'Entrega',
      [TipoOrdemServico.RECOLHIMENTO]: 'Recolhimento',
      [TipoOrdemServico.MANUTENCAO]: 'Manutenção',
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

  const formatTipoFoto = (tipo: string) => (tipo === TipoFoto.DEPOIS ? 'Depois' : 'Antes')

  const handleArquivoFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !id) return
    try {
      setUploadingFoto(true)
      await ordemServicoService.enviarFoto(id, file, tipoFotoNova, descricaoFoto || undefined)
      setDescricaoFoto('')
      await carregarOrdemServico(id)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar foto'
      alert(msg)
    } finally {
      setUploadingFoto(false)
    }
  }

  const iniciarEdicaoFoto = (foto: { id: string; tipo: string; descricao?: string }) => {
    setEditingFotoId(foto.id)
    setEditFotoTipo(foto.tipo === TipoFoto.DEPOIS ? TipoFoto.DEPOIS : TipoFoto.ANTES)
    setEditFotoDesc(foto.descricao ?? '')
  }

  const cancelarEdicaoFoto = () => {
    setEditingFotoId(null)
  }

  const salvarEdicaoFoto = async () => {
    if (!id || !editingFotoId) return
    try {
      setSavingFoto(true)
      await ordemServicoService.atualizarFotoMeta(id, editingFotoId, editFotoDesc, editFotoTipo)
      setEditingFotoId(null)
      await carregarOrdemServico(id)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar alterações da foto'
      alert(msg)
    } finally {
      setSavingFoto(false)
    }
  }

  const handleExcluirFoto = async (fotoId: string) => {
    if (
      !id ||
      !window.confirm(
        'Excluir esta foto permanentemente? O arquivo será removido do armazenamento (nuvem ou servidor) e não poderá ser recuperado.'
      )
    ) {
      return
    }
    try {
      await ordemServicoService.excluirFoto(id, fotoId)
      await carregarOrdemServico(id)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir foto'
      alert(msg)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[#203d7b]" />
          <p className="text-slate-500">Carregando ordem de serviço…</p>
        </div>
      </div>
    )
  }

  if (error || !ordemServico) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/ordens-servico')} className="gap-2 text-slate-600">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Card className="border-slate-200/90">
          <CardContent className="py-12 text-center">
            <p className="text-red-600">{error || 'Ordem de serviço não encontrada'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusInfo = formatStatus(ordemServico.status)
  const podeConcluir =
    ordemServico.status !== StatusOrdemServico.CONCLUIDA && ordemServico.status !== StatusOrdemServico.CANCELADA

  const podeGerenciarFotosOs =
    !!user &&
    ordemServico.status !== StatusOrdemServico.CANCELADA &&
    (user.nivelAcesso === NivelAcesso.ADMIN ||
      user.nivelAcesso === NivelAcesso.GERENTE ||
      user.nivelAcesso === NivelAcesso.FINANCEIRO ||
      user.id === ordemServico.tecnicoResponsavelId)

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button variant="ghost" onClick={() => navigate('/ordens-servico')} className="w-fit gap-2 text-slate-600">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="min-w-0 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-[#203d7b]/[0.07] via-white to-slate-50/90 px-5 py-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 gap-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{ordemServico.numero}</h1>
              <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', statusInfo.color)}>
                {statusInfo.label}
              </span>
              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                {formatTipo(ordemServico.tipo)}
              </span>
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                Agendada: <span className="font-medium text-slate-800">{formatDate(ordemServico.dataAgendada)}</span>
              </span>
              {ordemServico.dataExecucao ? (
                <span className="text-slate-500">Execução: {formatDate(ordemServico.dataExecucao)}</span>
              ) : null}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {podeConcluir ? (
            <Button onClick={handleConcluir} variant="outline" className="gap-2 border-emerald-200 text-emerald-800 hover:bg-emerald-50">
              <CheckCircle2 className="h-4 w-4" />
              Concluir OS
            </Button>
          ) : null}
          <Button onClick={() => navigate(`/ordens-servico/${id}/editar`)} className="gap-2 bg-[#203d7b] hover:bg-[#203d7b]/90">
            <Edit className="h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-slate-200/90 shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-[#203d7b]">
              <ClipboardList className="h-5 w-5" />
              <CardTitle className="text-lg">Dados da OS</CardTitle>
            </div>
            <CardDescription>Identificação, tipo e leituras de horímetro quando aplicável.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetField label="Número">{ordemServico.numero}</DetField>
              <DetField label="Tipo">{formatTipo(ordemServico.tipo)}</DetField>
              <DetField label="Data agendada">{formatDate(ordemServico.dataAgendada)}</DetField>
              <DetField label="Data de execução">{ordemServico.dataExecucao ? formatDate(ordemServico.dataExecucao) : '—'}</DetField>
              {ordemServico.tipo === TipoOrdemServico.ENTREGA && ordemServico.horimetroInicial !== undefined ? (
                <DetField label="Horímetro inicial">
                  <span className="tabular-nums">{ordemServico.horimetroInicial.toLocaleString('pt-BR')} h</span>
                </DetField>
              ) : null}
              {(ordemServico.tipo === TipoOrdemServico.MANUTENCAO || ordemServico.tipo === TipoOrdemServico.RECOLHIMENTO) &&
              ordemServico.horimetroFinal !== undefined ? (
                <DetField label="Horímetro final">
                  <span className="tabular-nums">{ordemServico.horimetroFinal.toLocaleString('pt-BR')} h</span>
                </DetField>
              ) : null}
              <DetField label="Assinatura do cliente">
                {ordemServico.assinaturaCliente ? 'Sim' : 'Não'}
              </DetField>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {ordemServico.locacao ? (
            <Card className="border-slate-200/90 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[#203d7b]">
                    <MapPin className="h-5 w-5" />
                    <CardTitle className="text-base">Locação</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-xs text-[#203d7b]" asChild>
                    <Link to={`/locacoes/${ordemServico.locacao.id}`}>
                      Abrir
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-semibold text-slate-900">{ordemServico.locacao.numero}</p>
                {ordemServico.locacao.cliente ? (
                  <p className="text-slate-600">{ordemServico.locacao.cliente.nome}</p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {ordemServico.gerador ? (
            <Card className="border-slate-200/90 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[#203d7b]">
                    <Zap className="h-5 w-5" />
                    <CardTitle className="text-base">Gerador</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-xs text-[#203d7b]" asChild>
                    <Link to={`/geradores/${ordemServico.gerador.id}`}>
                      Abrir
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-semibold text-slate-900">{ordemServico.gerador.codigo}</p>
                <p className="text-slate-600">
                  {ordemServico.gerador.marca} · {ordemServico.gerador.modelo}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Gauge className="h-3.5 w-3.5" />
                  Horímetro:{' '}
                  <span className="font-medium tabular-nums text-slate-700">
                    {(ordemServico.gerador.horimetro ?? 0).toLocaleString('pt-BR')} h
                  </span>
                </p>
              </CardContent>
            </Card>
          ) : null}

          {ordemServico.tecnicoResponsavel ? (
            <Card className="border-slate-200/90 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-[#203d7b]">
                  <User className="h-5 w-5" />
                  <CardTitle className="text-base">Técnico</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-semibold text-slate-900">{ordemServico.tecnicoResponsavel.nome}</p>
                {ordemServico.tecnicoResponsavel.email ? (
                  <p className="break-all text-slate-600">{ordemServico.tecnicoResponsavel.email}</p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      <Card className="border-slate-200/90 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-[#203d7b]">
            <Camera className="h-5 w-5" />
            <CardTitle className="text-lg">Fotos da OS</CardTitle>
          </div>
          <CardDescription>Registro visual (antes/depois). Formatos: JPG, PNG ou WebP.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {podeGerenciarFotosOs ? (
            <div className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:flex-wrap sm:items-end">
              <div className="min-w-[140px] space-y-1">
                <label htmlFor="tipo-foto-os" className="text-xs font-medium text-slate-600">
                  Tipo
                </label>
                <select
                  id="tipo-foto-os"
                  value={tipoFotoNova}
                  onChange={(e) => setTipoFotoNova(e.target.value as TipoFoto)}
                  disabled={uploadingFoto}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-50"
                >
                  <option value={TipoFoto.ANTES}>Antes</option>
                  <option value={TipoFoto.DEPOIS}>Depois</option>
                </select>
              </div>
              <div className="min-w-[200px] flex-1 space-y-1">
                <label htmlFor="desc-foto-os" className="text-xs font-medium text-slate-600">
                  Descrição (opcional)
                </label>
                <Input
                  id="desc-foto-os"
                  value={descricaoFoto}
                  onChange={(e) => setDescricaoFoto(e.target.value)}
                  placeholder="Ex.: painel frontal"
                  disabled={uploadingFoto}
                />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                className="sr-only"
                onChange={handleArquivoFoto}
              />
              <Button
                type="button"
                variant="outline"
                className="gap-2 border-[#203d7b]/30 text-[#203d7b] hover:bg-[#203d7b]/5"
                disabled={uploadingFoto}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadingFoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Escolher e enviar foto
              </Button>
            </div>
          ) : ordemServico.status === StatusOrdemServico.CANCELADA ? (
            <p className="text-sm text-slate-500">Não é possível adicionar fotos em OS cancelada.</p>
          ) : null}

          {(ordemServico.fotos?.length ?? 0) === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma foto anexada ainda.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {(ordemServico.fotos ?? []).map((foto) => (
                <li
                  key={foto.id}
                  className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm"
                >
                  <OsFotoAutenticada
                    path={foto.url}
                    alt={foto.descricao || formatTipoFoto(String(foto.tipo))}
                    className="h-52 w-full object-cover"
                  />
                  <div className="space-y-3 border-t border-slate-100 p-3">
                    {podeGerenciarFotosOs && editingFotoId === foto.id ? (
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-600" htmlFor={`edit-tipo-${foto.id}`}>
                            Tipo
                          </label>
                          <select
                            id={`edit-tipo-${foto.id}`}
                            value={editFotoTipo}
                            onChange={(e) => setEditFotoTipo(e.target.value as TipoFoto)}
                            disabled={savingFoto}
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50"
                          >
                            <option value={TipoFoto.ANTES}>Antes</option>
                            <option value={TipoFoto.DEPOIS}>Depois</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-600" htmlFor={`edit-desc-${foto.id}`}>
                            Descrição
                          </label>
                          <Input
                            id={`edit-desc-${foto.id}`}
                            value={editFotoDesc}
                            onChange={(e) => setEditFotoDesc(e.target.value)}
                            placeholder="Opcional"
                            disabled={savingFoto}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Button type="button" size="sm" className="gap-1 bg-[#203d7b] hover:bg-[#203d7b]/90" disabled={savingFoto} onClick={() => void salvarEdicaoFoto()}>
                            {savingFoto ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                            Salvar
                          </Button>
                          <Button type="button" size="sm" variant="outline" disabled={savingFoto} onClick={cancelarEdicaoFoto}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {formatTipoFoto(String(foto.tipo))}
                          </p>
                          {foto.descricao ? (
                            <p className="mt-0.5 text-sm text-slate-700">{foto.descricao}</p>
                          ) : (
                            <p className="mt-0.5 text-sm italic text-slate-400">Sem descrição</p>
                          )}
                          <p className="mt-1 text-xs text-slate-400">{formatDate(foto.createdAt)}</p>
                        </div>
                        {podeGerenciarFotosOs ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 shrink-0 text-slate-600 hover:bg-slate-100"
                              onClick={() => iniciarEdicaoFoto(foto)}
                              title="Editar descrição e tipo"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleExcluirFoto(foto.id)}
                              title="Excluir foto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {ordemServico.observacoes ? (
        <Card className="border-slate-200/90 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-[#203d7b]">
              <FileText className="h-5 w-5" />
              <CardTitle className="text-lg">Observações</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm leading-relaxed text-slate-800">
              {ordemServico.observacoes}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-dashed border-slate-200 bg-slate-50/30">
          <CardContent className="flex items-center gap-3 py-6 text-sm text-slate-500">
            <PenLine className="h-5 w-5 shrink-0 text-slate-400" />
            Nenhuma observação registrada nesta OS.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
