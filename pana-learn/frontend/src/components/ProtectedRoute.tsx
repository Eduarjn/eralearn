import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';
import { Loader2 } from 'lucide-react';
import { useLocation, Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute - Estado:', { 
    user: user?.email, 
    userProfile: userProfile?.nome, 
    loading,
    pathname: location.pathname
  });

  console.log('userProfile completo:', userProfile);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-era-lime" />
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  // Permitir acesso se houver usuário autenticado
  if (!user && !userProfile) {
    return (
      <div className="hero-background min-h-screen relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <AuthForm />
      </div>
    );
  }

  // Verificar permissões para páginas restritas a administradores
  const adminOnlyPaths = ['/relatorios', '/usuarios'];
  const isAdminOnlyPath = adminOnlyPaths.includes(location.pathname);
  const isAdmin = userProfile?.tipo_usuario === 'admin' || userProfile?.tipo_usuario === 'admin_master';

  if (isAdminOnlyPath && !isAdmin) {
    console.log('🚫 Acesso negado - Usuário não é admin para', location.pathname);
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
