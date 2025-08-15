
import { useState } from 'react';
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Login attempt:', { email, password, rememberMe });
    
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
            <h1 className="text-3xl font-bold text-white mb-2">ERA Learn</h1>
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
                  className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:border-era-lime focus:ring-era-lime"
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
                  className="pl-12 pr-12 bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:border-era-lime focus:ring-era-lime"
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
                  className="border-white/20 data-[state=checked]:bg-era-lime data-[state=checked]:border-era-lime"
                />
                <Label htmlFor="remember" className="text-sm text-gray-200 cursor-pointer">
                  Remember me
                </Label>
              </div>
              <a href="#" className="text-sm text-era-lime hover:text-era-lime/80 transition-colors">
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
            <Button 
              type="submit" 
              className="w-full bg-era-lime hover:bg-era-lime/90 text-era-dark-blue font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-xs text-gray-300">
              © 2024 ERA Learn. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
