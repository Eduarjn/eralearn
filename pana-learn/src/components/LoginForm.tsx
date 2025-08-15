import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onLogin: () => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  // Carregar credenciais do localStorage ao montar
  useEffect(() => {
    const saved = localStorage.getItem('pana-remember');
    if (saved) {
      const { email, password } = JSON.parse(saved);
      setEmail(email || '');
      setPassword(password || '');
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (rememberMe) {
      localStorage.setItem('pana-remember', JSON.stringify({ email, password }));
    } else {
      localStorage.removeItem('pana-remember');
    }
    // Simular autenticação
    setTimeout(() => {
      onLogin();
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Glassmorphism Login Container */}
        <div className="glassmorphism-card p-8 rounded-2xl shadow-2xl backdrop-blur-md">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">PANA LEARN</h1>
            <p className="text-gray-200 text-sm">Smart Training Platform</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-medium">
                Email ou Login
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:border-era-green focus:ring-era-green"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-medium">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 h-5 w-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:border-era-green focus:ring-era-green"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-300 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-white/20 data-[state=checked]:bg-era-green data-[state=checked]:border-era-green"
                />
                <Label htmlFor="remember" className="text-sm text-gray-200 cursor-pointer">
                  Remember me
                </Label>
              </div>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-era-green hover:text-era-green/80 transition-colors" onClick={e => { e.preventDefault(); setShowForgot(true); }}>
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-era-black font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-xs text-gray-300">
              © 2024 PANA LEARN. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de recuperação de senha (mock) */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowForgot(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4 text-era-black">Recuperar Senha</h2>
            <p className="mb-4 text-gray-700">Digite seu email para receber instruções de recuperação de senha.</p>
            <input
              type="email"
              className="border rounded px-3 py-2 w-full mb-4"
              placeholder="Seu email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Button className="w-full bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-era-black font-bold" onClick={() => { setShowForgot(false); alert('Se fosse real, um email seria enviado!'); }}>
              Enviar instruções
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
