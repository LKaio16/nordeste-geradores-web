import { Estoque, EstoqueMovimentacao, EstoqueRequest, EstoqueMovimentacaoRequest, PageResponse } from '@/types'
import { api, API_ENDPOINTS } from '@/config/api'

function formatEstoqueFromResponse(raw: any): Estoque {
  const p = raw.produto
  return {
    id: String(raw.id),
    produto: p
      ? {
          id: String(p.id),
          descricao: p.descricao,
          categoria: p.categoria,
          unidade: p.unidade,
          precoUnitario: p.precoUnitario ?? 0,
          createdAt: p.createdAt ?? '',
          updatedAt: p.updatedAt ?? '',
        }
      : raw.produto,
    quantidade: raw.quantidade,
    estoqueMinimo: raw.estoqueMinimo,
    dataUltimaEntrada: raw.dataUltimaEntrada,
    createdAt: raw.createdAt ?? '',
    updatedAt: raw.updatedAt ?? '',
  }
}

class EstoqueService {
  /** Lista completa (selects, movimentação). */
  async listarTodos(): Promise<Estoque[]> {
    const response = await api.get<any[]>(API_ENDPOINTS.estoque.all)
    return response.data.map(formatEstoqueFromResponse)
  }

  /** Lista paginada com busca e filtros no servidor. */
  async listarPagina(params?: {
    page?: number
    size?: number
    q?: string
    categoria?: string
    semEstoque?: boolean
    abaixoMinimo?: boolean
  }): Promise<PageResponse<Estoque>> {
    const response = await api.get<PageResponse<any>>(API_ENDPOINTS.estoque.list, {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        q: params?.q?.trim() || undefined,
        categoria: params?.categoria || undefined,
        semEstoque: params?.semEstoque === true ? true : undefined,
        abaixoMinimo: params?.abaixoMinimo === true ? true : undefined,
      },
    })
    return {
      ...response.data,
      content: response.data.content.map(formatEstoqueFromResponse),
    }
  }

  async listarCategorias(): Promise<string[]> {
    const response = await api.get<string[]>(API_ENDPOINTS.estoque.categorias)
    return response.data
  }

  async buscarPorId(id: string): Promise<Estoque> {
    const response = await api.get<any>(API_ENDPOINTS.estoque.get(id))
    return formatEstoqueFromResponse(response.data)
  }

  async criar(data: EstoqueRequest): Promise<Estoque> {
    const response = await api.post<any>(API_ENDPOINTS.estoque.create, data)
    return formatEstoqueFromResponse(response.data)
  }

  async atualizar(id: string, data: EstoqueRequest): Promise<Estoque> {
    const response = await api.put<any>(API_ENDPOINTS.estoque.update(id), data)
    return formatEstoqueFromResponse(response.data)
  }

  async deletar(id: string): Promise<void> {
    await api.delete(API_ENDPOINTS.estoque.delete(id))
  }

  async listarMovimentacoes(estoqueId: string): Promise<EstoqueMovimentacao[]> {
    const response = await api.get<EstoqueMovimentacao[]>(API_ENDPOINTS.estoque.movimentacoes(estoqueId))
    return response.data
  }

  async registrarMovimentacao(data: EstoqueMovimentacaoRequest): Promise<EstoqueMovimentacao & { estoqueId: string }> {
    const response = await api.post<EstoqueMovimentacao & { estoqueId: string }>(
      API_ENDPOINTS.estoque.registrarMovimentacao,
      data
    )
    return response.data
  }

  async produtosAbaixoDoMinimo(): Promise<Estoque[]> {
    const response = await api.get<any[]>(API_ENDPOINTS.estoque.produtosAbaixoMinimo)
    return response.data.map(formatEstoqueFromResponse)
  }

  async produtosSemEstoque(): Promise<Estoque[]> {
    const response = await api.get<any[]>(API_ENDPOINTS.estoque.produtosSemEstoque)
    return response.data.map(formatEstoqueFromResponse)
  }
}

export const estoqueService = new EstoqueService()
