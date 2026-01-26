import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { handleTokenExpiration } from '@/utils/auth'

// Configuração da API
export const API_CONFIG = {
  // Base URL do backend - pode ser configurado via variável de ambiente
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  
  // Timeout para requisições (ms)
  timeout: 10000,
  
  // Headers padrão
  headers: {
    'Content-Type': 'application/json',
  },
}

// Instância do axios configurada
export const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
})

// Interceptor para adicionar token JWT nas requisições
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar erros de autenticação e respostas do ngrok
api.interceptors.response.use(
  (response) => {
    // Verificar se a resposta é HTML (resposta padrão do ngrok)
    const contentType = response.headers['content-type'] || ''
    if (contentType.includes('text/html') && typeof response.data === 'string') {
      // Se for HTML, provavelmente é a página de verificação do ngrok
      if (response.data.includes('ngrok') || response.data.includes('<!DOCTYPE') || response.data.includes('<html')) {
        console.error('Resposta HTML recebida (página do ngrok). Verifique a URL da API:', API_CONFIG.baseURL)
        const error = new Error('Resposta HTML inesperada. O servidor retornou HTML ao invés de JSON. Verifique se a URL da API está correta e se o ngrok está configurado corretamente.')
        return Promise.reject(error)
      }
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Verificar se o erro é uma resposta HTML (ngrok)
    if (error.response?.data && typeof error.response.data === 'string') {
      if (error.response.data.includes('ngrok') || error.response.data.includes('<!DOCTYPE')) {
        console.error('Erro: Resposta HTML recebida do servidor. Verifique a URL da API:', API_CONFIG.baseURL)
        return Promise.reject(new Error('Servidor retornou HTML ao invés de JSON. Verifique a URL da API.'))
      }
    }

    // Se for erro 401 e não for a requisição de refresh token ou login
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Evitar loop infinito
      if (
        originalRequest.url?.includes('/api/auth/refresh') ||
        originalRequest.url?.includes('/api/auth/login')
      ) {
        // Se falhar no refresh ou login, fazer logout e redirecionar
        handleTokenExpiration()
        return Promise.reject(error)
      }

      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refreshToken')

      if (refreshToken) {
        try {
          // Tentar renovar o token
          const refreshResponse = await axios.post(
            `${API_CONFIG.baseURL}/api/auth/refresh`,
            { refreshToken }
          )

          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data

          // Atualizar tokens
          localStorage.setItem('accessToken', accessToken)
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken)
          }

          // Reenviar a requisição original com o novo token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        } catch (refreshError) {
          // Se o refresh falhar, fazer logout e redirecionar
          console.error('Erro ao renovar token:', refreshError)
          handleTokenExpiration()
          return Promise.reject(refreshError)
        }
      } else {
        // Sem refresh token, fazer logout e redirecionar
        handleTokenExpiration()
      }
    }

    return Promise.reject(error)
  }
)

// Endpoints da API
export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    refresh: '/api/auth/refresh',
    me: '/api/auth/me', // Endpoint para verificar token e obter dados do usuário
    logout: '/api/auth/logout',
  },
  usuarios: {
    list: '/api/usuarios',
    get: (id: string) => `/api/usuarios/${id}`,
    create: '/api/usuarios',
    update: (id: string) => `/api/usuarios/${id}`,
    delete: (id: string) => `/api/usuarios/${id}`,
  },
  clientes: {
    list: '/api/clientes',
    get: (id: string) => `/api/clientes/${id}`,
    create: '/api/clientes',
    update: (id: string) => `/api/clientes/${id}`,
    delete: (id: string) => `/api/clientes/${id}`,
  },
  fornecedores: {
    list: '/api/fornecedores',
    get: (id: string) => `/api/fornecedores/${id}`,
    create: '/api/fornecedores',
    update: (id: string) => `/api/fornecedores/${id}`,
    delete: (id: string) => `/api/fornecedores/${id}`,
  },
  geradores: {
    list: '/api/geradores',
    get: (id: string) => `/api/geradores/${id}`,
    create: '/api/geradores',
    update: (id: string) => `/api/geradores/${id}`,
    delete: (id: string) => `/api/geradores/${id}`,
    disponiveis: '/api/geradores/disponiveis',
    horimetro: (id: string) => `/api/geradores/${id}/horimetro`,
  },
  locacoes: {
    list: '/api/locacoes',
    get: (id: string) => `/api/locacoes/${id}`,
    create: '/api/locacoes',
    update: (id: string) => `/api/locacoes/${id}`,
    delete: (id: string) => `/api/locacoes/${id}`,
  },
  ordensServico: {
    list: '/api/ordens-servico',
    get: (id: string) => `/api/ordens-servico/${id}`,
    create: '/api/ordens-servico',
    update: (id: string) => `/api/ordens-servico/${id}`,
    delete: (id: string) => `/api/ordens-servico/${id}`,
  },
  contas: {
    list: '/api/contas',
    get: (id: string) => `/api/contas/${id}`,
    create: '/api/contas',
    update: (id: string) => `/api/contas/${id}`,
    delete: (id: string) => `/api/contas/${id}`,
    historico: (id: string) => `/api/contas/${id}/historico`,
  },
  relatorios: {
    financeiro: (dataInicio?: string, dataFim?: string) => {
      const params = new URLSearchParams();
      if (dataInicio) params.append('dataInicio', dataInicio);
      if (dataFim) params.append('dataFim', dataFim);
      return `/api/relatorios/financeiro?${params.toString()}`;
    },
  },
  notasFiscais: {
    list: '/api/notas-fiscais',
    get: (id: string) => `/api/notas-fiscais/${id}`,
    create: '/api/notas-fiscais',
    update: (id: string) => `/api/notas-fiscais/${id}`,
    delete: (id: string) => `/api/notas-fiscais/${id}`,
  },
  estoque: {
    list: '/api/estoque',
    get: (id: string) => `/api/estoque/${id}`,
    create: '/api/estoque',
    update: (id: string) => `/api/estoque/${id}`,
    delete: (id: string) => `/api/estoque/${id}`,
    movimentacoes: (id: string) => `/api/estoque/${id}/movimentacoes`,
    registrarMovimentacao: '/api/estoque/movimentacoes',
    produtosAbaixoMinimo: '/api/estoque/produtos/abaixo-minimo',
    produtosSemEstoque: '/api/estoque/produtos/sem-estoque',
  },
  produtos: {
    list: '/api/produtos',
    get: (id: string) => `/api/produtos/${id}`,
    create: '/api/produtos',
    update: (id: string) => `/api/produtos/${id}`,
    delete: (id: string) => `/api/produtos/${id}`,
    categorias: '/api/produtos/categorias',
  },
}
