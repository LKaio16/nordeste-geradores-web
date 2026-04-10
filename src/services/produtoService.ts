import { Produto, ProdutoRequest, PageResponse } from '@/types'
import { api, API_ENDPOINTS } from '@/config/api'

function formatProdutoFromResponse(raw: any): Produto {
  let preco = raw.precoUnitario
  if (typeof preco === 'string') {
    preco = parseFloat(preco)
  } else if (preco && typeof preco === 'object' && 'doubleValue' in preco) {
    preco = (preco as { doubleValue: () => number }).doubleValue()
  }
  return {
    id: String(raw.id),
    descricao: raw.descricao,
    unidade: raw.unidade,
    precoUnitario: typeof preco === 'number' && !Number.isNaN(preco) ? preco : 0,
    categoria: raw.categoria,
    createdAt: raw.createdAt
      ? typeof raw.createdAt === 'string'
        ? raw.createdAt
        : String(raw.createdAt)
      : new Date().toISOString(),
    updatedAt: raw.updatedAt
      ? typeof raw.updatedAt === 'string'
        ? raw.updatedAt
        : String(raw.updatedAt)
      : new Date().toISOString(),
  }
}

class ProdutoService {
  /** Lista completa (nota fiscal, movimentação de estoque, etc.). */
  async listarTodos(): Promise<Produto[]> {
    const response = await api.get<any[]>(API_ENDPOINTS.produtos.all)
    return response.data.map(formatProdutoFromResponse)
  }

  /** Lista paginada com busca e filtro de categoria no servidor. */
  async listarPagina(params?: {
    page?: number
    size?: number
    q?: string
    categoria?: string
  }): Promise<PageResponse<Produto>> {
    const response = await api.get<PageResponse<any>>(API_ENDPOINTS.produtos.list, {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        q: params?.q?.trim() || undefined,
        categoria: params?.categoria || undefined,
      },
    })
    return {
      ...response.data,
      content: response.data.content.map(formatProdutoFromResponse),
    }
  }

  async buscarPorId(id: string): Promise<Produto> {
    const response = await api.get<any>(API_ENDPOINTS.produtos.get(id))
    return formatProdutoFromResponse(response.data)
  }

  async criar(data: ProdutoRequest): Promise<Produto> {
    const response = await api.post<any>(API_ENDPOINTS.produtos.create, data)
    return formatProdutoFromResponse(response.data)
  }

  async atualizar(id: string, data: ProdutoRequest): Promise<Produto> {
    const response = await api.put<any>(API_ENDPOINTS.produtos.update(id), data)
    return formatProdutoFromResponse(response.data)
  }

  async deletar(id: string): Promise<void> {
    await api.delete(API_ENDPOINTS.produtos.delete(id))
  }

  async listarCategorias(): Promise<string[]> {
    const response = await api.get<string[]>(API_ENDPOINTS.produtos.categorias)
    return response.data
  }
}

export const produtoService = new ProdutoService()
