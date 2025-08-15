import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth();

  console.log('🛡️ ProtectedRoute - Estado:', { 
    user: user?.email, 
    userProfile: userProfile?.nome, 
    loading 
  });

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

  return <>{children}</>;
}
