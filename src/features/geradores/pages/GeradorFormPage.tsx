import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Gerador, GeradorRequest, StatusGerador } from '@/types'
import { geradorService } from '@/services/geradorService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Save,
  Zap,
  AlertCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'

export function GeradorFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [loadingGerador, setLoadingGerador] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<GeradorRequest>({
    modelo: '',
    potencia: '',
    numeroSerie: '',
    marca: '',
    anoFabricacao: new Date().getFullYear(),
    horimetro: 0,
    status: StatusGerador.DISPONIVEL,
    observacoes: '',
  })

  useEffect(() => {
    if (id) {
      carregarGerador(id)
    }
  }, [id])

  const carregarGerador = async (geradorId: string) => {
    try {
      setLoadingGerador(true)
      const gerador = await geradorService.buscarPorId(geradorId)
      setFormData({
        modelo: gerador.modelo,
        potencia: gerador.potencia,
        numeroSerie: gerador.numeroSerie,
        marca: gerador.marca,
        anoFabricacao: gerador.anoFabricacao,
        horimetro: gerador.horimetro,
        status: gerador.status,
        observacoes: gerador.observacoes || '',
      })
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar gerador')
    } finally {
      setLoadingGerador(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.modelo.trim()) {
      setError('Modelo é obrigatório')
      return
    }

    if (!formData.marca.trim()) {
      setError('Marca é obrigatória')
      return
    }

    if (!formData.numeroSerie.trim()) {
      setError('Número de série é obrigatório')
      return
    }

    if (!formData.potencia.trim()) {
      setError('Potência é obrigatória')
      return
    }

    if (formData.anoFabricacao < 1900 || formData.anoFabricacao > new Date().getFullYear() + 1) {
      setError('Ano de fabricação inválido')
      return
    }

    if (formData.horimetro < 0) {
      setError('Horímetro não pode ser negativo')
      return
    }

    try {
      setLoading(true)
      if (isEditing && id) {
        await geradorService.atualizar(id, formData)
      } else {
        await geradorService.criar(formData)
      }
      navigate('/geradores')
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar gerador')
    } finally {
      setLoading(false)
    }
  }

  if (loadingGerador) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Carregando gerador...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/geradores')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isEditing ? 'Editar Gerador' : 'Novo Gerador'}
            </h1>
            <p className="text-slate-600 mt-1">
              {isEditing ? 'Edite as informações do gerador' : 'Preencha os dados para cadastrar um novo gerador'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Dados do Gerador */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Dados do Gerador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo *</Label>
                <Input
                  id="modelo"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  placeholder="Ex: DG-150"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marca">Marca *</Label>
                <Input
                  id="marca"
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  placeholder="Ex: Stemac"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroSerie">Número de Série *</Label>
                <Input
                  id="numeroSerie"
                  value={formData.numeroSerie}
                  onChange={(e) => setFormData({ ...formData, numeroSerie: e.target.value })}
                  placeholder="Ex: GEN2025001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="potencia">Potência *</Label>
                <Input
                  id="potencia"
                  value={formData.potencia}
                  onChange={(e) => setFormData({ ...formData, potencia: e.target.value })}
                  placeholder="Ex: 150 kVA"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="anoFabricacao">Ano de Fabricação *</Label>
                <Input
                  id="anoFabricacao"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={formData.anoFabricacao}
                  onChange={(e) => setFormData({ ...formData, anoFabricacao: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="horimetro">Horímetro (horas) *</Label>
                <Input
                  id="horimetro"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.horimetro}
                  onChange={(e) => setFormData({ ...formData, horimetro: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusGerador })}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  required
                >
                  <option value={StatusGerador.DISPONIVEL}>Disponível</option>
                  <option value={StatusGerador.LOCADO}>Locado</option>
                  <option value={StatusGerador.MANUTENCAO}>Em Manutenção</option>
                  <option value={StatusGerador.INATIVO}>Inativo</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <textarea
                id="observacoes"
                value={formData.observacoes || ''}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações adicionais sobre o gerador..."
                rows={4}
                className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/geradores')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" className="gap-2" disabled={loading}>
            <Save className="h-4 w-4" />
            {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Gerador'}
          </Button>
        </div>
      </form>
    </div>
  )
}

