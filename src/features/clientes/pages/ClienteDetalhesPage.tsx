import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Cliente } from '@/types'
import { clienteService } from '@/services/clienteService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Users,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building2,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { maskCPFCNPJ } from '@/utils/validators'

export function ClienteDetalhesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      carregarCliente(id)
    }
  }, [id])

  const carregarCliente = async (clienteId: string) => {
    try {
      setLoading(true)
      const data = await clienteService.buscarPorId(clienteId)
      setCliente(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar detalhes do cliente')
    } finally {
      setLoading(false)
    }
  }

  const formatCNPJ = (cnpj: string) => {
    return maskCPFCNPJ(cnpj)
  }

  const handleDelete = async () => {
    if (id && window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await clienteService.deletar(id)
        navigate('/clientes')
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir cliente')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500">Carregando detalhes do cliente...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500">Cliente não encontrado.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/clientes')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Detalhes do Cliente</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/clientes/${cliente.id}/editar`)} className="gap-2">
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          <Button variant="destructive" onClick={handleDelete} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{cliente.nome}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    {cliente.status === 'ATIVO' ? (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Ativo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                        <XCircle className="h-3 w-3" />
                        Inativo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    CNPJ
                  </p>
                  <p className="font-semibold">{formatCNPJ(cliente.cnpj)}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </p>
                  <p className="font-semibold">{cliente.email}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </p>
                  <p className="font-semibold">{cliente.telefone}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Endereço
                  </p>
                  <p className="font-semibold">{cliente.endereco}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1">Cidade</p>
                  <p className="font-semibold">{cliente.cidade}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1">Estado</p>
                  <p className="font-semibold">{cliente.estado}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 space-y-2 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Criado em</span>
                <span className="font-medium">
                  {new Date(cliente.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Última atualização</span>
                <span className="font-medium">
                  {new Date(cliente.updatedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

