import { useState, useEffect } from 'react'
import { relatorioFinanceiroService } from '@/services/relatorioFinanceiroService'
import { relatorioNotaFiscalService, RelatorioNotaFiscal } from '@/services/relatorioNotaFiscalService'
import { RelatorioFinanceiro, MesRelatorio } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Calendar, Download, TrendingUp, TrendingDown, DollarSign, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Eye, Clock, Receipt, FileCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type TipoRelatorio = 'contas' | 'notas-fiscais'

export function RelatoriosFinanceirosPage() {
  const [tipoRelatorio, setTipoRelatorio] = useState<TipoRelatorio>('contas')
  const [relatorio, setRelatorio] = useState<RelatorioFinanceiro | null>(null)
  const [relatorioNotas, setRelatorioNotas] = useState<RelatorioNotaFiscal | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dataInicio, setDataInicio] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 6)
    return date.toISOString().split('T')[0]
  })
  const [dataFim, setDataFim] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [detalhesExpandidos, setDetalhesExpandidos] = useState({
    operacional: false,
    investimento: false,
    financiamento: false,
    entradas: false,
    saidas: false,
  })
  const [periodoSelecionado, setPeriodoSelecionado] = useState<'personalizado' | 'mes-atual' | 'mes-anterior' | 'trimestre' | 'semestre' | 'ano-atual' | 'ano-anterior'>('personalizado')

  const definirPeriodo = (periodo: typeof periodoSelecionado) => {
    setPeriodoSelecionado(periodo)
    const hoje = new Date()
    let inicio: Date, fim: Date

    switch (periodo) {
      case 'mes-atual':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
        fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
        break
      case 'mes-anterior':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
        fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0)
        break
      case 'trimestre':
        const trimestreAtual = Math.floor(hoje.getMonth() / 3)
        inicio = new Date(hoje.getFullYear(), trimestreAtual * 3, 1)
        fim = new Date(hoje.getFullYear(), (trimestreAtual + 1) * 3, 0)
        break
      case 'semestre':
        const semestreAtual = Math.floor(hoje.getMonth() / 6)
        inicio = new Date(hoje.getFullYear(), semestreAtual * 6, 1)
        fim = new Date(hoje.getFullYear(), (semestreAtual + 1) * 6, 0)
        break
      case 'ano-atual':
        inicio = new Date(hoje.getFullYear(), 0, 1)
        fim = new Date(hoje.getFullYear(), 11, 31)
        break
      case 'ano-anterior':
        inicio = new Date(hoje.getFullYear() - 1, 0, 1)
        fim = new Date(hoje.getFullYear() - 1, 11, 31)
        break
      default:
        return // personalizado - não altera as datas
    }

    setDataInicio(inicio.toISOString().split('T')[0])
    setDataFim(fim.toISOString().split('T')[0])
  }

  useEffect(() => {
    carregarRelatorio()
  }, [])

  const carregarRelatorio = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (tipoRelatorio === 'contas') {
        const data = await relatorioFinanceiroService.gerarRelatorio(dataInicio, dataFim)
        setRelatorio(data)
        setRelatorioNotas(null)
      } else {
        const data = await relatorioNotaFiscalService.gerarRelatorio(dataInicio, dataFim)
        setRelatorioNotas(data)
        setRelatorio(null)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar relatório')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarRelatorio()
  }, [tipoRelatorio, dataInicio, dataFim])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const renderCell = (value: number, isExpense = false) => {
    const formatted = formatCurrency(Math.abs(value))
    const isZero = value === 0
    
    // Se for despesa (isExpense = true), sempre vermelho
    // Se for receita (isExpense = false), sempre verde
    // Se for resultado líquido, verde se positivo, vermelho se negativo
    let colorClass = 'text-slate-700'
    if (isExpense) {
      // Despesas sempre em vermelho
      colorClass = 'text-red-600 font-semibold'
    } else if (!isZero) {
      // Receitas/entradas sempre em verde
      colorClass = 'text-green-600 font-semibold'
    }
    
    return (
      <td className="px-3 py-2 text-right text-sm whitespace-nowrap">
        {!isZero ? (
          <span className={colorClass}>
            {formatted}
          </span>
        ) : (
          <span className="text-slate-400">-</span>
        )}
      </td>
    )
  }

  const renderCellResultado = (value: number) => {
    const formatted = formatCurrency(Math.abs(value))
    const isZero = value === 0
    const isPositive = value >= 0
    
    return (
      <td className="px-3 py-2 text-right text-sm whitespace-nowrap">
        {!isZero ? (
          <span className={isPositive ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
            {value < 0 ? '-' : ''}{formatted}
          </span>
        ) : (
          <span className="text-slate-400">-</span>
        )}
      </td>
    )
  }

  const toggleDetalhes = (secao: keyof typeof detalhesExpandidos) => {
    setDetalhesExpandidos(prev => ({
      ...prev,
      [secao]: !prev[secao]
    }))
  }

  if (loading && !relatorio) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Relatório Financeiro</h1>
          <p className="text-slate-600 mt-1">Fluxo de Caixa e Análise Financeira</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Botão de alternância entre tipos de relatório */}
          <div className="flex items-center gap-2 border border-slate-200 rounded-md p-1">
            <Button
              variant={tipoRelatorio === 'contas' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTipoRelatorio('contas')}
              className="gap-2"
            >
              <FileCheck className="h-4 w-4" />
              Contas
            </Button>
            <Button
              variant={tipoRelatorio === 'notas-fiscais' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTipoRelatorio('notas-fiscais')}
              className="gap-2"
            >
              <Receipt className="h-4 w-4" />
              Notas Fiscais
            </Button>
          </div>
          {(relatorio || relatorioNotas) && (
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Período
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seleção Rápida de Período */}
          <div>
            <Label className="mb-2 block text-sm font-medium">Períodos Rápidos</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={periodoSelecionado === 'mes-atual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => definirPeriodo('mes-atual')}
                className="gap-2"
              >
                <Clock className="h-4 w-4" />
                Mês Atual
              </Button>
              <Button
                variant={periodoSelecionado === 'mes-anterior' ? 'default' : 'outline'}
                size="sm"
                onClick={() => definirPeriodo('mes-anterior')}
                className="gap-2"
              >
                <Clock className="h-4 w-4" />
                Mês Anterior
              </Button>
              <Button
                variant={periodoSelecionado === 'trimestre' ? 'default' : 'outline'}
                size="sm"
                onClick={() => definirPeriodo('trimestre')}
                className="gap-2"
              >
                <Clock className="h-4 w-4" />
                Trimestre
              </Button>
              <Button
                variant={periodoSelecionado === 'semestre' ? 'default' : 'outline'}
                size="sm"
                onClick={() => definirPeriodo('semestre')}
                className="gap-2"
              >
                <Clock className="h-4 w-4" />
                Semestre
              </Button>
              <Button
                variant={periodoSelecionado === 'ano-atual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => definirPeriodo('ano-atual')}
                className="gap-2"
              >
                <Clock className="h-4 w-4" />
                Ano Atual
              </Button>
              <Button
                variant={periodoSelecionado === 'ano-anterior' ? 'default' : 'outline'}
                size="sm"
                onClick={() => definirPeriodo('ano-anterior')}
                className="gap-2"
              >
                <Clock className="h-4 w-4" />
                Ano Anterior
              </Button>
              <Button
                variant={periodoSelecionado === 'personalizado' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriodoSelecionado('personalizado')}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                Personalizado
              </Button>
            </div>
          </div>

          {/* Seleção Manual de Datas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
            <div>
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => {
                  setDataInicio(e.target.value)
                  setPeriodoSelecionado('personalizado')
                }}
              />
            </div>
            <div>
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => {
                  setDataFim(e.target.value)
                  setPeriodoSelecionado('personalizado')
                }}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={carregarRelatorio} className="w-full gap-2">
                <FileText className="h-4 w-4" />
                Gerar Relatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Relatório de Notas Fiscais */}
      {tipoRelatorio === 'notas-fiscais' && relatorioNotas && (
        <div className="space-y-6">
          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total Entradas</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {formatCurrency(relatorioNotas.totais.totalEntradas)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {relatorioNotas.totais.totalQuantidadeEntradas} nota(s)
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total Saídas</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {formatCurrency(relatorioNotas.totais.totalSaidas)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {relatorioNotas.totais.totalQuantidadeSaidas} nota(s)
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Saldo Final</p>
                    <p className={`text-2xl font-bold mt-1 ${
                      relatorioNotas.totais.saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(relatorioNotas.totais.saldoFinal)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-slate-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total de Notas</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {relatorioNotas.totais.totalQuantidadeEntradas + relatorioNotas.totais.totalQuantidadeSaidas}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {relatorioNotas.totais.totalQuantidadeEntradas} entrada(s) / {relatorioNotas.totais.totalQuantidadeSaidas} saída(s)
                    </p>
                  </div>
                  <Receipt className="h-8 w-8 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela Mensal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatório Mensal de Notas Fiscais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700">Mês</th>
                      <th className="px-3 py-2 text-right text-sm font-semibold text-slate-700">Saldo Início</th>
                      <th className="px-3 py-2 text-right text-sm font-semibold text-green-700">Entradas</th>
                      <th className="px-3 py-2 text-right text-sm font-semibold text-red-700">Saídas</th>
                      <th className="px-3 py-2 text-right text-sm font-semibold text-slate-700">Saldo Final</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold text-slate-700">Qtd. Entradas</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold text-slate-700">Qtd. Saídas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {relatorioNotas.meses.map((mes, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium text-slate-900">{mes.mes}</td>
                        <td className="px-3 py-2 text-right text-sm text-slate-600">
                          {formatCurrency(mes.saldoInicio)}
                        </td>
                        <td className="px-3 py-2 text-right text-sm text-green-600 font-semibold">
                          {formatCurrency(mes.totalEntradas)}
                        </td>
                        <td className="px-3 py-2 text-right text-sm text-red-600 font-semibold">
                          {formatCurrency(mes.totalSaidas)}
                        </td>
                        <td className={`px-3 py-2 text-right text-sm font-semibold ${
                          mes.saldoFimPeriodo >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(mes.saldoFimPeriodo)}
                        </td>
                        <td className="px-3 py-2 text-center text-sm text-slate-600">
                          {mes.quantidadeEntradas}
                        </td>
                        <td className="px-3 py-2 text-center text-sm text-slate-600">
                          {mes.quantidadeSaidas}
                        </td>
                      </tr>
                    ))}
                    {/* Total */}
                    <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold">
                      <td className="px-3 py-2 font-bold text-slate-900">TOTAL</td>
                      <td className="px-3 py-2 text-right text-sm text-slate-600">-</td>
                      <td className="px-3 py-2 text-right text-sm text-green-600">
                        {formatCurrency(relatorioNotas.totais.totalEntradas)}
                      </td>
                      <td className="px-3 py-2 text-right text-sm text-red-600">
                        {formatCurrency(relatorioNotas.totais.totalSaidas)}
                      </td>
                      <td className={`px-3 py-2 text-right text-sm ${
                        relatorioNotas.totais.saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(relatorioNotas.totais.saldoFinal)}
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-slate-600">
                        {relatorioNotas.totais.totalQuantidadeEntradas}
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-slate-600">
                        {relatorioNotas.totais.totalQuantidadeSaidas}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Relatório de Contas */}
      {tipoRelatorio === 'contas' && relatorio && (
        <div className="space-y-6">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Entradas</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {formatCurrency(relatorio.totais.totalEntradas)}
                    </p>
                  </div>
                  <ArrowUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Total Saídas</p>
                    <p className="text-2xl font-bold text-red-900 mt-1">
                      {formatCurrency(relatorio.totais.totalSaidas)}
                    </p>
                  </div>
                  <ArrowDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-gradient-to-br ${relatorio.totais.resultadoCaixaPeriodo >= 0 ? 'from-green-50 to-green-100 border-green-200' : 'from-red-50 to-red-100 border-red-200'}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${relatorio.totais.resultadoCaixaPeriodo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Resultado do Período
                    </p>
                    <p className={`text-2xl font-bold mt-1 ${relatorio.totais.resultadoCaixaPeriodo >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                      {formatCurrency(relatorio.totais.resultadoCaixaPeriodo)}
                    </p>
                  </div>
                  {relatorio.totais.resultadoCaixaPeriodo >= 0 ? (
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Caixa Operacional</p>
                    <p className={`text-2xl font-bold mt-1 ${relatorio.totais.caixaLiquidoOperacional >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(relatorio.totais.caixaLiquidoOperacional)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-slate-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo por Atividade */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo por Atividade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Atividade</th>
                      {relatorio.meses.map((mes) => (
                        <th key={mes.mesAno} className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase min-w-[130px]">
                          {mes.mesAno}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase bg-blue-50 min-w-[130px]">
                        TOTAL
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="hover:bg-blue-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          Operacional
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => toggleDetalhes('operacional')}
                          >
                            {detalhesExpandidos.operacional ? (
                              <>
                                <ChevronUp className="h-3 w-3 mr-1" />
                                Ocultar
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Detalhes
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                      {relatorio.meses.map((mes) => renderCellResultado(mes.caixaLiquidoOperacional))}
                      {renderCellResultado(relatorio.totais.caixaLiquidoOperacional)}
                    </tr>
                    <tr className="hover:bg-purple-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          Investimento
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => toggleDetalhes('investimento')}
                          >
                            {detalhesExpandidos.investimento ? (
                              <>
                                <ChevronUp className="h-3 w-3 mr-1" />
                                Ocultar
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Detalhes
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                      {relatorio.meses.map((mes) => renderCellResultado(mes.caixaLiquidoInvestimento))}
                      {renderCellResultado(relatorio.totais.caixaLiquidoInvestimento)}
                    </tr>
                    <tr className="hover:bg-orange-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          Financiamento
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => toggleDetalhes('financiamento')}
                          >
                            {detalhesExpandidos.financiamento ? (
                              <>
                                <ChevronUp className="h-3 w-3 mr-1" />
                                Ocultar
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Detalhes
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                      {relatorio.meses.map((mes) => renderCellResultado(mes.caixaLiquidoFinanciamento))}
                      {renderCellResultado(relatorio.totais.caixaLiquidoFinanciamento)}
                    </tr>
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                      <td className="px-4 py-3 font-bold text-slate-900">Resultado Final</td>
                      {relatorio.meses.map((mes) => renderCellResultado(mes.resultadoCaixaPeriodo))}
                      {renderCellResultado(relatorio.totais.resultadoCaixaPeriodo)}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Detalhes Operacional */}
              <AnimatePresence>
                {detalhesExpandidos.operacional && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 overflow-hidden"
                  >
                    <Card className="bg-blue-50/30 border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-sm">Detalhes - Atividades Operacionais</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead className="bg-blue-100/50">
                              <tr>
                                <th className="px-3 py-2 text-left font-semibold">Item</th>
                                {relatorio.meses.map((mes) => (
                                  <th key={mes.mesAno} className="px-3 py-2 text-right font-semibold min-w-[100px]">
                                    {mes.mesAno}
                                  </th>
                                ))}
                                <th className="px-3 py-2 text-right font-semibold bg-blue-200 min-w-[100px]">TOTAL</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-200/50">
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Recebimento via Boleto</td>
                                {relatorio.meses.map((mes) => renderCell(mes.recebimentoBoleto))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.recebimentoBoleto, 0))}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Recebimento via Transferência</td>
                                {relatorio.meses.map((mes) => renderCell(mes.recebimentoTransferencia))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.recebimentoTransferencia, 0))}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Recebimento via PIX</td>
                                {relatorio.meses.map((mes) => renderCell(mes.recebimentoPix))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.recebimentoPix, 0))}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Outros Recebimentos</td>
                                {relatorio.meses.map((mes) => renderCell(mes.outrosRecebimentos))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.outrosRecebimentos, 0))}
                              </tr>
                              <tr className="border-t border-blue-300">
                                <td className="px-3 py-2 font-semibold text-slate-900">Pagamentos Fornecedores</td>
                                {relatorio.meses.map((mes) => renderCell(mes.pagamentosFornecedores, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.pagamentosFornecedores, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Despesas Variáveis</td>
                                {relatorio.meses.map((mes) => renderCell(mes.pagamentosDespesasVariaveis, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.pagamentosDespesasVariaveis, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Impostos</td>
                                {relatorio.meses.map((mes) => renderCell(mes.pagamentosImpostos, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.pagamentosImpostos, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Despesas Administrativas</td>
                                {relatorio.meses.map((mes) => renderCell(mes.pagamentosDespesasAdministrativas, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.pagamentosDespesasAdministrativas, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Despesas com Pessoal</td>
                                {relatorio.meses.map((mes) => renderCell(mes.pagamentosDespesasPessoal, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.pagamentosDespesasPessoal, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Despesas Financeiras</td>
                                {relatorio.meses.map((mes) => renderCell(mes.pagamentosDespesasFinanceiras, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.pagamentosDespesasFinanceiras, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Serviços de Terceiros</td>
                                {relatorio.meses.map((mes) => renderCell(mes.pagamentosCustosServicosTerceiros, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.pagamentosCustosServicosTerceiros, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Manutenção</td>
                                {relatorio.meses.map((mes) => renderCell(mes.pagamentosDespesasManutencao, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.pagamentosDespesasManutencao, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Marketing</td>
                                {relatorio.meses.map((mes) => renderCell(mes.pagamentosDespesasMarketing, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.pagamentosDespesasMarketing, 0), true)}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Detalhes Investimento */}
              <AnimatePresence>
                {detalhesExpandidos.investimento && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 overflow-hidden"
                  >
                    <Card className="bg-purple-50/30 border-purple-200">
                      <CardHeader>
                        <CardTitle className="text-sm">Detalhes - Atividades de Investimento</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead className="bg-purple-100/50">
                              <tr>
                                <th className="px-3 py-2 text-left font-semibold">Item</th>
                                {relatorio.meses.map((mes) => (
                                  <th key={mes.mesAno} className="px-3 py-2 text-right font-semibold min-w-[100px]">
                                    {mes.mesAno}
                                  </th>
                                ))}
                                <th className="px-3 py-2 text-right font-semibold bg-purple-200 min-w-[100px]">TOTAL</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-200/50">
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Bônus e Rendimentos</td>
                                {relatorio.meses.map((mes) => renderCell(mes.bonusRendimentos))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.bonusRendimentos, 0))}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Resgate Automático</td>
                                {relatorio.meses.map((mes) => renderCell(mes.resgateAutomatico))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.resgateAutomatico, 0))}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Aplicação Automática</td>
                                {relatorio.meses.map((mes) => renderCell(mes.aplicacaoAutomatica, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.aplicacaoAutomatica, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Aquisições de Ativo Imobilizado</td>
                                {relatorio.meses.map((mes) => renderCell(mes.aquisicoesAtivoImobilizado, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.aquisicoesAtivoImobilizado, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Obras e Reformas</td>
                                {relatorio.meses.map((mes) => renderCell(mes.obrasReformas, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.obrasReformas, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Investimentos</td>
                                {relatorio.meses.map((mes) => renderCell(mes.investimentos, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.investimentos, 0), true)}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Detalhes Financiamento */}
              <AnimatePresence>
                {detalhesExpandidos.financiamento && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 overflow-hidden"
                  >
                    <Card className="bg-orange-50/30 border-orange-200">
                      <CardHeader>
                        <CardTitle className="text-sm">Detalhes - Atividades de Financiamento</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead className="bg-orange-100/50">
                              <tr>
                                <th className="px-3 py-2 text-left font-semibold">Item</th>
                                {relatorio.meses.map((mes) => (
                                  <th key={mes.mesAno} className="px-3 py-2 text-right font-semibold min-w-[100px]">
                                    {mes.mesAno}
                                  </th>
                                ))}
                                <th className="px-3 py-2 text-right font-semibold bg-orange-200 min-w-[100px]">TOTAL</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-200/50">
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Recebimento de Empréstimo</td>
                                {relatorio.meses.map((mes) => renderCell(mes.recebimentoEmprestimo))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.recebimentoEmprestimo, 0))}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Recebimento Seguro</td>
                                {relatorio.meses.map((mes) => renderCell(mes.recebimentoSeguro))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.recebimentoSeguro, 0))}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Recebimento Outras Empresas</td>
                                {relatorio.meses.map((mes) => renderCell(mes.recebimentoOutrasEmpresas))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.recebimentoOutrasEmpresas, 0))}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Ressarcimento Cliente</td>
                                {relatorio.meses.map((mes) => renderCell(mes.ressarcimentoCliente, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.ressarcimentoCliente, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Pagamentos de Empréstimos</td>
                                {relatorio.meses.map((mes) => renderCell(mes.pagamentosEmprestimos, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.pagamentosEmprestimos, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Pagamentos de Financiamentos</td>
                                {relatorio.meses.map((mes) => renderCell(mes.pagamentosFinanciamentos, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.pagamentosFinanciamentos, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Retirada Nordeste Serviço</td>
                                {relatorio.meses.map((mes) => renderCell(mes.retiradaNordesteServico, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.retiradaNordesteServico, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Retirada Rental Car</td>
                                {relatorio.meses.map((mes) => renderCell(mes.retiradaRentalCar, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.retiradaRentalCar, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Retiradas Sócios - N. Serviços</td>
                                {relatorio.meses.map((mes) => renderCell(mes.retiradasSociosNServicos, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.retiradasSociosNServicos, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Retiradas Sócios</td>
                                {relatorio.meses.map((mes) => renderCell(mes.retiradasSocios, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.retiradasSocios, 0), true)}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Fluxo de Caixa Operacional - Simplificado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Fluxo de Caixa Operacional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Item</th>
                      {relatorio.meses.map((mes) => (
                        <th key={mes.mesAno} className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase min-w-[130px]">
                          {mes.mesAno}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase bg-blue-50 min-w-[130px]">
                        TOTAL
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="bg-blue-50/50 font-semibold">
                      <td className="px-4 py-3 font-semibold text-blue-900">
                        <div className="flex items-center gap-2">
                          ENTRADAS
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => toggleDetalhes('entradas')}
                          >
                            {detalhesExpandidos.entradas ? (
                              <>
                                <ChevronUp className="h-3 w-3 mr-1" />
                                Ocultar
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Detalhes
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                      {relatorio.meses.map((mes) => renderCell(mes.totalEntradas))}
                      {renderCell(relatorio.totais.totalEntradas)}
                    </tr>
                    <tr className="bg-red-50/50 font-semibold">
                      <td className="px-4 py-3 font-semibold text-red-900">
                        <div className="flex items-center gap-2">
                          SAÍDAS
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => toggleDetalhes('saidas')}
                          >
                            {detalhesExpandidos.saidas ? (
                              <>
                                <ChevronUp className="h-3 w-3 mr-1" />
                                Ocultar
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Detalhes
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                      {relatorio.meses.map((mes) => renderCell(mes.totalSaidas, true))}
                      {renderCell(relatorio.totais.totalSaidas, true)}
                    </tr>
                    <tr className="bg-green-50 font-bold border-t-2 border-green-300">
                      <td className="px-4 py-3 font-bold text-green-900">Caixa Líquido Operacional</td>
                      {relatorio.meses.map((mes) => renderCellResultado(mes.caixaLiquidoOperacional))}
                      {renderCellResultado(relatorio.totais.caixaLiquidoOperacional)}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Detalhes Entradas */}
              <AnimatePresence>
                {detalhesExpandidos.entradas && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 overflow-hidden"
                  >
                    <Card className="bg-blue-50/30 border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-sm">Detalhes - Entradas Operacionais</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead className="bg-blue-100/50">
                              <tr>
                                <th className="px-3 py-2 text-left font-semibold">Tipo de Recebimento</th>
                                {relatorio.meses.map((mes) => (
                                  <th key={mes.mesAno} className="px-3 py-2 text-right font-semibold min-w-[100px]">
                                    {mes.mesAno}
                                  </th>
                                ))}
                                <th className="px-3 py-2 text-right font-semibold bg-blue-200 min-w-[100px]">TOTAL</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-200/50">
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Recebimento via Boleto</td>
                                {relatorio.meses.map((mes) => renderCell(mes.recebimentoBoleto))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.recebimentoBoleto, 0))}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Recebimento via Transferência</td>
                                {relatorio.meses.map((mes) => renderCell(mes.recebimentoTransferencia))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.recebimentoTransferencia, 0))}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Recebimento via PIX</td>
                                {relatorio.meses.map((mes) => renderCell(mes.recebimentoPix))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.recebimentoPix, 0))}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Outros Recebimentos</td>
                                {relatorio.meses.map((mes) => renderCell(mes.outrosRecebimentos))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.outrosRecebimentos, 0))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Detalhes Saídas */}
              <AnimatePresence>
                {detalhesExpandidos.saidas && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 overflow-hidden"
                  >
                    <Card className="bg-red-50/30 border-red-200">
                      <CardHeader>
                        <CardTitle className="text-sm">Detalhes - Saídas Operacionais</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead className="bg-red-100/50">
                              <tr>
                                <th className="px-3 py-2 text-left font-semibold">Tipo de Pagamento</th>
                                {relatorio.meses.map((mes) => (
                                  <th key={mes.mesAno} className="px-3 py-2 text-right font-semibold min-w-[100px]">
                                    {mes.mesAno}
                                  </th>
                                ))}
                                <th className="px-3 py-2 text-right font-semibold bg-red-200 min-w-[100px]">TOTAL</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-red-200/50">
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Fornecedores</td>
                                {relatorio.meses.map((mes) => renderCell(mes.pagamentosFornecedores, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.pagamentosFornecedores, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Despesas Variáveis</td>
                                {relatorio.meses.map((mes) => renderCell(mes.pagamentosDespesasVariaveis, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.pagamentosDespesasVariaveis, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Impostos</td>
                                {relatorio.meses.map((mes) => renderCell(mes.pagamentosImpostos, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.pagamentosImpostos, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Despesas Administrativas</td>
                                {relatorio.meses.map((mes) => renderCell(mes.pagamentosDespesasAdministrativas, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.pagamentosDespesasAdministrativas, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Despesas com Pessoal</td>
                                {relatorio.meses.map((mes) => renderCell(mes.pagamentosDespesasPessoal, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.pagamentosDespesasPessoal, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Despesas Financeiras</td>
                                {relatorio.meses.map((mes) => renderCell(mes.pagamentosDespesasFinanceiras, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.pagamentosDespesasFinanceiras, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Serviços de Terceiros</td>
                                {relatorio.meses.map((mes) => renderCell(mes.pagamentosCustosServicosTerceiros, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.pagamentosCustosServicosTerceiros, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Manutenção</td>
                                {relatorio.meses.map((mes) => renderCell(mes.pagamentosDespesasManutencao, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.pagamentosDespesasManutencao, 0), true)}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-slate-700">Marketing</td>
                                {relatorio.meses.map((mes) => renderCell(mes.pagamentosDespesasMarketing, true))}
                                {renderCell(relatorio.meses.reduce((sum, m) => sum + m.pagamentosDespesasMarketing, 0), true)}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Saldo de Caixa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Saldo de Caixa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Período</th>
                      {relatorio.meses.map((mes) => (
                        <th key={mes.mesAno} className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase min-w-[130px]">
                          {mes.mesAno}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="px-4 py-3 font-medium text-slate-700">Saldo Inicial</td>
                      {relatorio.meses.map((mes, index) => {
                        if (index === 0) {
                          return renderCell(mes.saldoInicioPeriodo)
                        }
                        return <td key={mes.mesAno} className="px-4 py-3 text-right text-slate-400">-</td>
                      })}
                    </tr>
                    <tr className="bg-green-50/50">
                      <td className="px-4 py-3 font-bold text-green-900">Saldo Final</td>
                      {relatorio.meses.map((mes) => renderCell(mes.saldoFimPeriodo))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
