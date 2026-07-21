import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Fornecedor, FornecedorRequest, StatusFornecedor } from '@/types'
import { fornecedorService } from '@/services/fornecedorService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Save,
  Building2,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  isValidEmail,
  normalizeEmail,
  maskCPFCNPJ,
  maskPhone,
  isValidCPForCNPJ,
  unmaskCPFCNPJ,
  unmaskPhone,
} from '@/utils/validators'

export function FornecedorFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [loadingFornecedor, setLoadingFornecedor] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<FornecedorRequest>({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    status: StatusFornecedor.ATIVO,
    observacoes: '',
  })

  const [emailError, setEmailError] = useState('')
  const [cpfCnpjError, setCpfCnpjError] = useState('')

  useEffect(() => {
    if (id) {
      carregarFornecedor(id)
    }
  }, [id])

  const carregarFornecedor = async (fornecedorId: string) => {
    try {
      setLoadingFornecedor(true)
      const fornecedor = await fornecedorService.buscarPorId(fornecedorId)
      setFormData({
        nome: fornecedor.nome,
        cnpj: maskCPFCNPJ(fornecedor.cnpj),
        email: fornecedor.email,
        telefone: maskPhone(fornecedor.telefone),
        endereco: fornecedor.endereco,
        cidade: fornecedor.cidade,
        estado: fornecedor.estado,
        status: fornecedor.status,
        observacoes: fornecedor.observacoes || '',
      })
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar fornecedor')
    } finally {
      setLoadingFornecedor(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setEmailError('')
    setCpfCnpjError('')

    if (!formData.nome.trim()) {
      setError('Nome é obrigatório')
      return
    }

    const unmaskedCpfCnpj = unmaskCPFCNPJ(formData.cnpj)
    if (!unmaskedCpfCnpj) {
      setCpfCnpjError('CPF/CNPJ é obrigatório')
      return
    }

    // Valida apenas se tiver o tamanho correto (11 para CPF ou 14 para CNPJ)
    if (unmaskedCpfCnpj.length === 11) {
      // CPF - validar dígitos verificadores
      if (!isValidCPForCNPJ(formData.cnpj)) {
        setCpfCnpjError('CPF inválido')
        return
      }
    } else if (unmaskedCpfCnpj.length === 14) {
      // CNPJ - validar formato e dígitos verificadores
      if (!isValidCPForCNPJ(formData.cnpj)) {
        setCpfCnpjError('CNPJ inválido')
        return
      }
    } else {
      setCpfCnpjError('CPF/CNPJ deve ter 11 ou 14 dígitos')
      return
    }

    // Email opcional: validar apenas se foi preenchido
    const rawEmail = formData.email?.trim() || ''
    const normalizedEmail = rawEmail ? normalizeEmail(rawEmail) : ''
    if (rawEmail) {
      if (!normalizedEmail) {
        setEmailError('Email inválido')
        return
      }
      if (!isValidEmail(normalizedEmail)) {
        setEmailError('Email inválido')
        return
      }
    }

    try {
      setLoading(true)
      const dataToSubmit: FornecedorRequest = {
        ...formData,
        cnpj: unmaskedCpfCnpj,
        email: normalizedEmail || '',
        telefone: unmaskPhone(formData.telefone),
      }

      if (isEditing && id) {
        await fornecedorService.atualizar(id, dataToSubmit)
      } else {
        await fornecedorService.criar(dataToSubmit)
      }
      navigate('/fornecedores')
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar fornecedor')
    } finally {
      setLoading(false)
    }
  }

  if (loadingFornecedor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Carregando fornecedor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/fornecedores')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </h1>
          <p className="text-slate-600 mt-1">
            {isEditing ? 'Altere os dados do fornecedor' : 'Preencha os dados para criar um novo fornecedor'}
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
        {/* Dados do Fornecedor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dados do Fornecedor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="nome">Nome / Razão Social *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  placeholder="Nome completo ou razão social"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CPF/CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => {
                    const masked = maskCPFCNPJ(e.target.value)
                    setFormData({ ...formData, cnpj: masked })
                    // Limpar erro enquanto digita
                    if (cpfCnpjError) {
                      setCpfCnpjError('')
                    }
                  }}
                  onBlur={(e) => {
                    const cleaned = unmaskCPFCNPJ(e.target.value)
                    // Só valida se tiver o tamanho completo
                    if (cleaned && cleaned.length === 11) {
                      // CPF - validar dígitos verificadores
                      if (!isValidCPForCNPJ(e.target.value)) {
                        setCpfCnpjError('CPF inválido')
                      }
                    } else if (cleaned && cleaned.length === 14) {
                      // CNPJ - apenas verificar formato, não dígitos verificadores por enquanto
                      // (pode ser um CNPJ válido mas com dígitos diferentes)
                      // Se quiser validar rigorosamente, descomente a linha abaixo
                      // if (!isValidCPForCNPJ(e.target.value)) {
                      //   setCpfCnpjError('CNPJ inválido')
                      // }
                    }
                  }}
                  required
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  maxLength={18}
                  className={cpfCnpjError ? 'border-red-500' : ''}
                />
                {cpfCnpjError && (
                  <p className="text-sm text-red-600">{cpfCnpjError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusFornecedor })}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                  required
                >
                  <option value={StatusFornecedor.ATIVO}>Ativo</option>
                  <option value={StatusFornecedor.INATIVO}>Inativo</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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
                    placeholder="email@exemplo.com"
                    className={`pl-10 ${emailError ? 'border-red-500' : ''}`}
                  />
                </div>
                {emailError && (
                  <p className="text-sm text-red-600">{emailError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => {
                      const masked = maskPhone(e.target.value)
                      setFormData({ ...formData, telefone: masked })
                    }}
                    placeholder="(00) 00000-0000"
                    className="pl-10"
                    maxLength={15}
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="endereco">Endereço *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    required
                    placeholder="Rua, número, complemento"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  required
                  placeholder="Nome da cidade"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado (UF) *</Label>
                <Input
                  id="estado"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                  required
                  maxLength={2}
                  placeholder="RN"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full h-24 px-3 py-2 rounded-md border border-slate-200 bg-white resize-none"
                  placeholder="Observações sobre o fornecedor"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/fornecedores')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" className="gap-2" disabled={loading}>
            <Save className="h-4 w-4" />
            {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Fornecedor'}
          </Button>
        </div>
      </form>
    </div>
  )
}

