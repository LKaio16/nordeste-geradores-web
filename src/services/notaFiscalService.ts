import { NotaFiscal, NotaFiscalRequest } from '@/types'
import { api, API_ENDPOINTS } from '@/config/api'

// Função auxiliar para formatar nota fiscal da resposta
function formatNotaFiscalFromResponse(nota: any): NotaFiscal {
  return {
    id: String(nota.id),
    tipo: nota.tipo,
    fornecedor: nota.fornecedor,
    cnpjEmpresa: nota.cnpjEmpresa,
    dataEmissao: nota.dataEmissao ? (typeof nota.dataEmissao === 'string' ? nota.dataEmissao : nota.dataEmissao.split('T')[0]) : '',
    numeroNota: nota.numeroNota,
    valorTotal: typeof nota.valorTotal === 'number' ? nota.valorTotal : parseFloat(nota.valorTotal) || 0,
    formaPagamento: nota.formaPagamento,
    itens: (nota.itens || []).map((item: any) => ({
      id: String(item.id),
      notaFiscalId: String(item.notaFiscalId || nota.id),
      produtoId: item.produtoId ? String(item.produtoId) : undefined,
      descricao: item.descricao,
      quantidade: item.quantidade || 0,
      valorUnitario: typeof item.valorUnitario === 'number' ? item.valorUnitario : parseFloat(item.valorUnitario) || 0,
      desconto: item.desconto ? (typeof item.desconto === 'number' ? item.desconto : parseFloat(item.desconto)) : 0,
      valorTotal: typeof item.valorTotal === 'number' ? item.valorTotal : parseFloat(item.valorTotal) || 0,
      produto: item.produto,
    })),
    createdAt: nota.createdAt ? (typeof nota.createdAt === 'string' ? nota.createdAt : nota.createdAt) : new Date().toISOString(),
    updatedAt: nota.updatedAt ? (typeof nota.updatedAt === 'string' ? nota.updatedAt : nota.updatedAt) : new Date().toISOString(),
  }
}

class NotaFiscalService {
  async listar(): Promise<NotaFiscal[]> {
    try {
      const response = await api.get<any[]>(API_ENDPOINTS.notasFiscais.list)
      return response.data.map(formatNotaFiscalFromResponse)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao listar notas fiscais')
    }
  }

  async buscarPorId(id: string): Promise<NotaFiscal> {
    try {
      const response = await api.get<any>(API_ENDPOINTS.notasFiscais.get(id))
      return formatNotaFiscalFromResponse(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar nota fiscal')
    }
  }

  async criar(data: NotaFiscalRequest): Promise<NotaFiscal> {
    try {
      const response = await api.post<any>(API_ENDPOINTS.notasFiscais.create, data)
      return formatNotaFiscalFromResponse(response.data)
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erro ao criar nota fiscal'
      throw new Error(message)
    }
  }

  async atualizar(id: string, data: NotaFiscalRequest): Promise<NotaFiscal> {
    try {
      const response = await api.put<any>(API_ENDPOINTS.notasFiscais.update(id), data)
      return formatNotaFiscalFromResponse(response.data)
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erro ao atualizar nota fiscal'
      throw new Error(message)
    }
  }

  async deletar(id: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.notasFiscais.delete(id))
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao deletar nota fiscal')
    }
  }
}

export const notaFiscalService = new NotaFiscalService()

