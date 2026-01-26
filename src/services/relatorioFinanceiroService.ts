import { api } from '@/config/api'
import { API_ENDPOINTS } from '@/config/api'
import { RelatorioFinanceiro } from '@/types'

class RelatorioFinanceiroService {
  async gerarRelatorio(dataInicio?: string, dataFim?: string): Promise<RelatorioFinanceiro> {
    try {
      const url = API_ENDPOINTS.relatorios.financeiro(dataInicio, dataFim)
      const response = await api.get<RelatorioFinanceiro>(url)
      return formatRelatorioFromResponse(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao gerar relatório financeiro')
    }
  }
}

// Função auxiliar para formatar relatório da resposta
function formatRelatorioFromResponse(relatorio: any): RelatorioFinanceiro {
  return {
    periodoInicio: relatorio.periodoInicio,
    periodoFim: relatorio.periodoFim,
    meses: relatorio.meses.map((mes: any) => ({
      mes: mes.mes,
      mesAno: mes.mesAno,
      totalEntradas: parseFloat(mes.totalEntradas) || 0,
      recebimentoVendas: parseFloat(mes.recebimentoVendas) || 0,
      recebimentoBoleto: parseFloat(mes.recebimentoBoleto) || 0,
      recebimentoTransferencia: parseFloat(mes.recebimentoTransferencia) || 0,
      recebimentoPix: parseFloat(mes.recebimentoPix) || 0,
      outrosRecebimentos: parseFloat(mes.outrosRecebimentos) || 0,
      totalSaidas: parseFloat(mes.totalSaidas) || 0,
      pagamentosFornecedores: parseFloat(mes.pagamentosFornecedores) || 0,
      pagamentosDespesasVariaveis: parseFloat(mes.pagamentosDespesasVariaveis) || 0,
      pagamentosImpostos: parseFloat(mes.pagamentosImpostos) || 0,
      pagamentosDespesasAdministrativas: parseFloat(mes.pagamentosDespesasAdministrativas) || 0,
      pagamentosDespesasPessoal: parseFloat(mes.pagamentosDespesasPessoal) || 0,
      pagamentosDespesasFinanceiras: parseFloat(mes.pagamentosDespesasFinanceiras) || 0,
      pagamentosCustosServicosTerceiros: parseFloat(mes.pagamentosCustosServicosTerceiros) || 0,
      pagamentosDespesasManutencao: parseFloat(mes.pagamentosDespesasManutencao) || 0,
      pagamentosDespesasMarketing: parseFloat(mes.pagamentosDespesasMarketing) || 0,
      pagamentosItensNaoIdentificados: parseFloat(mes.pagamentosItensNaoIdentificados) || 0,
      caixaLiquidoOperacional: parseFloat(mes.caixaLiquidoOperacional) || 0,
      percentualOperacional: parseFloat(mes.percentualOperacional) || 0,
      bonusRendimentos: parseFloat(mes.bonusRendimentos) || 0,
      resgateAutomatico: parseFloat(mes.resgateAutomatico) || 0,
      aplicacaoAutomatica: parseFloat(mes.aplicacaoAutomatica) || 0,
      aquisicoesAtivoImobilizado: parseFloat(mes.aquisicoesAtivoImobilizado) || 0,
      obrasReformas: parseFloat(mes.obrasReformas) || 0,
      investimentos: parseFloat(mes.investimentos) || 0,
      caixaLiquidoInvestimento: parseFloat(mes.caixaLiquidoInvestimento) || 0,
      percentualInvestimento: parseFloat(mes.percentualInvestimento) || 0,
      recebimentoEmprestimo: parseFloat(mes.recebimentoEmprestimo) || 0,
      recebimentoSeguro: parseFloat(mes.recebimentoSeguro) || 0,
      recebimentoOutrasEmpresas: parseFloat(mes.recebimentoOutrasEmpresas) || 0,
      ressarcimentoCliente: parseFloat(mes.ressarcimentoCliente) || 0,
      pagamentosEmprestimos: parseFloat(mes.pagamentosEmprestimos) || 0,
      pagamentosFinanciamentos: parseFloat(mes.pagamentosFinanciamentos) || 0,
      retiradaNordesteServico: parseFloat(mes.retiradaNordesteServico) || 0,
      retiradaRentalCar: parseFloat(mes.retiradaRentalCar) || 0,
      retiradasSociosNServicos: parseFloat(mes.retiradasSociosNServicos) || 0,
      retiradasSocios: parseFloat(mes.retiradasSocios) || 0,
      caixaLiquidoFinanciamento: parseFloat(mes.caixaLiquidoFinanciamento) || 0,
      percentualFinanciamento: parseFloat(mes.percentualFinanciamento) || 0,
      resultadoCaixaPeriodo: parseFloat(mes.resultadoCaixaPeriodo) || 0,
      percentualResultado: parseFloat(mes.percentualResultado) || 0,
      transferenciaEntreContas: parseFloat(mes.transferenciaEntreContas) || 0,
      saldoInicioPeriodo: parseFloat(mes.saldoInicioPeriodo) || 0,
      saldoFimPeriodo: parseFloat(mes.saldoFimPeriodo) || 0,
    })),
    totais: {
      totalEntradas: parseFloat(relatorio.totais.totalEntradas) || 0,
      totalSaidas: parseFloat(relatorio.totais.totalSaidas) || 0,
      caixaLiquidoOperacional: parseFloat(relatorio.totais.caixaLiquidoOperacional) || 0,
      percentualOperacional: parseFloat(relatorio.totais.percentualOperacional) || 0,
      caixaLiquidoInvestimento: parseFloat(relatorio.totais.caixaLiquidoInvestimento) || 0,
      percentualInvestimento: parseFloat(relatorio.totais.percentualInvestimento) || 0,
      caixaLiquidoFinanciamento: parseFloat(relatorio.totais.caixaLiquidoFinanciamento) || 0,
      percentualFinanciamento: parseFloat(relatorio.totais.percentualFinanciamento) || 0,
      resultadoCaixaPeriodo: parseFloat(relatorio.totais.resultadoCaixaPeriodo) || 0,
      percentualResultado: parseFloat(relatorio.totais.percentualResultado) || 0,
    },
  }
}

export const relatorioFinanceiroService = new RelatorioFinanceiroService()


