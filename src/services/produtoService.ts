import { Produto, ProdutoRequest } from '@/types'
import { api } from '@/config/api'

class ProdutoService {
  async listar(): Promise<Produto[]> {
    const response = await api.get<Produto[]>('/api/produtos')
    return response.data
  }

  async buscarPorId(id: string): Promise<Produto> {
    const response = await api.get<Produto>(`/api/produtos/${id}`)
    return response.data
  }

  async criar(data: ProdutoRequest): Promise<Produto> {
    const response = await api.post<Produto>('/api/produtos', data)
    return response.data
  }

  async atualizar(id: string, data: ProdutoRequest): Promise<Produto> {
    const response = await api.put<Produto>(`/api/produtos/${id}`, data)
    return response.data
  }

  async deletar(id: string): Promise<void> {
    await api.delete(`/api/produtos/${id}`)
  }

  async listarCategorias(): Promise<string[]> {
    const response = await api.get<string[]>('/api/produtos/categorias')
    return response.data
  }
}

export const produtoService = new ProdutoService()

