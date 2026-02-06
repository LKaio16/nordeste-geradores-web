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

type ViewMode = 'cards' | 'table'

export function PropostasPage() {
  const navigate = useNavigate()
  const [propostas, setPropostas] = useState<Proposta[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusProposta | ''>('')
  const [tipoFilter, setTipoFilter] = useState<TipoProposta | ''>('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  useEffect(() => {
    carregarPropostas()
  }, [])

  const carregarPropostas = async () => {
    try {
      setLoading(true)
      const data = await propostaService.listar()
      setPropostas(data)
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

  const filteredPropostas = propostas.filter((proposta) => {
    const matchesSearch =
      proposta.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposta.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposta.cliente?.cnpj.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !statusFilter || proposta.status === statusFilter
    const matchesTipo = !tipoFilter || proposta.tipo === tipoFilter

    return matchesSearch && matchesStatus && matchesTipo
  })

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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusProposta | '')}
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
          onChange={(e) => setTipoFilter(e.target.value as TipoProposta | '')}
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
                        <span>{proposta.cliente?.nome || 'Cliente não informado'}</span>
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
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Número</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Data Emissão</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Validade</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Valor Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredPropostas.map((proposta) => {
                    const statusInfo = formatStatus(proposta.status)
                    return (
                      <motion.tr
                        key={proposta.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/propostas/${proposta.id}`)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{proposta.numero}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-slate-900">{proposta.cliente?.nome || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-slate-600">{formatTipo(proposta.tipo)}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-slate-600">{formatDate(proposta.dataEmissao)}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-slate-600">{formatDate(proposta.validade)}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-semibold text-slate-900">
                            R$ {proposta.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/propostas/${proposta.id}`)
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleGerarPdf(proposta.id)
                              }}
                              className="h-8 w-8 p-0"
                              title="Gerar PDF"
                            >
                              <FileDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/propostas/${proposta.id}/editar`)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(proposta.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
