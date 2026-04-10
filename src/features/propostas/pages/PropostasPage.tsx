import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Proposta, TipoProposta, StatusProposta } from '@/types'
import { propostaService } from '@/services/propostaService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  User,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  FileDown,
  Grid3x3,
  Table as TableIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  DesktopDataTableShell,
  STH,
  listInteractiveRow,
  paginationBarClass,
  paginationControlsClass,
} from '@/components/tables/responsiveDataList'

type ViewMode = 'cards' | 'table'

export function PropostasPage() {
  const navigate = useNavigate()
  const [propostas, setPropostas] = useState<Proposta[]>([])
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusProposta | ''>('')
  const [tipoFilter, setTipoFilter] = useState<TipoProposta | ''>('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  useEffect(() => {
    carregarPropostas()
  }, [page, size, searchTerm, statusFilter, tipoFilter])

  const carregarPropostas = async () => {
    try {
      setLoading(true)
      const data = await propostaService.listar({ page, size, q: searchTerm, status: statusFilter, tipo: tipoFilter })
      setPropostas(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (err: any) {
      console.error('Erro ao carregar propostas:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta proposta?')) {
      try {
        await propostaService.deletar(id)
        await carregarPropostas()
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir proposta')
      }
    }
  }

  const handleGerarPdf = async (id: string) => {
    try {
      const blob = await propostaService.gerarPdf(id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `proposta-${id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      alert(err.message || 'Erro ao gerar PDF')
    }
  }

  const formatStatus = (status: StatusProposta) => {
    const statusMap: Record<StatusProposta, { label: string; color: string }> = {
      [StatusProposta.RASCUNHO]: { label: 'Rascunho', color: 'bg-gray-100 text-gray-800' },
      [StatusProposta.ENVIADA]: { label: 'Enviada', color: 'bg-blue-100 text-blue-800' },
      [StatusProposta.APROVADA]: { label: 'Aprovada', color: 'bg-green-100 text-green-800' },
      [StatusProposta.RECUSADA]: { label: 'Recusada', color: 'bg-red-100 text-red-800' },
    }
    return statusMap[status] || { label: status, color: 'bg-slate-100 text-slate-800' }
  }

  const formatTipo = (tipo: TipoProposta) => {
    const tipoMap: Record<TipoProposta, string> = {
      [TipoProposta.MENSAL]: 'Mensal',
      [TipoProposta.EVENTO]: 'Evento',
    }
    return tipoMap[tipo] || tipo
  }

  const formatDate = (date: string) => {
    if (!date) return ''
    const parts = date.split('T')[0].split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const filteredPropostas = propostas

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#203d7b] mx-auto mb-4"></div>
          <p className="text-slate-500">Carregando propostas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Propostas</h1>
          <p className="text-slate-600 mt-1">Gerencie as propostas comerciais</p>
        </div>
        <Button onClick={() => navigate('/propostas/novo')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Proposta
        </Button>
      </div>

      {/* Busca e Filtros */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por número, cliente ou CNPJ..."
            value={searchTerm}
            onChange={(e) => {
              setPage(0)
              setSearchTerm(e.target.value)
            }}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(0)
            setStatusFilter(e.target.value as StatusProposta | '')
          }}
          className="flex h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todos os Status</option>
          <option value={StatusProposta.RASCUNHO}>Rascunho</option>
          <option value={StatusProposta.ENVIADA}>Enviada</option>
          <option value={StatusProposta.APROVADA}>Aprovada</option>
          <option value={StatusProposta.RECUSADA}>Recusada</option>
        </select>
        <select
          value={tipoFilter}
          onChange={(e) => {
            setPage(0)
            setTipoFilter(e.target.value as TipoProposta | '')
          }}
          className="flex h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todos os Tipos</option>
          <option value={TipoProposta.MENSAL}>Mensal</option>
          <option value={TipoProposta.EVENTO}>Evento</option>
        </select>
        <div className="flex gap-1 border border-slate-300 rounded-md overflow-hidden">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('cards')}
            className="rounded-none"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="rounded-none"
          >
            <TableIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Lista de Propostas */}
      {filteredPropostas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {searchTerm || statusFilter || tipoFilter
                ? 'Nenhuma proposta encontrada com os filtros aplicados'
                : 'Nenhuma proposta cadastrada'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPropostas.map((proposta) => {
            const statusInfo = formatStatus(proposta.status)
            return (
              <motion.div
                key={proposta.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#203d7b]/10 rounded-lg">
                          <FileText className="h-5 w-5 text-[#203d7b]" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{proposta.numero}</CardTitle>
                          <p className="text-sm text-slate-500">{formatTipo(proposta.tipo)}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="h-4 w-4 text-slate-400" />
                        <span>{proposta.cliente?.nome || proposta.clienteNome || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>Emissão: {formatDate(proposta.dataEmissao)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span>Validade: {formatDate(proposta.validade)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <DollarSign className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold">
                          R$ {proposta.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-slate-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/propostas/${proposta.id}`)}
                        className="flex-1 gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGerarPdf(proposta.id)}
                        className="flex-1 gap-2"
                      >
                        <FileDown className="h-4 w-4" />
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/propostas/${proposta.id}/editar`)}
                        className="flex-1 gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(proposta.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filteredPropostas.map((proposta) => {
              const statusInfo = formatStatus(proposta.status)
              return (
                <motion.div
                  key={proposta.id}
                  role="button"
                  tabIndex={0}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => navigate(`/propostas/${proposta.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(`/propostas/${proposta.id}`)
                    }
                  }}
                  className="w-full cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-sm ring-1 ring-slate-900/5 transition hover:border-slate-300 hover:shadow-md active:scale-[0.99]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold tabular-nums text-slate-900">{proposta.numero}</span>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm text-slate-700">
                        {proposta.cliente?.nome || proposta.clienteNome || '—'}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>{formatTipo(proposta.tipo)}</span>
                        <span>Emissão {formatDate(proposta.dataEmissao)}</span>
                        <span>Val. {formatDate(proposta.validade)}</span>
                      </div>
                      <p className="text-base font-bold tabular-nums text-emerald-700">
                        R${' '}
                        {proposta.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div
                      className="flex w-full flex-wrap justify-end gap-1 border-t border-slate-100 pt-3 sm:w-auto sm:border-0 sm:pt-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation" onClick={() => navigate(`/propostas/${proposta.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation" title="PDF" onClick={() => handleGerarPdf(proposta.id)}>
                        <FileDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation" onClick={() => navigate(`/propostas/${proposta.id}/editar`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 touch-manipulation text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(proposta.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <DesktopDataTableShell tableMinClass="min-w-[64rem]">
            <thead>
              <tr>
                <th className={STH.left}>Número</th>
                <th className={STH.mid}>Cliente</th>
                <th className={STH.mid}>Tipo</th>
                <th className={STH.midHiddenLg}>Emissão</th>
                <th className={STH.midHiddenLg}>Validade</th>
                <th className={STH.midNum}>Valor</th>
                <th className={STH.mid}>Status</th>
                <th className={STH.right}>Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPropostas.map((proposta, index) => {
                const statusInfo = formatStatus(proposta.status)
                return (
                  <motion.tr
                    key={proposta.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={listInteractiveRow(index)}
                    onClick={() => navigate(`/propostas/${proposta.id}`)}
                  >
                    <td className="py-3.5 pl-4 pr-3 align-middle font-semibold tabular-nums text-slate-900">{proposta.numero}</td>
                    <td className="max-w-[14rem] px-3 py-3.5 align-middle">
                      <span className="line-clamp-2 text-sm text-slate-800" title={proposta.cliente?.nome || proposta.clienteNome || ''}>
                        {proposta.cliente?.nome || proposta.clienteNome || '—'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 align-middle text-sm text-slate-600">{formatTipo(proposta.tipo)}</td>
                    <td className="hidden whitespace-nowrap px-3 py-3.5 align-middle tabular-nums text-sm text-slate-600 lg:table-cell">
                      {formatDate(proposta.dataEmissao)}
                    </td>
                    <td className="hidden whitespace-nowrap px-3 py-3.5 align-middle tabular-nums text-sm text-slate-600 lg:table-cell">
                      {formatDate(proposta.validade)}
                    </td>
                    <td className="px-3 py-3.5 text-right align-middle text-sm font-semibold tabular-nums text-slate-900">
                      R${' '}
                      {proposta.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-3.5 align-middle">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                    </td>
                    <td className="px-1 py-2 pr-4 align-middle" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 touch-manipulation"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/propostas/${proposta.id}`)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 touch-manipulation"
                          title="Gerar PDF"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleGerarPdf(proposta.id)
                          }}
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 touch-manipulation"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/propostas/${proposta.id}/editar`)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 touch-manipulation text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(proposta.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </DesktopDataTableShell>
        </>
      )}

      {/* Paginação */}
      <div className={paginationBarClass()}>
        <div className="text-center text-sm text-slate-600 sm:text-left">
          Total: <span className="font-semibold text-slate-900">{totalElements}</span>
        </div>
        <div className={paginationControlsClass()}>
          <select
            value={size}
            onChange={(e) => {
              setPage(0)
              setSize(parseInt(e.target.value) || 20)
            }}
            className="flex h-9 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
          >
            <option value="10">10 / pág</option>
            <option value="20">20 / pág</option>
            <option value="50">50 / pág</option>
            <option value="100">100 / pág</option>
          </select>
          <Button variant="outline" size="sm" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            Anterior
          </Button>
          <div className="text-sm text-slate-700">
            Página <span className="font-semibold">{totalPages === 0 ? 0 : page + 1}</span> de{' '}
            <span className="font-semibold">{totalPages}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={totalPages === 0 || page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  )
}
