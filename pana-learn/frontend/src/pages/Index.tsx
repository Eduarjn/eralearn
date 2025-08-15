import { useAuth } from '@/hooks/useAuth';
import { ERALayout } from '@/components/ERALayout';
import { AuthForm } from '@/components/AuthForm';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserBadges } from '@/hooks/useUserBadges';
import { useCourses } from '@/hooks/useCourses';
import { useUserProgress } from '@/hooks/useUserProgress';
import { Badge as BadgeUI } from '@/components/ui/badge';

const Index = () => {
  const { user, loading, userProfile } = useAuth();
  const navigate = useNavigate();
  const { badges, loading: loadingBadges } = useUserBadges(userProfile?.id, userProfile?.empresa_id, userProfile?.tipo_usuario);
  const { data: courses, loading: loadingCourses } = useCourses(userProfile?.empresa_id, userProfile?.tipo_usuario);
  const { data: progress, loading: loadingProgress } = useUserProgress(userProfile?.empresa_id, userProfile?.tipo_usuario);

  useEffect(() => {
    console.log('📍 Index - Estado atual:', { 
      user: user?.email, 
      loading, 
      userProfile: userProfile?.nome 
    });
    
    // Só redirecionar se tiver usuário autenticado E perfil carregado
    if (user && userProfile && !loading) {
      console.log('🔄 Redirecionando para dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, userProfile, navigate]);

  if (loading) {
    return (
      <div className="hero-background min-h-screen relative flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-era-lime mx-auto mb-4"></div>
          <p className="text-lg font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não tem usuário, mostrar formulário de login
  if (!user || !userProfile) {
    return (
      <div className="hero-background min-h-screen relative">
        <AuthForm />
      </div>
    );
  }

  // Se chegou aqui, mostrar dashboard
  return (
    <ERALayout>
      <div className="space-y-6">
        <div className="text-center">
          <div className="page-hero flex flex-col items-center justify-center gap-3 mb-4 py-8">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <img 
                src="/lovable-uploads/92441561-a944-48ee-930e-7e3b16318673.png" 
                alt="Platform Symbol" 
                className="w-8 h-8"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Bem-vindo ao ERA Learn
              </h1>
              <p className="text-contrast text-lg">
                Sua plataforma de treinamento corporativo
              </p>
            </div>
          </div>
          <p className="text-sm text-contrast mt-2">
            Olá, {userProfile.nome}! Você está logado como {userProfile.tipo_usuario}.
          </p>
          {/* Badges conquistados */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {loadingBadges ? (
              <span className="text-contrast text-sm">Carregando conquistas...</span>
            ) : badges.length === 0 ? (
              <span className="text-contrast text-sm">Nenhuma conquista ainda.</span>
            ) : (
              badges.map((userBadge) => (
                <div key={userBadge.id} title={userBadge.badge.descricao} className="flex items-center gap-1">
                  {userBadge.badge.icone_url && (
                    <img src={userBadge.badge.icone_url} alt={userBadge.badge.nome} className="w-6 h-6 rounded-full border border-neutral bg-surface" />
                  )}
                  <BadgeUI className="bg-accent text-primary font-semibold px-3 py-1" >
                    {userBadge.badge.nome}
                  </BadgeUI>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface p-6 rounded-lg">
            <h3 className="card-title mb-2 text-primary">
              Treinamentos Disponíveis
            </h3>
            <p className="card-description mb-4 text-contrast">
              Acesse os vídeos de treinamento organizados por categoria
            </p>
            <div className="text-2xl font-bold text-accent">15</div>
          </div>
          
          <div className="bg-surface p-6 rounded-lg">
            <h3 className="card-title mb-2 text-primary">
              Progresso Geral
            </h3>
            <p className="card-description mb-4 text-contrast">
              Seu progresso nos treinamentos
            </p>
            <div className="text-2xl font-bold text-accent">78%</div>
          </div>
          
          <div className="bg-surface p-6 rounded-lg">
            <h3 className="card-title mb-2 text-primary">
              Certificados
            </h3>
            <p className="card-description mb-4 text-contrast">
              Certificados conquistados
            </p>
            <div className="text-2xl font-bold text-accent">3</div>
          </div>
        </div>
      </div>
    </ERALayout>
  );
};

export default Index;
