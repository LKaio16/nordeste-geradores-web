import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Usuario, UsuarioRequest, NivelAcesso, StatusUsuario } from '@/types'
import { usuarioService } from '@/services/usuarioService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Save,
  User,
  AlertCircle,
  Mail,
  Phone,
  Briefcase,
  Shield,
  Calendar,
  Lock,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  isValidEmail,
  normalizeEmail,
  maskPhone,
  unmaskPhone,
} from '@/utils/validators'

export function UsuarioFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [loadingUsuario, setLoadingUsuario] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<UsuarioRequest & { senhaConfirmacao?: string }>({
    nome: '',
    email: '',
    telefone: '',
    cargo: '',
    nivelAcesso: NivelAcesso.OPERACIONAL,
    status: StatusUsuario.ATIVO,
    dataAdmissao: new Date().toISOString().split('T')[0],
    senha: '',
    senhaConfirmacao: '',
  })

  const [emailError, setEmailError] = useState('')

  useEffect(() => {
    if (id) {
      carregarUsuario(id)
    }
  }, [id])

  const carregarUsuario = async (usuarioId: string) => {
    try {
      setLoadingUsuario(true)
      const usuario = await usuarioService.buscarPorId(usuarioId)
      setFormData({
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        cargo: usuario.cargo,
        nivelAcesso: usuario.nivelAcesso,
        status: usuario.status,
        dataAdmissao: usuario.dataAdmissao ? usuario.dataAdmissao.split('T')[0] : new Date().toISOString().split('T')[0],
        senha: '', // Não carregar senha
        senhaConfirmacao: '',
      })
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar funcionário')
    } finally {
      setLoadingUsuario(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setEmailError('')

    if (!formData.nome.trim()) {
      setError('Nome é obrigatório')
      return
    }

    const normalizedEmail = normalizeEmail(formData.email)
    if (!normalizedEmail) {
      setEmailError('Email é obrigatório')
      return
    }

    if (!isValidEmail(normalizedEmail)) {
      setEmailError('Email inválido')
      return
    }

    if (!formData.cargo.trim()) {
      setError('Cargo é obrigatório')
      return
    }

    if (!formData.dataAdmissao) {
      setError('Data de admissão é obrigatória')
      return
    }

    // Validação de senha apenas na criação
    if (!isEditing) {
      if (!formData.senha || formData.senha.length < 6) {
        setError('Senha é obrigatória e deve ter no mínimo 6 caracteres')
        return
      }
      if (formData.senha !== formData.senhaConfirmacao) {
        setError('As senhas não coincidem')
        return
      }
    } else {
      // Na edição, senha é opcional
      if (formData.senha && formData.senha.length < 6) {
        setError('Senha deve ter no mínimo 6 caracteres')
        return
      }
      if (formData.senha && formData.senha !== formData.senhaConfirmacao) {
        setError('As senhas não coincidem')
        return
      }
    }

    try {
      setLoading(true)
      const dataToSubmit: UsuarioRequest = {
        nome: formData.nome.trim(),
        email: normalizedEmail,
        telefone: unmaskPhone(formData.telefone),
        cargo: formData.cargo.trim(),
        nivelAcesso: formData.nivelAcesso,
        status: formData.status,
        dataAdmissao: formData.dataAdmissao,
        ...(formData.senha && { senha: formData.senha }),
      }

      if (isEditing && id) {
        await usuarioService.atualizar(id, dataToSubmit)
      } else {
        await usuarioService.criar(dataToSubmit)
      }
      navigate('/usuarios')
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar funcionário')
    } finally {
      setLoading(false)
    }
  }

  if (loadingUsuario) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Carregando funcionário...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/usuarios')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isEditing ? 'Editar Funcionário' : 'Novo Funcionário'}
          </h1>
          <p className="text-slate-600 mt-1">
            {isEditing ? 'Altere os dados do funcionário' : 'Preencha os dados para criar um novo funcionário'}
          </p>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  placeholder="Nome completo do funcionário"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase()
                      setFormData({ ...formData, email: value })
                      setEmailError('')
                    }}
                    onBlur={(e) => {
                      const normalized = normalizeEmail(e.target.value)
                      if (normalized && !isValidEmail(normalized)) {
                        setEmailError('Email inválido')
                      }
                    }}
                    required
                    placeholder="email@exemplo.com"
                    className={`pl-10 ${emailError ? 'border-red-500' : ''}`}
                  />
                </div>
                {emailError && (
                  <p className="text-sm text-red-600">{emailError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => {
                      const masked = maskPhone(e.target.value)
                      setFormData({ ...formData, telefone: masked })
                    }}
                    required
                    placeholder="(00) 00000-0000"
                    className="pl-10"
                    maxLength={15}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados Profissionais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Dados Profissionais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo *</Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  required
                  placeholder="Ex: Técnico, Gerente, Operador"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nivelAcesso">Nível de Acesso *</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <select
                    id="nivelAcesso"
                    value={formData.nivelAcesso}
                    onChange={(e) => setFormData({ ...formData, nivelAcesso: e.target.value as NivelAcesso })}
                    className="w-full h-10 pl-10 pr-3 rounded-md border border-slate-200 bg-white"
                    required
                  >
                    <option value={NivelAcesso.OPERACIONAL}>Operacional</option>
                    <option value={NivelAcesso.TECNICO}>Técnico</option>
                    <option value={NivelAcesso.FINANCEIRO}>Financeiro</option>
                    <option value={NivelAcesso.GERENTE}>Gerente</option>
                    <option value={NivelAcesso.ADMIN}>Administrador</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataAdmissao">Data de Admissão *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="dataAdmissao"
                    type="date"
                    value={formData.dataAdmissao}
                    onChange={(e) => setFormData({ ...formData, dataAdmissao: e.target.value })}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusUsuario })}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                  required
                >
                  <option value={StatusUsuario.ATIVO}>Ativo</option>
                  <option value={StatusUsuario.INATIVO}>Inativo</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Senha */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {isEditing ? 'Alterar Senha (Opcional)' : 'Senha de Acesso'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senha">
                  {isEditing ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
                </Label>
                <Input
                  id="senha"
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  required={!isEditing}
                  placeholder={isEditing ? 'Nova senha (opcional)' : 'Mínimo 6 caracteres'}
                  minLength={isEditing ? 0 : 6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senhaConfirmacao">
                  {isEditing ? 'Confirmar Nova Senha' : 'Confirmar Senha *'}
                </Label>
                <Input
                  id="senhaConfirmacao"
                  type="password"
                  value={formData.senhaConfirmacao}
                  onChange={(e) => setFormData({ ...formData, senhaConfirmacao: e.target.value })}
                  required={!isEditing}
                  placeholder="Confirme a senha"
                />
              </div>
            </div>
            {isEditing && (
              <p className="text-sm text-slate-500">
                Deixe os campos de senha em branco se não desejar alterar a senha atual.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/usuarios')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" className="gap-2" disabled={loading}>
            <Save className="h-4 w-4" />
            {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Funcionário'}
          </Button>
        </div>
      </form>
    </div>
  )
}


