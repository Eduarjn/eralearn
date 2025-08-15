import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Treinamentos from "./pages/Treinamentos";
import Certificados from "./pages/Certificados";
import Relatorios from "./pages/Relatorios";
import Usuarios from "./pages/Usuarios";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import YouTube from "./pages/YouTube";
import Empresas from './pages/Empresas';
import AuditLogs from './pages/AuditLogs';
import { BrandingProvider } from '@/context/BrandingContext';
import ResetPassword from './pages/ResetPassword';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AuthBrandingWrapper />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Wrapper para pegar o userProfile e passar empresa_id para BrandingProvider
import { useAuth } from '@/hooks/useAuth';
function AuthBrandingWrapper() {
  const { userProfile, loading } = useAuth();
  if (loading) return null;
  return (
    <BrandingProvider empresaId={userProfile?.empresa_id}>
      <AppRoutes />
    </BrandingProvider>
  );
}

// Separar as rotas para dentro de um componente
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/treinamentos" 
        element={
          <ProtectedRoute>
            <Treinamentos />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/certificados" 
        element={
          <ProtectedRoute>
            <Certificados />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/youtube" 
        element={
          <ProtectedRoute>
            <YouTube />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/empresas" 
        element={
          <ProtectedRoute>
            <Empresas />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/audit-logs" 
        element={
          <ProtectedRoute>
            <AuditLogs />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/relatorios" 
        element={
          <ProtectedRoute>
            <Relatorios />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/usuarios" 
        element={
          <ProtectedRoute>
            <Usuarios />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/configuracoes" 
        element={
          <ProtectedRoute>
            <Configuracoes />
          </ProtectedRoute>
        } 
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
