import { Fornecedor, FornecedorRequest } from '@/types'
import { api, API_ENDPOINTS } from '@/config/api'

// Função auxiliar para formatar fornecedor da resposta
function formatFornecedorFromResponse(fornecedor: any): Fornecedor {
  return {
    id: String(fornecedor.id),
    nome: fornecedor.nome,
    cnpj: fornecedor.cnpj,
    email: fornecedor.email,
    telefone: fornecedor.telefone || '',
    endereco: fornecedor.endereco || '',
    cidade: fornecedor.cidade || '',
    estado: fornecedor.estado || '',
    status: fornecedor.status,
    observacoes: fornecedor.observacoes || undefined,
    createdAt: fornecedor.createdAt ? (typeof fornecedor.createdAt === 'string' ? fornecedor.createdAt : fornecedor.createdAt) : new Date().toISOString(),
    updatedAt: fornecedor.updatedAt ? (typeof fornecedor.updatedAt === 'string' ? fornecedor.updatedAt : fornecedor.updatedAt) : new Date().toISOString(),
  }
}

class FornecedorService {
  async listar(): Promise<Fornecedor[]> {
    try {
      const response = await api.get<any[]>(API_ENDPOINTS.fornecedores.list)
      return response.data.map(formatFornecedorFromResponse)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao listar fornecedores')
    }
  }

  async buscarPorId(id: string): Promise<Fornecedor> {
    try {
      const response = await api.get<any>(API_ENDPOINTS.fornecedores.get(id))
      return formatFornecedorFromResponse(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar fornecedor')
    }
  }

  async criar(data: FornecedorRequest): Promise<Fornecedor> {
    try {
      const response = await api.post<any>(API_ENDPOINTS.fornecedores.create, data)
      return formatFornecedorFromResponse(response.data)
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erro ao criar fornecedor'
      throw new Error(message)
    }
  }

  async atualizar(id: string, data: FornecedorRequest): Promise<Fornecedor> {
    try {
      const response = await api.put<any>(API_ENDPOINTS.fornecedores.update(id), data)
      return formatFornecedorFromResponse(response.data)
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erro ao atualizar fornecedor'
      throw new Error(message)
    }
  }

  async deletar(id: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.fornecedores.delete(id))
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao deletar fornecedor')
    }
  }
}

export const fornecedorService = new FornecedorService()

