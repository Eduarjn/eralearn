
import { Home, Video, Award, BarChart3, Users, Settings, LogOut, GraduationCap, BookOpen, FileText, PieChart, UserCheck, Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  { title: "Dashboard", icon: Home, path: "/dashboard" },
  { title: "Treinamentos", icon: BookOpen, path: "/treinamentos" },
  { title: "Certificados", icon: Award, path: "/certificados" },
  { title: "Relatórios", icon: PieChart, path: "/relatorios" },
  { title: "Usuários", icon: UserCheck, path: "/usuarios" },
  { title: "Configurações", icon: Cog, path: "/configuracoes" },
];

export function ERASidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, userProfile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex flex-col h-full era-gradient text-white">
      {/* Logo */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-era-lime rounded-lg flex items-center justify-center">
            <img 
              src="/lovable-uploads/92441561-a944-48ee-930e-7e3b16318673.png" 
              alt="Platform Symbol" 
              className="w-5 h-5 filter invert"
            />
          </div>
          <div>
            <h2 className="text-lg font-bold sidebar-text">ERA LEARN</h2>
            <p className="text-xs sidebar-text-muted">Smart Training</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.path}
              variant="ghost"
              className={`w-full justify-start text-left transition-all duration-200 ${
                isActive 
                  ? "nav-link active font-medium bg-era-lime/20 text-era-lime" 
                  : "nav-link hover:text-white hover:bg-white/10"
              }`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.title}
            </Button>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-white/20">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-era-lime rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-era-dark-blue">
              {userProfile?.nome ? userProfile.nome.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium sidebar-text">
              {userProfile?.nome || 'Usuário'}
            </p>
            <p className="text-xs sidebar-text-muted">
              {userProfile?.tipo_usuario || 'Logado'}
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start nav-link hover:text-white hover:bg-white/10"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}
