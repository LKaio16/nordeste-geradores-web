import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { NivelAcesso } from '@/types'

interface RoleProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: NivelAcesso[]
}

export function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  if (!user || !allowedRoles.includes(user.nivelAcesso)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

