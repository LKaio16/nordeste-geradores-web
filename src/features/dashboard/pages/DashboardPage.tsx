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
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  LayoutDashboard,
  Sparkles,
  ChevronRight,
  type LucideIcon,
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

type StatVariant = 'success' | 'brand' | 'danger' | 'warning' | 'neutral' | 'violet' | 'amber'

const statVariants: Record<
  StatVariant,
  { ring: string; iconWrap: string; icon: string; accent: string }
> = {
  success: {
    ring: 'ring-emerald-200/70',
    iconWrap: 'bg-emerald-50',
    icon: 'text-emerald-600',
    accent: 'from-emerald-500/10',
  },
  brand: {
    ring: 'ring-[#203d7b]/25',
    iconWrap: 'bg-[#203d7b]/10',
    icon: 'text-[#203d7b]',
    accent: 'from-[#203d7b]/15',
  },
  danger: {
    ring: 'ring-rose-200/80',
    iconWrap: 'bg-rose-50',
    icon: 'text-rose-600',
    accent: 'from-rose-500/10',
  },
  warning: {
    ring: 'ring-amber-200/80',
    iconWrap: 'bg-amber-50',
    icon: 'text-amber-600',
    accent: 'from-amber-500/10',
  },
  neutral: {
    ring: 'ring-slate-200/90',
    iconWrap: 'bg-slate-100',
    icon: 'text-slate-500',
    accent: 'from-slate-400/10',
  },
  violet: {
    ring: 'ring-violet-200/80',
    iconWrap: 'bg-violet-50',
    icon: 'text-violet-600',
    accent: 'from-violet-500/10',
  },
  amber: {
    ring: 'ring-orange-200/80',
    iconWrap: 'bg-orange-50',
    icon: 'text-orange-600',
    accent: 'from-orange-500/10',
  },
}

function StatCard({
  label,
  value,
  icon: Icon,
  variant,
  delay = 0,
  highlightValueClass,
}: {
  label: string
  value: React.ReactNode
  icon: LucideIcon
  variant: StatVariant
  delay?: number
  highlightValueClass?: string
}) {
  const v = statVariants[variant]
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1], delay }}
    >
      <div
        className={`group relative overflow-hidden rounded-2xl border border-slate-100/90 bg-white p-5 shadow-sm ring-1 ${v.ring} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}
      >
        <div
          className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${v.accent} to-transparent opacity-70`}
        />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
            <p
              className={`mt-2 text-2xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-[1.65rem] ${highlightValueClass ?? ''}`}
            >
              {value}
            </p>
          </div>
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${v.iconWrap} shadow-inner transition-transform duration-300 group-hover:scale-105`}
          >
            <Icon className={`h-5 w-5 ${v.icon}`} strokeWidth={2} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function QuickTile({
  icon: Icon,
  title,
  description,
  onClick,
  tone = 'slate',
}: {
  icon: LucideIcon
  title: string
  description?: string
  onClick: () => void
  tone?: 'slate' | 'brand' | 'emerald' | 'amber' | 'violet' | 'orange'
}) {
  const tones = {
    slate: 'hover:border-slate-300 hover:bg-slate-50/90',
    brand: 'hover:border-[#203d7b]/35 hover:bg-[#203d7b]/[0.06]',
    emerald: 'hover:border-emerald-300/60 hover:bg-emerald-50/80',
    amber: 'hover:border-amber-300/60 hover:bg-amber-50/80',
    violet: 'hover:border-violet-300/60 hover:bg-violet-50/80',
    orange: 'hover:border-orange-300/60 hover:bg-orange-50/80',
  }
  const iconTones = {
    slate: 'bg-white text-slate-600 shadow-sm ring-1 ring-slate-200/80',
    brand: 'bg-[#203d7b]/10 text-[#203d7b] ring-1 ring-[#203d7b]/15',
    emerald: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60',
    amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60',
    violet: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200/60',
    orange: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200/60',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full flex-col items-start gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-4 text-left backdrop-blur-sm transition-all duration-200 ${tones[tone]} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#203d7b]/30`}
    >
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconTones[tone]}`}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>
      <span className="flex w-full items-center justify-between gap-2">
        <span>
          <span className="block text-sm font-semibold text-slate-900">{title}</span>
          {description ? <span className="mt-0.5 block text-xs text-slate-500">{description}</span> : null}
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 group-hover:translate-x-0.5" />
      </span>
    </button>
  )
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

      const [contas, geradores, clientes] = await Promise.all([
        contaService.listar().catch(() => []),
        geradorService.listarTodos().catch(() => []),
        clienteService.listar().catch(() => []),
      ])

      const contasReceber = contas.filter(
        (c) =>
          c.tipo === TipoConta.RECEBER && (c.status === StatusConta.PENDENTE || c.status === StatusConta.VENCIDO)
      )

      const contasPagar = contas.filter(
        (c) => c.tipo === TipoConta.PAGAR && (c.status === StatusConta.PENDENTE || c.status === StatusConta.VENCIDO)
      )

      const vencidas = contas.filter(
        (c) =>
          c.status === StatusConta.VENCIDO ||
          (c.status === StatusConta.PENDENTE && new Date(c.dataVencimento) < new Date())
      )
      const pendentes = contas.filter((c) => c.status === StatusConta.PENDENTE)

      const totalReceber = contasReceber.reduce((sum, c) => sum + c.valor, 0)
      const totalPagar = contasPagar.reduce((sum, c) => sum + c.valor, 0)
      const saldoAtual = totalReceber - totalPagar

      const disponiveis = geradores.filter((g) => g.status === StatusGerador.DISPONIVEL).length
      const locados = geradores.filter((g) => g.status === StatusGerador.LOCADO).length
      const manutencao = geradores.filter((g) => g.status === StatusGerador.MANUTENCAO).length

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

  const canManageUsers = user?.nivelAcesso === NivelAcesso.ADMIN
  const canManageSettings = user?.nivelAcesso === NivelAcesso.ADMIN || user?.nivelAcesso === NivelAcesso.GERENTE
  const canViewReports = user?.nivelAcesso === NivelAcesso.ADMIN || user?.nivelAcesso === NivelAcesso.GERENTE
  const canManageFinance = user?.nivelAcesso === NivelAcesso.ADMIN || user?.nivelAcesso === NivelAcesso.GERENTE

  const hoje = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-14 w-14 rounded-2xl border-2 border-[#203d7b]/20 border-t-[#203d7b] animate-spin" />
          <LayoutDashboard className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-[#203d7b]/60" />
        </div>
        <p className="text-sm font-medium text-slate-600">Carregando seu painel…</p>
      </div>
    )
  }

  const saldoVariant: StatVariant = stats.saldoAtual >= 0 ? 'success' : 'danger'
  const saldoIcon = stats.saldoAtual >= 0 ? TrendingUp : TrendingDown
  const vencidasVariant: StatVariant = stats.contasVencidas > 0 ? 'warning' : 'neutral'

  return (
    <div className="space-y-8 pb-10">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#203d7b] via-[#2a4f9e] to-slate-900 px-6 py-8 text-white shadow-xl shadow-[#203d7b]/20 sm:px-10 sm:py-10"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-200" />
              {hoje}
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Olá, {user?.nome?.split(' ')[0] || 'Usuário'}
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
              Visão geral do negócio em um só lugar — finanças, frota e clientes com números atualizados.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canViewReports && (
              <Button
                variant="secondary"
                className="gap-2 border-0 bg-white/95 text-[#203d7b] shadow-md hover:bg-white"
                onClick={() => navigate('/relatorios-financeiros')}
              >
                <BarChart3 className="h-4 w-4" />
                Relatórios
              </Button>
            )}
            {canManageSettings && (
              <Button
                variant="outline"
                className="gap-2 border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                onClick={() => navigate('/configuracoes')}
              >
                <Settings className="h-4 w-4" />
                Configurações
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Alertas compactos */}
      {(stats.contasVencidas > 0 || stats.contasPendentes > 0) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="grid gap-3 sm:grid-cols-2"
        >
          {stats.contasVencidas > 0 && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50 to-orange-50/80 px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-amber-200/60">
                  <XCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {stats.contasVencidas} {stats.contasVencidas === 1 ? 'conta vencida' : 'contas vencidas'}
                  </p>
                  <p className="text-xs text-slate-600">Priorize a regularização</p>
                </div>
              </div>
              <Button size="sm" className="shrink-0 gap-1 bg-[#203d7b] hover:bg-[#1a3366]" onClick={() => navigate('/contas?status=VENCIDO')}>
                Ver
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
          {stats.contasPendentes > 0 && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200/80">
                  <Clock className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {stats.contasPendentes} {stats.contasPendentes === 1 ? 'conta pendente' : 'contas pendentes'}
                  </p>
                  <p className="text-xs text-slate-600">Aguardando pagamento</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="shrink-0 gap-1" onClick={() => navigate('/contas?status=PENDENTE')}>
                Ver
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {/* Financeiro */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#203d7b]/10">
            <DollarSign className="h-4 w-4 text-[#203d7b]" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Financeiro</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Saldo pendente"
            value={formatCurrency(stats.saldoAtual)}
            icon={saldoIcon}
            variant={saldoVariant}
            delay={0.02}
            highlightValueClass={stats.saldoAtual >= 0 ? 'text-emerald-700' : 'text-rose-700'}
          />
          <StatCard
            label="A receber"
            value={formatCurrency(stats.totalContasReceber)}
            icon={TrendingUp}
            variant="brand"
            delay={0.06}
          />
          <StatCard
            label="A pagar"
            value={formatCurrency(stats.totalContasPagar)}
            icon={TrendingDown}
            variant="danger"
            delay={0.1}
          />
          <StatCard
            label="Contas vencidas"
            value={stats.contasVencidas}
            icon={AlertCircle}
            variant={vencidasVariant}
            delay={0.14}
            highlightValueClass={stats.contasVencidas > 0 ? 'text-amber-700' : undefined}
          />
        </div>
      </section>

      {/* Operação */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
            <Activity className="h-4 w-4 text-slate-700" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Operação</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Geradores disponíveis"
            value={stats.geradoresDisponiveis}
            icon={Zap}
            variant="success"
            delay={0.06}
          />
          <StatCard
            label="Geradores locados"
            value={stats.geradoresLocados}
            icon={Activity}
            variant="brand"
            delay={0.1}
          />
          <StatCard
            label="Em manutenção"
            value={stats.geradoresManutencao}
            icon={AlertCircle}
            variant="amber"
            delay={0.14}
          />
          <StatCard label="Clientes" value={stats.totalClientes} icon={Users} variant="violet" delay={0.18} />
        </div>
      </section>

      {/* Atalhos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden border-slate-200/80 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#203d7b]/10">
                <DollarSign className="h-4 w-4 text-[#203d7b]" />
              </span>
              Atalhos — Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
            {canManageFinance && (
              <>
                <QuickTile
                  icon={Plus}
                  title="Nova conta"
                  description="Lançar receita ou despesa"
                  tone="brand"
                  onClick={() => navigate('/contas/novo')}
                />
                <QuickTile
                  icon={BarChart3}
                  title="Relatório financeiro"
                  description="Análise e exportação"
                  tone="emerald"
                  onClick={() => navigate('/relatorios-financeiros')}
                />
              </>
            )}
            <QuickTile
              icon={Receipt}
              title="Todas as contas"
              description="Lista e filtros"
              tone="slate"
              onClick={() => navigate('/contas')}
            />
            {stats.contasVencidas > 0 && (
              <QuickTile
                icon={AlertCircle}
                title="Contas vencidas"
                description={`${stats.contasVencidas} em aberto`}
                tone="amber"
                onClick={() => navigate('/contas?status=VENCIDO')}
              />
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200/80 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200/80">
                <Zap className="h-4 w-4 text-slate-800" />
              </span>
              Atalhos — Operacional
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
            <QuickTile
              icon={Zap}
              title="Geradores"
              description="Frota e status"
              tone="brand"
              onClick={() => navigate('/geradores')}
            />
            <QuickTile
              icon={Users}
              title="Clientes"
              description="Cadastro e contatos"
              tone="violet"
              onClick={() => navigate('/clientes')}
            />
            <QuickTile
              icon={Calendar}
              title="Locações"
              description="Contratos ativos"
              tone="emerald"
              onClick={() => navigate('/locacoes')}
            />
            <QuickTile
              icon={FileText}
              title="Ordens de serviço"
              description="OS e manutenção"
              tone="orange"
              onClick={() => navigate('/ordens-servico')}
            />
          </CardContent>
        </Card>
      </div>

      {(canManageUsers || canManageSettings) && (
        <Card className="overflow-hidden border-slate-200/80 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-white">
                <Settings className="h-4 w-4" />
              </span>
              Administração
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {canManageUsers && (
              <QuickTile icon={UserPlus} title="Usuários" tone="violet" onClick={() => navigate('/usuarios')} />
            )}
            {canManageSettings && (
              <QuickTile icon={Settings} title="Configurações" tone="slate" onClick={() => navigate('/configuracoes')} />
            )}
            <QuickTile icon={Package} title="Produtos" tone="emerald" onClick={() => navigate('/produtos')} />
            <QuickTile icon={Package} title="Estoque" tone="amber" onClick={() => navigate('/estoque')} />
          </CardContent>
        </Card>
      )}

      {/* Resumo consolidado */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Frota e clientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Disponíveis para locação', value: stats.geradoresDisponiveis, color: 'text-emerald-600' },
              { label: 'Em campo (locados)', value: stats.geradoresLocados, color: 'text-[#203d7b]' },
              { label: 'Manutenção', value: stats.geradoresManutencao, color: 'text-orange-600' },
              { label: 'Clientes cadastrados', value: stats.totalClientes, color: 'text-violet-600' },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/40 px-3 py-2.5"
              >
                <span className="text-sm text-slate-600">{row.label}</span>
                <span className={`text-sm font-bold tabular-nums ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-5 w-5 text-[#203d7b]" />
              Resumo financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/40 px-3 py-2.5">
              <span className="text-sm text-slate-600">A receber</span>
              <span className="text-sm font-bold tabular-nums text-emerald-600">
                {formatCurrency(stats.totalContasReceber)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/40 px-3 py-2.5">
              <span className="text-sm text-slate-600">A pagar</span>
              <span className="text-sm font-bold tabular-nums text-rose-600">
                {formatCurrency(stats.totalContasPagar)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-emerald-200/60 bg-emerald-50/50 px-3 py-3">
              <span className="text-sm font-semibold text-slate-800">Saldo pendente</span>
              <span
                className={`text-lg font-bold tabular-nums ${stats.saldoAtual >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}
              >
                {formatCurrency(stats.saldoAtual)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
