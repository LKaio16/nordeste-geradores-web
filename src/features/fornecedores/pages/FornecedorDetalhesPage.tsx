import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Fornecedor } from '@/types'
import { fornecedorService } from '@/services/fornecedorService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Building2,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { maskCNPJ } from '@/utils/validators'

export function FornecedorDetalhesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      carregarFornecedor(id)
    }
  }, [id])

  const carregarFornecedor = async (fornecedorId: string) => {
    try {
      setLoading(true)
      const data = await fornecedorService.buscarPorId(fornecedorId)
      setFornecedor(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar detalhes do fornecedor')
    } finally {
      setLoading(false)
    }
  }

  const formatCNPJ = (cnpj: string) => {
    return maskCNPJ(cnpj)
  }

  const handleDelete = async () => {
    if (id && window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      try {
        await fornecedorService.deletar(id)
        navigate('/fornecedores')
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir fornecedor')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500">Carregando detalhes do fornecedor...</p>
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

  if (!fornecedor) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500">Fornecedor não encontrado.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/fornecedores')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Detalhes do Fornecedor</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/fornecedores/${fornecedor.id}/editar`)} className="gap-2">
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
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{fornecedor.nome}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    {fornecedor.status === 'ATIVO' ? (
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
                  <p className="font-semibold">{formatCNPJ(fornecedor.cnpj)}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </p>
                  <p className="font-semibold">{fornecedor.email}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </p>
                  <p className="font-semibold">{fornecedor.telefone}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Endereço
                  </p>
                  <p className="font-semibold">{fornecedor.endereco}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1">Cidade</p>
                  <p className="font-semibold">{fornecedor.cidade}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1">Estado</p>
                  <p className="font-semibold">{fornecedor.estado}</p>
                </div>

                {fornecedor.observacoes && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Observações
                    </p>
                    <p className="font-semibold whitespace-pre-wrap">{fornecedor.observacoes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 space-y-2 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Criado em</span>
                <span className="font-medium">
                  {new Date(fornecedor.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Última atualização</span>
                <span className="font-medium">
                  {new Date(fornecedor.updatedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}


