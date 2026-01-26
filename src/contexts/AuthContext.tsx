import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Usuario, LoginRequest } from '@/types'
import { authService } from '@/services/authService'
import { setLogoutCallback } from '@/utils/auth'

interface AuthContextType {
  user: Usuario | null
  token: string | null
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasValidatedInitial, setHasValidatedInitial] = useState(false)

  useEffect(() => {
    // Não validar se já validamos uma vez (evita loops)
    if (hasValidatedInitial) {
      return
    }
    // Verificar e validar token salvo no localStorage
    const validateStoredToken = async () => {
      const savedToken = localStorage.getItem('accessToken')
      const savedUser = localStorage.getItem('user')

      // Função auxiliar para fazer logout e limpar dados
      const handleLogout = () => {
        setToken(null)
        setUser(null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }

      // Se não houver token ou usuário, limpar e continuar sem autenticação
      if (!savedToken || !savedUser) {
        // Limpar qualquer dado inválido
        handleLogout()
        setIsLoading(false)
        return
      }

      try {
        // Validar token com o backend
        const validation = await authService.validateToken(savedToken)

        if (validation.valid) {
          // Token válido
          setToken(savedToken)
          
          // Se temos dados do usuário atualizados do backend, usar
          if (validation.usuario) {
            setUser(validation.usuario)
            localStorage.setItem('user', JSON.stringify(validation.usuario))
          } else {
            // Se não temos dados atualizados, usar os salvos (mas token é válido)
            try {
              setUser(JSON.parse(savedUser))
            } catch (parseError) {
              // Se der erro ao parsear, limpar e fazer logout
              console.error('Erro ao parsear dados do usuário:', parseError)
              handleLogout()
            }
          }
        } else {
          // Token inválido ou expirado, limpar tudo
          console.warn('Token inválido ou expirado. Fazendo logout...')
          handleLogout()
        }
      } catch (error) {
        // Erro ao validar
        // Se for erro de rede (backend não disponível), limpar tudo por segurança
        // Se for erro 404 (endpoint não existe), apenas usar dados salvos
        const errorAny = error as any
        if (errorAny.code === 'ERR_NETWORK' || errorAny.message?.includes('Network Error')) {
          console.warn('Backend não disponível. Limpando dados...')
          handleLogout()
        } else if (errorAny.response?.status === 404) {
          // Endpoint não existe ainda, usar dados salvos
          console.warn('Endpoint de validação não encontrado. Usando dados salvos.')
          setToken(savedToken)
          try {
            setUser(JSON.parse(savedUser))
          } catch (parseError) {
            handleLogout()
          }
        } else {
          // Outros erros, limpar tudo por segurança
          console.error('Erro ao validar token:', error)
          handleLogout()
        }
      } finally {
        setIsLoading(false)
        setHasValidatedInitial(true)
      }
    }

    validateStoredToken()
  }, [hasValidatedInitial])

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials)
      setToken(response.accessToken)
      setUser(response.usuario)

      // Salvar no localStorage
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      localStorage.setItem('user', JSON.stringify(response.usuario))
      
      // Marcar como já validado para evitar revalidação imediata
      setHasValidatedInitial(true)
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      throw error
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  // Registrar callback de logout para ser usado quando token expirar
  useEffect(() => {
    setLogoutCallback(() => {
      setToken(null)
      setUser(null)
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}



