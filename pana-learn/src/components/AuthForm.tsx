import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useBranding } from '../context/BrandingContext';
import { resolveLogoPath, resolveBackgroundPath, imageFallbacks } from '@/utils/imageUtils';
import { getVercelImageUrl, VERCEL_IMAGES } from '@/utils/vercelImageUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, GraduationCap, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SENHA_ADMIN = 'admin123';

export function AuthForm() {
  const { signIn, signUp } = useAuth();
  const { branding } = useBranding();
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState<'admin' | 'cliente'>('cliente');
  const [senhaValidacao, setSenhaValidacao] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  // Testar se a imagem de fundo carrega
  useEffect(() => {
    const testBackgroundImage = () => {
      const img = new Image();
      img.onload = () => {
        console.log('✅ Imagem de fundo carregada com sucesso');
        setBackgroundLoaded(true);
      };
      img.onerror = (e) => {
        console.error('❌ Erro ao carregar imagem de fundo, usando fallback', e);
        console.error('URL da imagem:', resolveBackgroundPath(branding.background_url));
        console.error('Ambiente:', window.location.hostname);
        setBackgroundLoaded(false);
      };
      img.src = resolveBackgroundPath(branding.background_url);
    };

    testBackgroundImage();
  }, []);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('❌ Erro no login:', error);
        setError(error.message || 'Erro ao fazer login');
      } else {
        setMessage('Login realizado com sucesso!');
        console.log('✅ Login realizado com sucesso');
      }
    } catch (err) {
      console.error('❌ Erro inesperado no login:', err);
      setError('Erro inesperado no sistema');
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResetError('');
    setResetMessage('');
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('reset-email') as string;

    console.log('📧 Iniciando recuperação de senha:', { email });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        setResetError(error.message || 'Erro ao enviar email de recuperação');
        console.error('❌ Erro na recuperação de senha:', error);
      } else {
        setResetMessage('Email de recuperação enviado! Verifique sua caixa de entrada.');
        console.log('✅ Email de recuperação enviado com sucesso');
        setResetEmail('');
      }
    } catch (err) {
      console.error('❌ Erro inesperado na recuperação:', err);
      setResetError('Erro inesperado no sistema');
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const nome = formData.get('nome') as string;
    const tipoUsuario = formData.get('tipo_usuario') as 'admin' | 'cliente';
    const senhaValidacao = formData.get('senha_validacao') as string;

    if (!nome || nome.trim() === '') {
      setError('Nome é obrigatório');
      setLoading(false);
      return;
    }

    if (!email || email.trim() === '') {
      setError('Email é obrigatório');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (tipoUsuario === 'admin' && senhaValidacao !== SENHA_ADMIN) {
      setError('Senha de validação para administrador incorreta!');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(email, password, nome.trim(), tipoUsuario, tipoUsuario === 'admin' ? senhaValidacao : null);
      
      if (error) {
        console.error('❌ Erro no cadastro:', error);
        setError(error.message || 'Erro ao criar conta');
      } else {
        setMessage('Conta criada com sucesso! Verifique seu e-mail para finalizar o cadastro antes de fazer login.');
        console.log('✅ Cadastro realizado com sucesso');
        (e.target as HTMLFormElement).reset();
      }
    } catch (err) {
      console.error('❌ Erro inesperado no cadastro:', err);
      setError('Erro inesperado no sistema');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background com imagem do escritório moderno */}
              <div 
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${
            backgroundLoaded ? 'login-background' : 'login-background-fallback'
          }`}
          style={{
            backgroundImage: backgroundLoaded 
              ? `url(https://eralearn-94hi.vercel.app/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png)`
              : undefined
          }}
        >
        {/* Overlay escuro para contraste */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Container principal */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo e título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="https://eralearn-94hi.vercel.app/logotipoeralearn.png" 
              alt="ERA Learn Logo" 
              id="login-logo"
              className="w-full h-32 lg:h-40 object-contain logo-rounded cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{ 
                borderRadius: '12px',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
                borderBottomLeftRadius: '12px',
                borderBottomRightRadius: '12px'
              }}
              onClick={() => {
                window.open('https://era.com.br/', '_blank');
              }}
              onError={(e) => {
                console.error('❌ Erro ao carregar logo:', e);
                // Evitar loop infinito - usar fallback simples
                if (!e.currentTarget.src.includes('/placeholder.svg')) {
                  console.log('🔄 Usando fallback placeholder');
                  e.currentTarget.src = '/placeholder.svg';
                } else {
                  console.error('❌ Fallback também falhou');
                }
              }}
              onLoad={() => {
                console.log('✅ Logo carregado com sucesso: https://eralearn-94hi.vercel.app/logotipoeralearn.png');
              }}
              title="Clique para visitar o site ERA"
            />
          </div>
          <p className="text-white/80 text-sm">Plataforma de Ensino Online</p>
        </div>

        {/* Card de login com glassmorphism */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
          {/* Abas de navegação */}
          <div className="flex mb-6 bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Cadastrar
            </button>
          </div>

          {/* Título do formulário */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white">
              {activeTab === 'login' ? 'Fazer Login' : 'Criar Conta'}
            </h2>
            <p className="text-white/70 text-sm mt-1">
              {activeTab === 'login' 
                ? 'Entre com suas credenciais para acessar a plataforma'
                : 'Preencha os dados para criar sua conta'
              }
            </p>
          </div>

          {/* Alertas */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-400/30 rounded-lg">
              <p className="text-green-200 text-sm font-medium">{message}</p>
            </div>
          )}

          {/* Formulário de Login */}
          {activeTab === 'login' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Input
                  name="email"
                  type="email"
                  required
                  className="w-full bg-white/10 border-white/20 text-white placeholder-white/60 rounded-lg px-4 py-3 focus:bg-white/15 focus:border-white/40 transition-all duration-200"
                  placeholder="seu@email.com"
                />
              </div>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-white/10 border-white/20 text-white placeholder-white/60 rounded-lg px-4 py-3 pr-12 focus:bg-white/15 focus:border-white/40 transition-all duration-200"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
              
              {/* Link para recuperação de senha */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('forgot')}
                  className="text-white/70 hover:text-white text-sm underline transition-colors duration-200"
                >
                  Esqueci minha senha
                </button>
              </div>
            </form>
          )}

          {/* Formulário de Recuperação de Senha */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-center mb-4">
                <Mail className="h-12 w-12 text-white/60 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-white">Recuperar Senha</h3>
                <p className="text-white/60 text-sm">Digite seu email para receber instruções de recuperação</p>
              </div>
              
              <div>
                <Input
                  name="reset-email"
                  type="email"
                  required
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  className="w-full bg-white/10 border-white/20 text-white placeholder-white/60 rounded-lg px-4 py-3 focus:bg-white/15 focus:border-white/40 transition-all duration-200"
                  placeholder="seu@email.com"
                  disabled={loading}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar link de recuperação'
                )}
              </Button>

              {resetMessage && (
                <div className="p-3 bg-green-500/20 border border-green-400/30 rounded-lg">
                  <p className="text-green-200 text-sm font-medium">{resetMessage}</p>
                </div>
              )}

              {resetError && (
                <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                  <p className="text-red-200 text-sm font-medium">{resetError}</p>
                </div>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-white/70 hover:text-white text-sm underline transition-colors duration-200"
                >
                  Voltar para login
                </button>
              </div>
            </form>
          )}

          {/* Formulário de Cadastro */}
          {activeTab === 'register' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Input
                  name="nome"
                  type="text"
                  required
                  className="w-full bg-white/10 border-white/20 text-white placeholder-white/60 rounded-lg px-4 py-3 focus:bg-white/15 focus:border-white/40 transition-all duration-200"
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <Input
                  name="email"
                  type="email"
                  required
                  className="w-full bg-white/10 border-white/20 text-white placeholder-white/60 rounded-lg px-4 py-3 focus:bg-white/15 focus:border-white/40 transition-all duration-200"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <Input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="w-full bg-white/10 border-white/20 text-white placeholder-white/60 rounded-lg px-4 py-3 focus:bg-white/15 focus:border-white/40 transition-all duration-200"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <select
                  name="tipo_usuario"
                  value={tipoUsuario}
                  onChange={e => setTipoUsuario(e.target.value as 'admin' | 'cliente')}
                  className="w-full bg-white/10 border-white/20 text-white rounded-lg px-4 py-3 focus:bg-white/15 focus:border-white/40 transition-all duration-200"
                >
                  <option value="cliente" className="bg-gray-800 text-white">Cliente</option>
                  <option value="admin" className="bg-gray-800 text-white">Administrador</option>
                </select>
              </div>
              {tipoUsuario === 'admin' && (
                <div>
                  <Input
                    name="senha_validacao"
                    type="password"
                    required={tipoUsuario === 'admin'}
                    value={senhaValidacao}
                    onChange={e => setSenhaValidacao(e.target.value)}
                    className="w-full bg-white/10 border-white/20 text-white placeholder-white/60 rounded-lg px-4 py-3 focus:bg-white/15 focus:border-white/40 transition-all duration-200"
                    placeholder="Digite a senha de validação"
                  />
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar conta'
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Informações adicionais */}
        <div className="text-center mt-6">
          <p className="text-white/60 text-xs">
            {activeTab === 'login' 
              ? 'Não tem uma conta? Clique em "Cadastrar" acima'
              : activeTab === 'register'
              ? 'Já tem uma conta? Clique em "Entrar" acima'
              : 'Lembrou sua senha? Volte para o login'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
