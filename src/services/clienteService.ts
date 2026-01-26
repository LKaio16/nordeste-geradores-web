import { Cliente, ClienteRequest } from '@/types'
import { api, API_ENDPOINTS } from '@/config/api'

// Função auxiliar para formatar cliente da resposta
function formatClienteFromResponse(cliente: any): Cliente {
  return {
    id: String(cliente.id),
    nome: cliente.nome,
    cnpj: cliente.cnpj,
    email: cliente.email,
    telefone: cliente.telefone || '',
    endereco: cliente.endereco || '',
    cidade: cliente.cidade || '',
    estado: cliente.estado || '',
    status: cliente.status,
    createdAt: cliente.createdAt ? (typeof cliente.createdAt === 'string' ? cliente.createdAt : cliente.createdAt) : new Date().toISOString(),
    updatedAt: cliente.updatedAt ? (typeof cliente.updatedAt === 'string' ? cliente.updatedAt : cliente.updatedAt) : new Date().toISOString(),
  }
}

class ClienteService {
  async listar(): Promise<Cliente[]> {
    try {
      const response = await api.get<any[]>(API_ENDPOINTS.clientes.list)
      return response.data.map(formatClienteFromResponse)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao listar clientes')
    }
  }

  async buscarPorId(id: string): Promise<Cliente> {
    try {
      const response = await api.get<any>(API_ENDPOINTS.clientes.get(id))
      return formatClienteFromResponse(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar cliente')
    }
  }

  async criar(data: ClienteRequest): Promise<Cliente> {
    try {
      const response = await api.post<any>(API_ENDPOINTS.clientes.create, data)
      return formatClienteFromResponse(response.data)
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erro ao criar cliente'
      throw new Error(message)
    }
  }

  async atualizar(id: string, data: ClienteRequest): Promise<Cliente> {
    try {
      const response = await api.put<any>(API_ENDPOINTS.clientes.update(id), data)
      return formatClienteFromResponse(response.data)
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erro ao atualizar cliente'
      throw new Error(message)
    }
  }

  async deletar(id: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.clientes.delete(id))
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao deletar cliente')
    }
  }
}

export const clienteService = new ClienteService()

