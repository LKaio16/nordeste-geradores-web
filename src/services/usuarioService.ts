import { Usuario, UsuarioRequest, NivelAcesso, StatusUsuario, PageResponse } from '@/types'
import { api, API_ENDPOINTS } from '@/config/api'

// Função auxiliar para formatar usuário da resposta
function formatUsuarioFromResponse(usuario: any): Usuario {
  return {
    id: String(usuario.id),
    nome: usuario.nome,
    email: usuario.email,
    telefone: usuario.telefone || '',
    cargo: usuario.cargo || '',
    nivelAcesso: usuario.nivelAcesso,
    status: usuario.status,
    dataAdmissao: usuario.dataAdmissao ? (typeof usuario.dataAdmissao === 'string' ? usuario.dataAdmissao : usuario.dataAdmissao.split('T')[0]) : '',
    ultimoAcesso: usuario.ultimoAcesso ? (typeof usuario.ultimoAcesso === 'string' ? usuario.ultimoAcesso : usuario.ultimoAcesso) : undefined,
    foto: usuario.foto || undefined,
    createdAt: usuario.createdAt ? (typeof usuario.createdAt === 'string' ? usuario.createdAt : usuario.createdAt) : new Date().toISOString(),
    updatedAt: usuario.updatedAt ? (typeof usuario.updatedAt === 'string' ? usuario.updatedAt : usuario.updatedAt) : new Date().toISOString(),
  }
}

class UsuarioService {
  async listarTodos(): Promise<Usuario[]> {
    try {
      const response = await api.get<any[]>(API_ENDPOINTS.usuarios.all)
      return response.data.map(formatUsuarioFromResponse)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao listar usuários')
    }
  }

  async listarPagina(params?: {
    page?: number
    size?: number
    q?: string
    status?: StatusUsuario | ''
    nivelAcesso?: NivelAcesso | ''
  }): Promise<PageResponse<Usuario>> {
    try {
      const response = await api.get<PageResponse<any>>(API_ENDPOINTS.usuarios.list, {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
          q: params?.q || undefined,
          status: params?.status || undefined,
          nivelAcesso: params?.nivelAcesso || undefined,
        },
      })
      return {
        ...response.data,
        content: response.data.content.map(formatUsuarioFromResponse),
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao listar usuários')
    }
  }

  async buscarPorId(id: string): Promise<Usuario> {
    try {
      const response = await api.get<any>(API_ENDPOINTS.usuarios.get(id))
      return formatUsuarioFromResponse(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar usuário')
    }
  }

  async criar(data: UsuarioRequest): Promise<Usuario> {
    try {
      const response = await api.post<any>(API_ENDPOINTS.usuarios.create, data)
      return formatUsuarioFromResponse(response.data)
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erro ao criar usuário'
      throw new Error(message)
    }
  }

  async atualizar(id: string, data: UsuarioRequest): Promise<Usuario> {
    try {
      const response = await api.put<any>(API_ENDPOINTS.usuarios.update(id), data)
      return formatUsuarioFromResponse(response.data)
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erro ao atualizar usuário'
      throw new Error(message)
    }
  }

  async deletar(id: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.usuarios.delete(id))
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erro ao excluir usuário'
      throw new Error(message)
    }
  }
}

export const usuarioService = new UsuarioService()






