import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Usuario, NivelAcesso, StatusUsuario } from '@/types'
import { usuarioService } from '@/services/usuarioService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Briefcase,
  Shield,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { maskPhone } from '@/utils/validators'

export function UsuarioDetalhesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      carregarUsuario(id)
    }
  }, [id])

  const carregarUsuario = async (usuarioId: string) => {
    try {
      setLoading(true)
      const data = await usuarioService.buscarPorId(usuarioId)
      setUsuario(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar detalhes do funcionário')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      try {
        await usuarioService.deletar(id)
        navigate('/usuarios')
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir funcionário')
      }
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const formatNivelAcesso = (nivel: NivelAcesso) => {
    const labels: Record<NivelAcesso, string> = {
      [NivelAcesso.ADMIN]: 'Administrador',
      [NivelAcesso.GERENTE]: 'Gerente',
      [NivelAcesso.TECNICO]: 'Técnico',
      [NivelAcesso.OPERACIONAL]: 'Operacional',
    }
    return labels[nivel]
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500">Carregando detalhes do funcionário...</p>
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

  if (!usuario) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500">Funcionário não encontrado.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/usuarios')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Detalhes do Funcionário</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/usuarios/${usuario.id}/editar`)} className="gap-2">
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
                <div className="p-2 rounded-lg bg-blue-100">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{usuario.nome}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        usuario.nivelAcesso === NivelAcesso.ADMIN
                          ? 'bg-purple-100 text-purple-700'
                          : usuario.nivelAcesso === NivelAcesso.GERENTE
                          ? 'bg-blue-100 text-blue-700'
                          : usuario.nivelAcesso === NivelAcesso.TECNICO
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {formatNivelAcesso(usuario.nivelAcesso)}
                    </span>
                    {usuario.status === StatusUsuario.ATIVO ? (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Ativo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
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
                    <Briefcase className="h-4 w-4" />
                    Cargo
                  </p>
                  <p className="font-semibold text-lg">{usuario.cargo}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </p>
                  <p className="font-semibold">{usuario.email}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </p>
                  <p className="font-semibold">{maskPhone(usuario.telefone)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Nível de Acesso
                  </p>
                  <p className="font-semibold">{formatNivelAcesso(usuario.nivelAcesso)}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data de Admissão
                  </p>
                  <p className="font-semibold">{formatDate(usuario.dataAdmissao)}</p>
                </div>

                {usuario.ultimoAcesso && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Último Acesso
                    </p>
                    <p className="font-semibold">{formatDate(usuario.ultimoAcesso)}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 space-y-2 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Criado em</span>
                <span className="font-medium">{formatDate(usuario.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Última atualização</span>
                <span className="font-medium">{formatDate(usuario.updatedAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

