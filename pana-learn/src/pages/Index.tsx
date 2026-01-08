import { useAuth } from '@/hooks/useAuth';
import { useBranding } from '@/context/BrandingContext';
import { ERALayout } from '@/components/ERALayout';
import Login from './Login'; // <--- Sua importação da tela de Login
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, loading, userProfile } = useAuth();
  const { branding } = useBranding();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('📍 Index - Estado atual:', { 
      user: user?.email, 
      loading, 
      userProfile: userProfile?.nome 
    });
    
    // Só redirecionar se tiver usuário autenticado E perfil carregado
    if (!loading && user && userProfile) {
      console.log('🔄 Redirecionando para dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, userProfile, navigate]);

  // CORREÇÃO AQUI: 
  // Expandimos esta condição para cobrir também quando o usuário JÁ está logado (user && userProfile).
  // Assim, enquanto ele espera o redirecionamento acontecer, ele vê o "Carregando" em vez do layout antigo.
  if (loading || (user && userProfile)) {
    return (
      <div className="hero-background min-h-screen relative flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-era-lime mx-auto mb-4"></div>
          <p className="text-lg font-medium">
            {loading ? 'Carregando...' : 'Acessando Dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  // Se o código chegou aqui, significa que NÃO tem usuário logado.
  // Então mostramos a tela de Login.
  if (!user || !userProfile) {
    return <Login />;
  }

  // O código abaixo (layout antigo) foi mantido conforme você pediu, 
  // mas agora ele é tecnicamente inalcançável porque as condições acima 
  // capturam tanto o estado "logado" quanto o "deslogado".
  return (
    <ERALayout>
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-era-lime rounded-lg flex items-center justify-center">
              <img 
                src={branding.logo_url} 
                alt="Platform Symbol" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-high-contrast">
                Bem-vindo
              </h1>
              <p className="text-era-lime text-base font-semibold mt-2">
                Aprenda com seu parceiro de confiança, usando métodos modernos e inteligentes.
              </p>
              <p className="text-medium-contrast text-lg">
                Sua plataforma de treinamento corporativo
              </p>
            </div>
          </div>
          <p className="text-sm text-era-gray mt-2">
            Olá, {userProfile?.nome}! Você está logado como {userProfile?.tipo_usuario}.
          </p>
        </div>
        
        {/* Cards de Exemplo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card-improved p-6 rounded-lg">
            <h3 className="card-title mb-2">Treinamentos Disponíveis</h3>
            <p className="card-description mb-4">Acesse os vídeos de treinamento</p>
            <div className="text-2xl font-bold text-blue-600">15</div>
          </div>
          
          <div className="bg-card-improved p-6 rounded-lg">
            <h3 className="card-title mb-2">Progresso Geral</h3>
            <p className="card-description mb-4">Seu progresso nos treinamentos</p>
            <div className="text-2xl font-bold text-green-600">78%</div>
          </div>
          
          <div className="bg-card-improved p-6 rounded-lg">
            <h3 className="card-title mb-2">Certificados</h3>
            <p className="card-description mb-4">Certificados conquistados</p>
            <div className="text-2xl font-bold text-purple-600">3</div>
          </div>
        </div>
      </div>
    </ERALayout>
  );
};

export default Index;