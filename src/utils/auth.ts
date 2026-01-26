/**
 * Utilitário para gerenciar logout global quando token expira
 */

let logoutCallback: (() => void) | null = null

/**
 * Registra uma função de callback para ser executada quando necessário fazer logout
 */
export function setLogoutCallback(callback: () => void) {
  logoutCallback = callback
}

/**
 * Executa o logout e redireciona para login
 * Esta função é chamada automaticamente quando o token expira ou é inválido
 */
export function handleTokenExpiration() {
  console.log('Token expirado ou inválido. Fazendo logout...')

  // Limpar localStorage primeiro
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')

  // Chamar callback do AuthContext se estiver registrado (atualiza estado do React)
  if (logoutCallback) {
    try {
      logoutCallback()
    } catch (error) {
      console.error('Erro ao executar callback de logout:', error)
    }
  }

  // Redirecionar para login se não estiver lá
  // Usar window.location.href para garantir navegação mesmo se React Router não responder
  if (window.location.pathname !== '/login') {
    // Pequeno delay para garantir que o localStorage foi limpo
    setTimeout(() => {
      window.location.href = '/login'
    }, 100)
  }
}

