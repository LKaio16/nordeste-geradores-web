import { Locacao, LocacaoRequest, PageResponse, StatusLocacao, TipoLocacao } from '@/types'
import { api, API_ENDPOINTS } from '@/config/api'

function formatLocacaoFromResponse(locacao: any): Locacao {
  return {
    id: String(locacao.id),
    numero: locacao.numero || '',
    tipo: locacao.tipo,
    clienteId: locacao.cliente?.id || locacao.clienteId || '',
    geradorId: locacao.gerador?.id || locacao.geradorId || '',
    dataInicio: locacao.dataInicio ? (typeof locacao.dataInicio === 'string' ? locacao.dataInicio : locacao.dataInicio.toString()) : '',
    dataFim: locacao.dataFim ? (typeof locacao.dataFim === 'string' ? locacao.dataFim : locacao.dataFim.toString()) : undefined,
    valorMensal: locacao.valorMensal ? parseFloat(locacao.valorMensal) : undefined,
    valorDiario: locacao.valorDiario ? parseFloat(locacao.valorDiario) : undefined,
    valorTotal: locacao.valorTotal ? parseFloat(locacao.valorTotal) : undefined,
    status: locacao.status,
    observacoes: locacao.observacoes || undefined,
    cliente: locacao.cliente ? {
      id: String(locacao.cliente.id),
      nome: locacao.cliente.nome || '',
      cnpj: locacao.cliente.cnpj || '',
      email: locacao.cliente.email || '',
      telefone: locacao.cliente.telefone || '',
      endereco: locacao.cliente.endereco || '',
      cidade: locacao.cliente.cidade || '',
      estado: locacao.cliente.estado || '',
      status: locacao.cliente.status,
      createdAt: locacao.cliente.createdAt ? (typeof locacao.cliente.createdAt === 'string' ? locacao.cliente.createdAt : locacao.cliente.createdAt.toString()) : new Date().toISOString(),
      updatedAt: locacao.cliente.updatedAt ? (typeof locacao.cliente.updatedAt === 'string' ? locacao.cliente.updatedAt : locacao.cliente.updatedAt.toString()) : new Date().toISOString(),
    } : undefined,
    gerador: locacao.gerador ? {
      id: String(locacao.gerador.id),
      codigo: locacao.gerador.codigo || '',
      modelo: locacao.gerador.modelo || '',
      potencia: locacao.gerador.potencia ? String(locacao.gerador.potencia) : '0',
      numeroSerie: locacao.gerador.numeroSerie || '',
      marca: locacao.gerador.marca || '',
      anoFabricacao: locacao.gerador.anoFabricacao || 0,
      horimetro: locacao.gerador.horimetro || 0,
      status: locacao.gerador.status,
      observacoes: locacao.gerador.observacoes || undefined,
      createdAt: locacao.gerador.createdAt ? (typeof locacao.gerador.createdAt === 'string' ? locacao.gerador.createdAt : locacao.gerador.createdAt.toString()) : new Date().toISOString(),
      updatedAt: locacao.gerador.updatedAt ? (typeof locacao.gerador.updatedAt === 'string' ? locacao.gerador.updatedAt : locacao.gerador.updatedAt.toString()) : new Date().toISOString(),
    } : undefined,
    createdAt: locacao.createdAt ? (typeof locacao.createdAt === 'string' ? locacao.createdAt : locacao.createdAt.toString()) : new Date().toISOString(),
    updatedAt: locacao.updatedAt ? (typeof locacao.updatedAt === 'string' ? locacao.updatedAt : locacao.updatedAt.toString()) : new Date().toISOString(),
  }
}

class LocacaoService {
  async listar(params?: { page?: number; size?: number; q?: string; status?: StatusLocacao | ''; tipo?: TipoLocacao | '' }): Promise<PageResponse<Locacao>> {
    try {
      const response = await api.get<PageResponse<any>>(API_ENDPOINTS.locacoes.list, {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
          q: params?.q || undefined,
          status: params?.status || undefined,
          tipo: params?.tipo || undefined,
        },
      })
      return {
        ...response.data,
        content: response.data.content.map(formatLocacaoFromResponse),
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao listar locações')
    }
  }

  async buscarPorId(id: string): Promise<Locacao> {
    try {
      const response = await api.get<any>(API_ENDPOINTS.locacoes.get(id))
      return formatLocacaoFromResponse(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar locação')
    }
  }

  async criar(data: LocacaoRequest): Promise<Locacao> {
    try {
      const response = await api.post<any>(API_ENDPOINTS.locacoes.create, data)
      return formatLocacaoFromResponse(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao criar locação')
    }
  }

  async atualizar(id: string, data: LocacaoRequest): Promise<Locacao> {
    try {
      const response = await api.put<any>(API_ENDPOINTS.locacoes.update(id), data)
      return formatLocacaoFromResponse(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar locação')
    }
  }

  async finalizar(id: string): Promise<Locacao> {
    try {
      const response = await api.put<any>(`${API_ENDPOINTS.locacoes.get(id)}/finalizar`, {})
      return formatLocacaoFromResponse(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao finalizar locação')
    }
  }

  async deletar(id: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.locacoes.delete(id))
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao deletar locação')
    }
  }

  async gerarPdfRelatorio(id: string): Promise<Blob> {
    try {
      const response = await api.get(API_ENDPOINTS.locacoes.pdf(id), {
        responseType: 'blob',
        timeout: 120000,
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao gerar PDF da locação')
    }
  }
}

export const locacaoService = new LocacaoService()





