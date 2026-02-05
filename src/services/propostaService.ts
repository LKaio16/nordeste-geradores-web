import { Proposta, PropostaRequest } from '@/types'
import { api, API_ENDPOINTS } from '@/config/api'

function formatPropostaFromResponse(proposta: any): Proposta {
  return {
    id: String(proposta.id),
    numero: proposta.numero || '',
    cliente: proposta.cliente ? {
      id: String(proposta.cliente.id),
      nome: proposta.cliente.nome || '',
      cnpj: proposta.cliente.cnpj || '',
      email: proposta.cliente.email || '',
      telefone: proposta.cliente.telefone || '',
      endereco: proposta.cliente.endereco || '',
      cidade: proposta.cliente.cidade || '',
      estado: proposta.cliente.estado || '',
      status: proposta.cliente.status,
      createdAt: proposta.cliente.createdAt ? (typeof proposta.cliente.createdAt === 'string' ? proposta.cliente.createdAt : proposta.cliente.createdAt.toString()) : new Date().toISOString(),
      updatedAt: proposta.cliente.updatedAt ? (typeof proposta.cliente.updatedAt === 'string' ? proposta.cliente.updatedAt : proposta.cliente.updatedAt.toString()) : new Date().toISOString(),
    } : {} as any,
    tipo: proposta.tipo,
    dataEmissao: proposta.dataEmissao ? (typeof proposta.dataEmissao === 'string' ? proposta.dataEmissao : proposta.dataEmissao.toString()) : '',
    validade: proposta.validade ? (typeof proposta.validade === 'string' ? proposta.validade : proposta.validade.toString()) : '',
    observacoes: proposta.observacoes || undefined,
    valorTotal: proposta.valorTotal ? parseFloat(proposta.valorTotal) : 0,
    status: proposta.status,
    formaPagamento: proposta.formaPagamento || undefined,
    itens: (proposta.itens || []).map((item: any) => ({
      id: String(item.id),
      categoria: item.categoria,
      descricao: item.descricao || '',
      quantidade: item.quantidade || 0,
      valorUnitario: item.valorUnitario ? parseFloat(item.valorUnitario) : 0,
      valorTotal: item.valorTotal ? parseFloat(item.valorTotal) : 0,
    })),
    createdAt: proposta.createdAt ? (typeof proposta.createdAt === 'string' ? proposta.createdAt : proposta.createdAt.toString()) : new Date().toISOString(),
    updatedAt: proposta.updatedAt ? (typeof proposta.updatedAt === 'string' ? proposta.updatedAt : proposta.updatedAt.toString()) : new Date().toISOString(),
  }
}

class PropostaService {
  async listar(): Promise<Proposta[]> {
    try {
      const response = await api.get<any[]>(API_ENDPOINTS.propostas.list)
      return response.data.map(formatPropostaFromResponse)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao listar propostas')
    }
  }

  async buscarPorId(id: string): Promise<Proposta> {
    try {
      const response = await api.get<any>(API_ENDPOINTS.propostas.get(id))
      return formatPropostaFromResponse(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar proposta')
    }
  }

  async criar(data: PropostaRequest): Promise<Proposta> {
    try {
      const response = await api.post<any>(API_ENDPOINTS.propostas.create, data)
      return formatPropostaFromResponse(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao criar proposta')
    }
  }

  async atualizar(id: string, data: PropostaRequest): Promise<Proposta> {
    try {
      const response = await api.put<any>(API_ENDPOINTS.propostas.update(id), data)
      return formatPropostaFromResponse(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar proposta')
    }
  }

  async deletar(id: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.propostas.delete(id))
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao deletar proposta')
    }
  }

  async gerarPdf(id: string): Promise<Blob> {
    try {
      const response = await api.get(API_ENDPOINTS.propostas.pdf(id), {
        responseType: 'blob',
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao gerar PDF da proposta')
    }
  }
}

export const propostaService = new PropostaService()


