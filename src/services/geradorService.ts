import { Gerador, GeradorRequest } from '@/types'
import { api, API_ENDPOINTS } from '@/config/api'

function formatGeradorFromResponse(gerador: any): Gerador {
  return {
    id: String(gerador.id),
    modelo: gerador.modelo || '',
    marca: gerador.marca || '',
    potencia: gerador.potencia ? String(gerador.potencia) : '0',
    numeroSerie: gerador.numeroSerie || '',
    anoFabricacao: gerador.anoFabricacao || 0,
    horimetro: gerador.horimetro || 0,
    status: gerador.status,
    observacoes: gerador.observacoes || undefined,
    createdAt: gerador.createdAt ? (typeof gerador.createdAt === 'string' ? gerador.createdAt : gerador.createdAt.toString()) : new Date().toISOString(),
    updatedAt: gerador.updatedAt ? (typeof gerador.updatedAt === 'string' ? gerador.updatedAt : gerador.updatedAt.toString()) : new Date().toISOString(),
  }
}

class GeradorService {
  async listar(): Promise<Gerador[]> {
    try {
      const response = await api.get<any[]>(API_ENDPOINTS.geradores.list)
      return response.data.map(formatGeradorFromResponse)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao listar geradores')
    }
  }

  async buscarPorId(id: string): Promise<Gerador> {
    try {
      const response = await api.get<any>(API_ENDPOINTS.geradores.get(id))
      return formatGeradorFromResponse(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar gerador')
    }
  }

  async criar(data: GeradorRequest): Promise<Gerador> {
    try {
      const response = await api.post<any>(API_ENDPOINTS.geradores.create, data)
      return formatGeradorFromResponse(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao criar gerador')
    }
  }

  async atualizar(id: string, data: GeradorRequest): Promise<Gerador> {
    try {
      const response = await api.put<any>(API_ENDPOINTS.geradores.update(id), data)
      return formatGeradorFromResponse(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar gerador')
    }
  }

  async deletar(id: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.geradores.delete(id))
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao deletar gerador')
    }
  }

  async buscarDisponiveis(): Promise<Gerador[]> {
    try {
      const response = await api.get<any[]>(API_ENDPOINTS.geradores.disponiveis)
      return response.data.map(formatGeradorFromResponse)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar geradores disponíveis')
    }
  }
}

export const geradorService = new GeradorService()

