import { api, API_ENDPOINTS } from '@/config/api'

export interface MesRelatorioNotaFiscal {
  mes: string
  saldoInicio: number
  totalEntradas: number
  totalSaidas: number
  saldoFimPeriodo: number
  quantidadeEntradas: number
  quantidadeSaidas: number
}

export interface TotaisRelatorioNotaFiscal {
  totalEntradas: number
  totalSaidas: number
  saldoFinal: number
  totalQuantidadeEntradas: number
  totalQuantidadeSaidas: number
}

export interface RelatorioNotaFiscal {
  dataInicio: string
  dataFim: string
  meses: MesRelatorioNotaFiscal[]
  totais: TotaisRelatorioNotaFiscal
}

function formatRelatorioFromResponse(data: any): RelatorioNotaFiscal {
  return {
    dataInicio: data.dataInicio,
    dataFim: data.dataFim,
    meses: data.meses.map((mes: any) => ({
      mes: mes.mes,
      saldoInicio: parseFloat(mes.saldoInicio) || 0,
      totalEntradas: parseFloat(mes.totalEntradas) || 0,
      totalSaidas: parseFloat(mes.totalSaidas) || 0,
      saldoFimPeriodo: parseFloat(mes.saldoFimPeriodo) || 0,
      quantidadeEntradas: mes.quantidadeEntradas || 0,
      quantidadeSaidas: mes.quantidadeSaidas || 0,
    })),
    totais: {
      totalEntradas: parseFloat(data.totais.totalEntradas) || 0,
      totalSaidas: parseFloat(data.totais.totalSaidas) || 0,
      saldoFinal: parseFloat(data.totais.saldoFinal) || 0,
      totalQuantidadeEntradas: data.totais.totalQuantidadeEntradas || 0,
      totalQuantidadeSaidas: data.totais.totalQuantidadeSaidas || 0,
    },
  }
}

class RelatorioNotaFiscalService {
  async gerarRelatorio(dataInicio: string, dataFim: string): Promise<RelatorioNotaFiscal> {
    try {
      const response = await api.get('/api/relatorios/notas-fiscais', {
        params: {
          dataInicio,
          dataFim,
        },
      })
      return formatRelatorioFromResponse(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Erro ao gerar relatório de notas fiscais')
    }
  }
}

export const relatorioNotaFiscalService = new RelatorioNotaFiscalService()

