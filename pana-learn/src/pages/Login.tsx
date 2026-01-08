import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBranding } from '@/context/BrandingContext';
import { BlurText } from '@/ui/BlurText'; 
import { CountUp } from '@/ui/CountUp';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { branding } = useBranding();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      // O redirecionamento geralmente é automático pelo AuthProvider, 
      // mas garantimos enviando para o dashboard
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Erro no acesso",
        description: "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      
      {/* LADO ESQUERDO - LANDING / VISUAL (Gradiente + Animações) */}
      {/* Só aparece em telas grandes (lg) */}
      <div 
        className="hidden lg:flex w-1/2 flex-col justify-center px-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #2b363d 0%, #1a1a1a 100%)" }}
      >
        {/* Efeitos de fundo (Bolhas de luz) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-era-green blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600 blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-xl mx-auto text-left">
          
          {/* 1. Label Animada (Delay curto) */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-era-green rounded-full animate-pulse"></div>
            <BlurText 
              text="Plataforma de Ensino Corporativo" 
              className="text-era-green font-medium tracking-wide uppercase text-sm"
              delay={20}
              animateBy="letters"
            />
          </div>

          {/* 2. Título Principal (Delay médio) */}
          <div className="mb-6">
             <BlurText 
               text="Aprenda. Evolua. Conquiste."
               className="text-5xl font-bold text-white leading-tight"
               delay={50}
               animateBy="words"
               direction="top"
             />
          </div>

          {/* 3. Descrição (Delay um pouco maior) */}
          <div className="mb-10 max-w-lg">
            <BlurText 
              text="Acesse a plataforma mais completa para PABX e Omnichannel. Sua jornada de conhecimento começa agora."
              className="text-lg text-gray-300 leading-relaxed"
              delay={30}
              animateBy="words"
            />
          </div>

          {/* 4. Estatísticas com CountUp (Contador Numérico) */}
          <div className="flex gap-8 border-t border-white/10 pt-8 mt-8">
             
             {/* Item 1: Alunos */}
             <div>
                <h3 className="text-3xl font-bold text-white flex items-center">
                  <CountUp 
                    to={100} 
                    duration={2} 
                    delay={0.5} 
                    className="tabular-nums" 
                  />
                  <span className="text-era-green ml-1">+</span>
                </h3>
                <p className="text-gray-400 text-sm mt-1">Alunos Ativos</p>
             </div>
             
             {/* Item 2: Cursos */}
             <div>
                <h3 className="text-3xl font-bold text-white flex items-center">
                  <CountUp 
                    to={7} 
                    duration={2} 
                    delay={0.7} 
                    className="tabular-nums"
                  />
                  <span className="text-era-green ml-1">+</span>
                </h3>
                <p className="text-gray-400 text-sm mt-1">Cursos Completos</p>
             </div>
             
             {/* Item 3: Horas */}
             <div>
                <h3 className="text-3xl font-bold text-white flex items-center">
                  <CountUp 
                    to={24} 
                    duration={2} 
                    delay={0.9} 
                    className="tabular-nums"
                  />
                  <span className="text-era-green ml-1">h</span>
                </h3>
                <p className="text-gray-400 text-sm mt-1">Acesso Ilimitado</p>
             </div>

          </div>
        </div>
      </div>

      {/* LADO DIREITO - FORMULÁRIO DE LOGIN */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
          
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
               {/* Logo da Marca - Aumentado */}
               <div className="p-4 bg-era-green/10 rounded-2xl flex items-center justify-center">
                  {branding?.logo_url ? (
                    <img 
                      src={branding.logo_url} 
                      alt="Logo" 
                      className="h-24 w-auto object-contain" 
                    />
                  ) : (
                    <Lock className="w-12 h-12 text-era-green" />
                  )}
               </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Bem-vindo de volta</h2>
            <p className="mt-2 text-sm text-gray-600">
              Insira suas credenciais para acessar
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Corporativo</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-era-green transition-colors" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="voce@empresa.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-era-green transition-all rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <Link to="/reset-password" className="text-xs text-era-green hover:text-era-green/80 font-semibold hover:underline">
                        Esqueceu a senha?
                    </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-era-green transition-colors" />
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-era-green transition-all rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600"
                >
                    Lembrar-me neste dispositivo
                </label>
            </div>

            <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-era-black via-gray-800 to-era-black hover:to-gray-900 text-white h-12 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  Acessar Plataforma <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
             <p className="text-xs text-gray-400">
               Protegido por Pana Learn System © 2025
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;