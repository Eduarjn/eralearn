import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function AuthForm() {
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  // Garantir campos vazios por padrão
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('🔐 Iniciando login:', { email });

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message || 'Erro no login');
        console.error('❌ Erro de login:', error);
      } else {
        console.log('✅ Login realizado com sucesso');
        // Redirecionamento será feito automaticamente
      }
    } catch (err) {
      console.error('❌ Erro inesperado no login:', err);
      setError('Erro inesperado no sistema');
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

    console.log('📝 Iniciando cadastro:', { email, nome });

    // Validações básicas
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

    try {
      const { error } = await signUp(email, password, nome.trim());
      
      if (error) {
        console.error('❌ Erro no cadastro:', error);
        setError(error.message || 'Erro ao criar conta');
      } else {
        setMessage('Conta criada com sucesso! Você pode fazer login agora.');
        console.log('✅ Cadastro realizado com sucesso');
        // Limpar formulário
        (e.target as HTMLFormElement).reset();
      }
    } catch (err) {
      console.error('❌ Erro inesperado no cadastro:', err);
      setError('Erro inesperado no sistema');
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetMessage('');
    setResetError('');
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin + '/reset-password'
    });
    if (error) {
      setResetError('Erro ao enviar email: ' + error.message);
    } else {
      setResetMessage('Se o email existir, você receberá um link para redefinir sua senha.');
    }
  };

  return (
    <div className="era-login-bg min-h-screen flex items-center justify-center p-4 relative">
      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <Card className="backdrop-blur-md bg-white/95 border-white/30 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <img 
                  src="/lovable-uploads/92441561-a944-48ee-930e-7e3b16318673.png" 
                  alt="Platform Symbol" 
                  className="w-6 h-6 filter invert"
                />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-accent">ERA Learn</CardTitle>
                <p className="text-xs text-contrast">Smart Training Platform</p>
              </div>
            </div>
            <CardDescription className="text-contrast">
              Acesse sua plataforma de treinamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={setTab} defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 bg-era-light-gray">
                <TabsTrigger value="signin" className="data-[state=active]:bg-era-lime data-[state=active]:text-era-dark-blue text-era-dark-blue">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-era-lime data-[state=active]:text-era-dark-blue text-era-dark-blue">
                  Cadastrar
                </TabsTrigger>
                <TabsTrigger value="forgot" className="data-[state=active]:bg-era-lime data-[state=active]:text-era-dark-blue text-era-dark-blue">
                  Esqueci a senha
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
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full era-lime-button !text-white font-semibold" 
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
                  <button type="button" onClick={() => setTab('forgot')} className="text-era-lime underline text-sm mt-2">
                    Esqueci minha senha?
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="forgot">
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input id="reset-email" name="reset-email" type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required disabled={loading} />
                  </div>
                  <Button type="submit" className="w-full era-lime-button text-era-dark-blue font-semibold" disabled={loading}>
                    {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</>) : ('Enviar link de redefinição')}
                  </Button>
                  {resetMessage && (
                    <Alert className="bg-green-50 border-green-200">
                      <AlertDescription className="text-green-800">{resetMessage}</AlertDescription>
                    </Alert>
                  )}
                  {resetError && (
                    <Alert className="bg-red-50 border-red-200">
                      <AlertDescription className="text-red-800">{resetError}</AlertDescription>
                    </Alert>
                  )}
                  <button type="button" onClick={() => setTab('signin')} className="text-era-lime underline text-sm mt-2">
                    Voltar para login
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-nome" className="text-era-dark-blue font-medium">Nome completo *</Label>
                    <Input
                      id="signup-nome"
                      name="nome"
                      type="text"
                      required
                      className="form-input"
                      placeholder="Seu nome completo"
                      minLength={2}
                      value={nome}
                      onChange={e => setNome(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-era-dark-blue font-medium">Email *</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      required
                      className="form-input"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-era-dark-blue font-medium">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        className="form-input pr-12"
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
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
