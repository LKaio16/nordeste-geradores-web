import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gerador, StatusGerador } from '@/types'
import { geradorService } from '@/services/geradorService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Zap,
  Gauge,
  Calendar,
  Hash,
  Building2,
} from 'lucide-react'
import { motion } from 'framer-motion'

export function GeradoresPage() {
  const navigate = useNavigate()
  const [geradores, setGeradores] = useState<Gerador[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusGerador | ''>('')

  useEffect(() => {
    carregarGeradores()
  }, [])

  const carregarGeradores = async () => {
    try {
      setLoading(true)
      const data = await geradorService.listar()
      setGeradores(data)
    } catch (err: any) {
      console.error('Erro ao carregar geradores:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este gerador?')) {
      try {
        await geradorService.deletar(id)
        await carregarGeradores()
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir gerador')
      }
    }
  }

  const formatStatus = (status: StatusGerador) => {
    const statusMap: Record<StatusGerador, { label: string; color: string }> = {
      [StatusGerador.DISPONIVEL]: { label: 'Disponível', color: 'bg-green-100 text-green-800' },
      [StatusGerador.LOCADO]: { label: 'Locado', color: 'bg-blue-100 text-blue-800' },
      [StatusGerador.MANUTENCAO]: { label: 'Em Manutenção', color: 'bg-yellow-100 text-yellow-800' },
      [StatusGerador.INATIVO]: { label: 'Inativo', color: 'bg-red-100 text-red-800' },
    }
    return statusMap[status] || { label: status, color: 'bg-slate-100 text-slate-800' }
  }

  const filteredGeradores = geradores.filter((gerador) => {
    const matchesSearch =
      gerador.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gerador.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gerador.numeroSerie.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gerador.potencia.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !statusFilter || gerador.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Carregando geradores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Geradores</h1>
          <p className="text-slate-600 mt-1">Gerencie o cadastro de geradores</p>
        </div>
        <Button onClick={() => navigate('/geradores/novo')} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Gerador
        </Button>
      </div>

      {/* Busca e Filtros */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por modelo, marca, número de série ou potência..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusGerador | '')}
          className="flex h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todos os Status</option>
          <option value={StatusGerador.DISPONIVEL}>Disponível</option>
          <option value={StatusGerador.LOCADO}>Locado</option>
          <option value={StatusGerador.MANUTENCAO}>Em Manutenção</option>
          <option value={StatusGerador.INATIVO}>Inativo</option>
        </select>
      </div>

      {/* Lista de Geradores */}
      {filteredGeradores.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {searchTerm || statusFilter
                ? 'Nenhum gerador encontrado com os filtros aplicados'
                : 'Nenhum gerador cadastrado'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGeradores.map((gerador) => {
            const statusInfo = formatStatus(gerador.status)
            return (
              <motion.div
                key={gerador.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Zap className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{gerador.modelo}</CardTitle>
                          <p className="text-sm text-slate-500">{gerador.marca}</p>
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
                        <Hash className="h-4 w-4 text-slate-400" />
                        <span>Série: {gerador.numeroSerie}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Gauge className="h-4 w-4 text-slate-400" />
                        <span>Potência: {gerador.potencia}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>Ano: {gerador.anoFabricacao}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <span>Horímetro: {gerador.horimetro.toLocaleString('pt-BR')}h</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-slate-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/geradores/${gerador.id}`)}
                        className="flex-1 gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/geradores/${gerador.id}/editar`)}
                        className="flex-1 gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(gerador.id)}
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
      )}
    </div>
  )
}
