
import { Home, Package, BarChart3, Users, ShoppingCart, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  { title: "Dashboard", icon: Home, path: "/" },
  { title: "Produtos", icon: Package, path: "/produtos" },
  { title: "Estoque", icon: BarChart3, path: "/estoque" },
  { title: "Clientes", icon: Users, path: "/clientes" },
  { title: "Vendas", icon: ShoppingCart, path: "/vendas" },
  { title: "Configurações", icon: Settings, path: "/configuracoes" },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <img src="/lovable-uploads/c9f9e3e7-a54d-4972-9dbb-127fbb0c2bc8.png" alt="Inventa" className="h-8 filter brightness-0 invert" />
          <div>
            <h2 className="text-lg font-bold">INVENTA</h2>
            <p className="text-xs text-gray-400">Smart Stock</p>
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
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start text-left ${
                isActive 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.title}
            </Button>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">A</span>
          </div>
          <div>
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-gray-400">admin@inventa.com</p>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800">
          <LogOut className="mr-3 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}
