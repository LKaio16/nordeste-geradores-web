import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { NivelAcesso, StatusConta, TipoConta, StatusGerador } from '@/types'
import { contaService } from '@/services/contaService'
import { geradorService } from '@/services/geradorService'
import { clienteService } from '@/services/clienteService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DollarSign,
  Users,
  Zap,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Plus,
  ArrowRight,
  Calendar,
  BarChart3,
  Settings,
  UserPlus,
  Package,
  Receipt,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
} from 'lucide-react'
import { motion } from 'framer-motion'

interface DashboardStats {
  totalContasReceber: number
  totalContasPagar: number
  contasVencidas: number
  contasPendentes: number
  geradoresDisponiveis: number
  geradoresLocados: number
  geradoresManutencao: number
  totalClientes: number
  saldoAtual: number
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalContasReceber: 0,
    totalContasPagar: 0,
    contasVencidas: 0,
    contasPendentes: 0,
    geradoresDisponiveis: 0,
    geradoresLocados: 0,
    geradoresManutencao: 0,
    totalClientes: 0,
    saldoAtual: 0,
  })

  useEffect(() => {
    carregarEstatisticas()
  }, [])

  const carregarEstatisticas = async () => {
    try {
      setLoading(true)
      
      // Carregar dados em paralelo
      const [contas, geradores, clientes] = await Promise.all([
        contaService.listar().catch(() => []),
        geradorService.listar().catch(() => []),
        clienteService.listar().catch(() => []),
      ])

      // Calcular estatísticas de contas
      // A Receber: contas RECEBER que ainda não foram pagas (PENDENTE ou VENCIDO)
      const contasReceber = contas.filter(c => 
        c.tipo === TipoConta.RECEBER && 
        (c.status === StatusConta.PENDENTE || c.status === StatusConta.VENCIDO)
      )
      
      // A Pagar: contas PAGAR que ainda não foram pagas (PENDENTE ou VENCIDO)
      const contasPagar = contas.filter(c => 
        c.tipo === TipoConta.PAGAR && 
        (c.status === StatusConta.PENDENTE || c.status === StatusConta.VENCIDO)
      )
      
      const vencidas = contas.filter(c => c.status === StatusConta.VENCIDO || 
        (c.status === StatusConta.PENDENTE && new Date(c.dataVencimento) < new Date()))
      const pendentes = contas.filter(c => c.status === StatusConta.PENDENTE)

      // Somar valores das contas pendentes/vencidas
      const totalReceber = contasReceber.reduce((sum, c) => sum + c.valor, 0)
      const totalPagar = contasPagar.reduce((sum, c) => sum + c.valor, 0)
      
      // Saldo Atual: diferença entre o que está pendente a receber e o que está pendente a pagar
      const saldoAtual = totalReceber - totalPagar

      // Calcular estatísticas de geradores
      const disponiveis = geradores.filter(g => g.status === StatusGerador.DISPONIVEL).length
      const locados = geradores.filter(g => g.status === StatusGerador.LOCADO).length
      const manutencao = geradores.filter(g => g.status === StatusGerador.MANUTENCAO).length

      setStats({
        totalContasReceber: totalReceber,
        totalContasPagar: totalPagar,
        contasVencidas: vencidas.length,
        contasPendentes: pendentes.length,
        geradoresDisponiveis: disponiveis,
        geradoresLocados: locados,
        geradoresManutencao: manutencao,
        totalClientes: clientes.length,
        saldoAtual,
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Verificar permissões baseadas na role
  const canManageUsers = user?.nivelAcesso === NivelAcesso.ADMIN
  const canManageSettings = user?.nivelAcesso === NivelAcesso.ADMIN || user?.nivelAcesso === NivelAcesso.GERENTE
  const canViewReports = user?.nivelAcesso === NivelAcesso.ADMIN || user?.nivelAcesso === NivelAcesso.GERENTE
  const canManageFinance = user?.nivelAcesso === NivelAcesso.ADMIN || user?.nivelAcesso === NivelAcesso.GERENTE

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Bem-vindo, {user?.nome || 'Usuário'}! Aqui está um resumo do sistema.
          </p>
        </div>
        <div className="flex gap-2">
          {canViewReports && (
            <Button variant="outline" onClick={() => navigate('/relatorios-financeiros')} className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Relatórios
            </Button>
          )}
          {canManageSettings && (
            <Button variant="outline" onClick={() => navigate('/configuracoes')} className="gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
          )}
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo Atual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={`border-2 ${stats.saldoAtual >= 0 ? 'border-green-200 bg-gradient-to-br from-green-50 to-green-100' : 'border-red-200 bg-gradient-to-br from-red-50 to-red-100'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Saldo Pendente</p>
                  <p className={`text-3xl font-bold ${stats.saldoAtual >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {formatCurrency(stats.saldoAtual)}
                  </p>
                </div>
                {stats.saldoAtual >= 0 ? (
                  <TrendingUp className="h-10 w-10 text-green-600" />
                ) : (
                  <TrendingDown className="h-10 w-10 text-red-600" />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contas a Receber */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">A Receber</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {formatCurrency(stats.totalContasReceber)}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contas a Pagar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 mb-1">A Pagar</p>
                  <p className="text-3xl font-bold text-red-900">
                    {formatCurrency(stats.totalContasPagar)}
                  </p>
                </div>
                <TrendingDown className="h-10 w-10 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contas Vencidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className={`border-2 ${stats.contasVencidas > 0 ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100' : 'border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Contas Vencidas</p>
                  <p className={`text-3xl font-bold ${stats.contasVencidas > 0 ? 'text-orange-900' : 'text-slate-900'}`}>
                    {stats.contasVencidas}
                  </p>
                </div>
                <AlertCircle className={`h-10 w-10 ${stats.contasVencidas > 0 ? 'text-orange-600' : 'text-slate-400'}`} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Geradores Disponíveis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Geradores Disponíveis</p>
                  <p className="text-3xl font-bold text-green-900">
                    {stats.geradoresDisponiveis}
                  </p>
                </div>
                <Zap className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Geradores Locados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Geradores Locados</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {stats.geradoresLocados}
                  </p>
                </div>
                <Activity className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Geradores em Manutenção */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">Em Manutenção</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {stats.geradoresManutencao}
                  </p>
                </div>
                <AlertCircle className="h-10 w-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total de Clientes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Total de Clientes</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {stats.totalClientes}
                  </p>
                </div>
                <Users className="h-10 w-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ações Financeiras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Ações Rápidas - Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {canManageFinance && (
                <>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2 hover:bg-blue-50 hover:border-blue-300"
                    onClick={() => navigate('/contas/novo')}
                  >
                    <Plus className="h-5 w-5" />
                    <span className="text-sm font-medium">Nova Conta</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2 hover:bg-green-50 hover:border-green-300"
                    onClick={() => navigate('/relatorios-financeiros')}
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-sm font-medium">Relatório Financeiro</span>
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 hover:bg-slate-50"
                onClick={() => navigate('/contas')}
              >
                <Receipt className="h-5 w-5" />
                <span className="text-sm font-medium">Ver Contas</span>
              </Button>
              {stats.contasVencidas > 0 && (
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 hover:bg-orange-50 hover:border-orange-300"
                  onClick={() => navigate('/contas?status=VENCIDO')}
                >
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium">Contas Vencidas</span>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                    {stats.contasVencidas}
                  </span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ações Operacionais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Ações Rápidas - Operacional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => navigate('/geradores')}
              >
                <Zap className="h-5 w-5" />
                <span className="text-sm font-medium">Geradores</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 hover:bg-purple-50 hover:border-purple-300"
                onClick={() => navigate('/clientes')}
              >
                <Users className="h-5 w-5" />
                <span className="text-sm font-medium">Clientes</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 hover:bg-green-50 hover:border-green-300"
                onClick={() => navigate('/locacoes')}
              >
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-medium">Locações</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 hover:bg-orange-50 hover:border-orange-300"
                onClick={() => navigate('/ordens-servico')}
              >
                <FileText className="h-5 w-5" />
                <span className="text-sm font-medium">Ordens de Serviço</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Administrativas (Condicionais) */}
      {(canManageUsers || canManageSettings) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Ações Administrativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {canManageUsers && (
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => navigate('/usuarios')}
                >
                  <UserPlus className="h-5 w-5" />
                  <span className="text-sm font-medium">Usuários</span>
                </Button>
              )}
              {canManageSettings && (
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 hover:bg-slate-50"
                  onClick={() => navigate('/configuracoes')}
                >
                  <Settings className="h-5 w-5" />
                  <span className="text-sm font-medium">Configurações</span>
                </Button>
              )}
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 hover:bg-green-50 hover:border-green-300"
                onClick={() => navigate('/produtos')}
              >
                <Package className="h-5 w-5" />
                <span className="text-sm font-medium">Produtos</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 hover:bg-purple-50 hover:border-purple-300"
                onClick={() => navigate('/estoque')}
              >
                <Package className="h-5 w-5" />
                <span className="text-sm font-medium">Estoque</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas e Notificações */}
      {(stats.contasVencidas > 0 || stats.contasPendentes > 0) && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertCircle className="h-5 w-5" />
              Alertas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.contasVencidas > 0 && (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-slate-900">
                        {stats.contasVencidas} {stats.contasVencidas === 1 ? 'conta vencida' : 'contas vencidas'}
                      </p>
                      <p className="text-sm text-slate-600">Requer atenção imediata</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/contas?status=VENCIDO')}
                    className="gap-2"
                  >
                    Ver Contas
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {stats.contasPendentes > 0 && (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-slate-900">
                        {stats.contasPendentes} {stats.contasPendentes === 1 ? 'conta pendente' : 'contas pendentes'}
                      </p>
                      <p className="text-sm text-slate-600">Aguardando pagamento</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/contas?status=PENDENTE')}
                    className="gap-2"
                  >
                    Ver Contas
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Geradores Disponíveis</span>
              <span className="font-semibold text-green-600">{stats.geradoresDisponiveis}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Geradores Locados</span>
              <span className="font-semibold text-blue-600">{stats.geradoresLocados}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total de Clientes</span>
              <span className="font-semibold text-purple-600">{stats.totalClientes}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total a Receber</span>
              <span className="font-semibold text-green-600">{formatCurrency(stats.totalContasReceber)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total a Pagar</span>
              <span className="font-semibold text-red-600">{formatCurrency(stats.totalContasPagar)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm font-medium text-slate-900">Saldo</span>
              <span className={`font-bold text-lg ${stats.saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.saldoAtual)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              Ações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => navigate('/contas/novo')}
              >
                <Plus className="h-4 w-4" />
                Criar Nova Conta
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => navigate('/geradores')}
              >
                <Zap className="h-4 w-4" />
                Gerenciar Geradores
              </Button>
              {canViewReports && (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => navigate('/relatorios-financeiros')}
                >
                  <BarChart3 className="h-4 w-4" />
                  Ver Relatórios
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
