import { LoginRequest, AuthResponse, Usuario } from '@/types'
import { api, API_ENDPOINTS } from '@/config/api'

// Função auxiliar para converter datas do formato ISO para string simples
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
    foto: usuario.foto || undefined, // URL da foto se existir
    createdAt: usuario.createdAt ? (typeof usuario.createdAt === 'string' ? usuario.createdAt : usuario.createdAt) : new Date().toISOString(),
    updatedAt: usuario.updatedAt ? (typeof usuario.updatedAt === 'string' ? usuario.updatedAt : usuario.updatedAt) : new Date().toISOString(),
  }
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<{
        accessToken: string
        refreshToken: string
        tokenType: string
        expiresIn: number
        usuario: any
      }>(API_ENDPOINTS.auth.login, {
        email: credentials.email,
        senha: credentials.senha,
      })

      const data = response.data

      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tokenType: data.tokenType || 'Bearer',
        usuario: formatUsuarioFromResponse(data.usuario),
      }
    } catch (error: any) {
      // Log de debug
      console.error('❌ Erro no login:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      })

      // Tratar erros específicos da API
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Credenciais inválidas'
        throw new Error(message)
      }
      if (error.response?.status === 401) {
        throw new Error('Email ou senha incorretos')
      }
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        throw new Error(`Não foi possível conectar ao servidor. Verifique se a URL da API está correta: ${error.config?.baseURL || 'não configurada'}`)
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      if (error.message) {
        throw new Error(error.message)
      }
      throw new Error('Erro ao fazer login. Tente novamente.')
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        await api.post(API_ENDPOINTS.auth.logout, {
          refreshToken,
        })
      }
    } catch (error) {
      // Mesmo se der erro, continuar com o logout local
      console.error('Erro ao fazer logout no servidor:', error)
    } finally {
      // Sempre limpar dados locais
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await api.post<{
        accessToken: string
        refreshToken: string
        tokenType: string
        expiresIn: number
        usuario: any
      }>(API_ENDPOINTS.auth.refresh, {
        refreshToken,
      })

      const data = response.data

      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tokenType: data.tokenType || 'Bearer',
        usuario: formatUsuarioFromResponse(data.usuario),
      }
    } catch (error: any) {
      throw new Error('Erro ao renovar token')
    }
  }

  /**
   * Verifica se o token atual é válido
   * Tenta usar o endpoint /api/auth/me se disponível, caso contrário usa qualquer endpoint autenticado
   */
  async validateToken(token: string): Promise<{ valid: boolean; usuario?: Usuario }> {
    try {
      // Primeiro tenta usar o endpoint /api/auth/me (padrão)
      const response = await api.get<any>(API_ENDPOINTS.auth.me, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data) {
        return {
          valid: true,
          usuario: formatUsuarioFromResponse(response.data),
        }
      }

      return { valid: false }
    } catch (error: any) {
      // Erro de rede significa que o backend não está disponível
      // Nesse caso, NÃO consideramos o token válido por segurança
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        console.warn('Backend não disponível. Não é possível validar o token.')
        // Propagar o erro para que o AuthContext possa tratá-lo
        throw error
      }
      
      // 401/403 significa token inválido/expirado
      if (error.response?.status === 401 || error.response?.status === 403) {
        return { valid: false }
      }
      
      // 404 significa que o endpoint não existe ainda (não implementado)
      // Nesse caso, não podemos validar, mas não significa que o token é inválido
      if (error.response?.status === 404) {
        // Propagar o erro 404 para que o AuthContext use dados salvos
        throw error
      }
      
      // Para outros erros, considerar inválido por segurança
      return { valid: false }
    }
  }

  async changePassword(senhaAtual: string, novaSenha: string): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.auth.changePassword, {
        senhaAtual,
        novaSenha,
      })
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erro ao alterar senha'
      throw new Error(message)
    }
  }
}

export const authService = new AuthService()



