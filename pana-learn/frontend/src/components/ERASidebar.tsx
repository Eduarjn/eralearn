
import { Home, Video, Award, BarChart3, Users, Settings, LogOut, GraduationCap, BookOpen, FileText, PieChart, UserCheck, Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
import { useBranding } from '@/context/BrandingContext';

const menuItems = [
  { title: "Dashboard", icon: Home, path: "/dashboard", roles: ["admin", "cliente", "admin_master"] },
  { title: "Treinamentos", icon: BookOpen, path: "/treinamentos", roles: ["admin", "cliente", "admin_master"] },
  { title: "Vídeos", icon: Video, path: "/youtube", roles: ["admin", "cliente", "admin_master"] },
  { title: "Certificados", icon: Award, path: "/certificados", roles: ["admin", "cliente", "admin_master"] },
  { title: "Empresas", icon: Users, path: "/empresas", roles: ["admin_master"] },
  { title: "Logs de Auditoria", icon: BarChart3, path: "/audit-logs", roles: ["admin_master"] },
  { title: "Relatórios", icon: PieChart, path: "/relatorios", roles: ["admin", "admin_master"] },
  { title: "Usuários", icon: UserCheck, path: "/usuarios", roles: ["admin", "admin_master"] },
  { title: "Configurações", icon: Cog, path: "/configuracoes", roles: ["admin", "cliente", "admin_master"] },
];

export function ERASidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, userProfile } = useAuth();
  const { branding } = useBranding();

  const handleSignOut = async () => {
    await signOut();
  };

  // Filtrar menus baseado no tipo de usuário
  const visibleMenuItems = userProfile?.tipo_usuario === 'admin_master'
    ? menuItems // mostra tudo para admin_master
    : menuItems.filter(item => userProfile?.tipo_usuario && item.roles.includes(userProfile.tipo_usuario));

  // Logo padrão como fallback
  const defaultLogo = "/era-logo.png";
  const currentLogo = branding.logo_url || defaultLogo;

  return (
    <div className="flex flex-col h-full bg-[var(--sidebar-bg)] text-[var(--sidebar-fg)] font-heading font-bold">
      {/* Logo */}
      <div className="p-4 md:p-6 border-b border-[var(--primary-bg)]">
        <div className="flex items-center space-x-2 md:space-x-3">
          <img src={currentLogo} alt="Logo da Empresa" className="h-10 max-w-[160px] object-contain" />
        </div>
      </div>
      {/* Navigation */}
      <nav className="flex-1 p-2 md:p-4 space-y-1 overflow-y-auto">
        {visibleMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.path}
              variant="ghost"
              className={`w-full justify-start text-left transition-all duration-200 text-base p-4 rounded-lg font-heading font-bold tracking-[0.05em] ${
                isActive 
                  ? "bg-[var(--primary-bg)] text-[var(--primary-fg)] border-l-4 border-[var(--primary-bg)] shadow-lg" 
                  : "hover:bg-[var(--sidebar-hover-bg)] text-[var(--sidebar-fg)]"
              }`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />
              <span className="truncate">{item.title}</span>
            </Button>
          );
        })}
      </nav>
      {/* User section */}
      <div className="p-4 border-t border-[var(--primary-bg)]">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-[var(--primary-bg)] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-base font-heading font-bold text-[var(--primary-fg)]">
              {userProfile?.nome ? userProfile.nome.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="user-info flex flex-col">
              <span className="user-name font-heading font-bold text-lg text-[var(--sidebar-fg)]">
                {userProfile?.nome ? userProfile.nome.split(' ')[0] : 'Usuário'}
              </span>
              <span className="user-role text-sm text-[var(--primary-bg)] font-heading font-bold">
                {userProfile?.tipo_usuario === 'admin' ? 'Administrador' : 'Cliente'}
              </span>
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start hover:bg-[var(--sidebar-hover-bg)] text-[var(--sidebar-fg)] text-base p-4 font-heading font-bold"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    </div>
  );
}
