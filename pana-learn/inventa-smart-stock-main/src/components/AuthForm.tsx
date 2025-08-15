
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, GraduationCap } from 'lucide-react';

export function AuthForm() {
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('🔐 Iniciando processo de login:', { email });

    const { error } = await signIn(email, password);
    
    if (error) {
      setError('Email ou senha incorretos. Tente novamente.');
      console.error('❌ Erro de login:', error);
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

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, nome);
    
    if (error) {
      if (error.message?.includes('already registered')) {
        setError('Este email já está cadastrado. Tente fazer login.');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } else {
      setMessage('Conta criada com sucesso!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png')`,
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <Card className="backdrop-blur-md bg-white/95 border-white/30 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-era-dark-blue rounded-lg flex items-center justify-center">
                <img 
                  src="/lovable-uploads/92441561-a944-48ee-930e-7e3b16318673.png" 
                  alt="Platform Symbol" 
                  className="w-6 h-6 filter invert"
                />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-era-dark-blue">ERA Learn</CardTitle>
                <p className="text-xs text-era-gray">Smart Training Platform</p>
              </div>
            </div>
            <CardDescription className="text-era-gray">
              Acesse sua plataforma de treinamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Usuários de Teste */}
            <div className="mb-6 p-4 bg-era-lime/10 rounded-lg border border-era-lime/20">
              <h3 className="text-sm font-semibold text-era-dark-blue mb-2 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Credenciais de Teste:
              </h3>
              <div className="text-xs text-era-gray space-y-1">
                <p><strong>Admin:</strong> admin@eralearn.com / test123456</p>
                <p><strong>Cliente:</strong> cliente@eralearn.com / test123456</p>
              </div>
            </div>

            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-era-light-gray">
                <TabsTrigger value="signin" className="data-[state=active]:bg-era-lime data-[state=active]:text-era-dark-blue">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-era-lime data-[state=active]:text-era-dark-blue">
                  Cadastrar
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {message && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-era-dark-blue font-medium">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      required
                      defaultValue="admin@eralearn.com"
                      className="form-input"
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-era-dark-blue font-medium">Senha</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        defaultValue="test123456"
                        className="form-input pr-12"
                        placeholder="Sua senha"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-era-gray hover:text-era-dark-blue"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full era-lime-button text-era-dark-blue font-semibold" 
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
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-nome" className="text-era-dark-blue font-medium">Nome completo</Label>
                    <Input
                      id="signup-nome"
                      name="nome"
                      type="text"
                      required
                      className="form-input"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-era-dark-blue font-medium">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      required
                      className="form-input"
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-era-dark-blue font-medium">Senha</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        className="form-input pr-12"
                        placeholder="Mínimo 6 caracteres"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-era-gray hover:text-era-dark-blue"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full era-lime-button text-era-dark-blue font-semibold" 
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
