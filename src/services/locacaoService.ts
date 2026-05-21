import { Gerador, Locacao, LocacaoRequest, PageResponse, StatusLocacao, TipoLocacao } from '@/types'
import { api, API_ENDPOINTS } from '@/config/api'

function mapGeradorFromApi(g: any): Gerador {
  return {
    id: String(g.id),
    codigo: g.codigo || '',
    modelo: g.modelo || '',
    potencia: g.potencia ? String(g.potencia) : '0',
    numeroSerie: g.numeroSerie || '',
    marca: g.marca || '',
    anoFabricacao: g.anoFabricacao || 0,
    horimetro: g.horimetro || 0,
    status: g.status,
    observacoes: g.observacoes || undefined,
    createdAt: g.createdAt
      ? typeof g.createdAt === 'string'
        ? g.createdAt
        : g.createdAt.toString()
      : new Date().toISOString(),
    updatedAt: g.updatedAt
      ? typeof g.updatedAt === 'string'
        ? g.updatedAt
        : g.updatedAt.toString()
      : new Date().toISOString(),
  }
}

function formatLocacaoFromResponse(locacao: any): Locacao {
  const geradoresList: Gerador[] = (locacao.geradores || []).map(mapGeradorFromApi)
  const geradorUnico = locacao.gerador ? mapGeradorFromApi(locacao.gerador) : geradoresList[0]
  const geradorIds =
    geradoresList.length > 0
      ? geradoresList.map((g) => g.id)
      : geradorUnico
        ? [geradorUnico.id]
        : []

  return {
    id: String(locacao.id),
    numero: locacao.numero || '',
    tipo: locacao.tipo,
    clienteId: locacao.cliente?.id || locacao.clienteId || undefined,
    clienteAvulsoNome: locacao.clienteAvulsoNome || undefined,
    geradorId: geradorUnico?.id || geradorIds[0] || '',
    geradorIds,
    dataInicio: locacao.dataInicio
      ? typeof locacao.dataInicio === 'string'
        ? locacao.dataInicio
        : locacao.dataInicio.toString()
      : '',
    dataFim: locacao.dataFim
      ? typeof locacao.dataFim === 'string'
        ? locacao.dataFim
        : locacao.dataFim.toString()
      : undefined,
    valorMensal: locacao.valorMensal ? parseFloat(locacao.valorMensal) : undefined,
    valorDiario: locacao.valorDiario ? parseFloat(locacao.valorDiario) : undefined,
    valorTotal: locacao.valorTotal ? parseFloat(locacao.valorTotal) : undefined,
    status: locacao.status,
    observacoes: locacao.observacoes || undefined,
    cliente: locacao.cliente
      ? {
          id: String(locacao.cliente.id),
          nome: locacao.cliente.nome || '',
          cnpj: locacao.cliente.cnpj || '',
          email: locacao.cliente.email || '',
          telefone: locacao.cliente.telefone || '',
          endereco: locacao.cliente.endereco || '',
          cidade: locacao.cliente.cidade || '',
          estado: locacao.cliente.estado || '',
          status: locacao.cliente.status,
          createdAt: locacao.cliente.createdAt
            ? typeof locacao.cliente.createdAt === 'string'
              ? locacao.cliente.createdAt
              : locacao.cliente.createdAt.toString()
            : new Date().toISOString(),
          updatedAt: locacao.cliente.updatedAt
            ? typeof locacao.cliente.updatedAt === 'string'
              ? locacao.cliente.updatedAt
              : locacao.cliente.updatedAt.toString()
            : new Date().toISOString(),
        }
      : undefined,
    gerador: geradorUnico,
    geradores: geradoresList.length > 0 ? geradoresList : geradorUnico ? [geradorUnico] : [],
    createdAt: locacao.createdAt
      ? typeof locacao.createdAt === 'string'
        ? locacao.createdAt
        : locacao.createdAt.toString()
      : new Date().toISOString(),
    updatedAt: locacao.updatedAt
      ? typeof locacao.updatedAt === 'string'
        ? locacao.updatedAt
        : locacao.updatedAt.toString()
      : new Date().toISOString(),
  }
}

class LocacaoService {
  async listar(params?: {
    page?: number
    size?: number
    q?: string
    status?: StatusLocacao | ''
    tipo?: TipoLocacao | ''
  }): Promise<PageResponse<Locacao>> {
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

export function nomeClienteLocacao(loc: Locacao): string {
  return loc.cliente?.nome?.trim() || loc.clienteAvulsoNome?.trim() || '—'
}
