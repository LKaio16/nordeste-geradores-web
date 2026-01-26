import { Estoque, EstoqueMovimentacao, EstoqueRequest, EstoqueMovimentacaoRequest } from '@/types'
import { api } from '@/config/api'

class EstoqueService {
  async listar(): Promise<Estoque[]> {
    const response = await api.get<Estoque[]>('/api/estoque')
    return response.data
  }

  async buscarPorId(id: string): Promise<Estoque> {
    const response = await api.get<Estoque>(`/api/estoque/${id}`)
    return response.data
  }

  async criar(data: EstoqueRequest): Promise<Estoque> {
    const response = await api.post<Estoque>('/api/estoque', data)
    return response.data
  }

  async atualizar(id: string, data: EstoqueRequest): Promise<Estoque> {
    const response = await api.put<Estoque>(`/api/estoque/${id}`, data)
    return response.data
  }

  async deletar(id: string): Promise<void> {
    await api.delete(`/api/estoque/${id}`)
  }

  async listarMovimentacoes(estoqueId: string): Promise<EstoqueMovimentacao[]> {
    const response = await api.get<EstoqueMovimentacao[]>(`/api/estoque/${estoqueId}/movimentacoes`)
    return response.data
  }

  async registrarMovimentacao(data: EstoqueMovimentacaoRequest): Promise<EstoqueMovimentacao & { estoqueId: string }> {
    const response = await api.post<EstoqueMovimentacao & { estoqueId: string }>('/api/estoque/movimentacoes', data)
    return response.data
  }

  async produtosAbaixoDoMinimo(): Promise<Estoque[]> {
    const response = await api.get<Estoque[]>('/api/estoque/produtos/abaixo-minimo')
    return response.data
  }

  async produtosSemEstoque(): Promise<Estoque[]> {
    const response = await api.get<Estoque[]>('/api/estoque/produtos/sem-estoque')
    return response.data
  }
}

export const estoqueService = new EstoqueService()

