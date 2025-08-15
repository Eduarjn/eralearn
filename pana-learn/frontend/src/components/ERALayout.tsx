import { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { ERASidebar } from "@/components/ERASidebar";
import { Button } from "@/components/ui/button";
import { Menu, X, GraduationCap, ChevronRight } from "lucide-react";
import { useBranding } from '@/context/BrandingContext';

interface ERALayoutProps {
  children: React.ReactNode;
  breadcrumbs?: string[]; // Ex: ['Cursos', 'Nome do Curso', 'Aula X']
  cursoNome?: string;
  userNome?: string;
}

export function ERALayout({ children, breadcrumbs = [], cursoNome = '', userNome = 'Admin' }: ERALayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { branding } = useBranding();

  // Logo padrão como fallback
  const defaultLogo = "/era-logo.png";
  const currentLogo = branding.logo_url || defaultLogo;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[var(--primary-bg)] font-heading">
        {/* Mobile sidebar overlay */}
        <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-[var(--primary-fg)] bg-[var(--primary-bg)]">
              <div className="flex items-center space-x-2">
                <img src={currentLogo} alt="Logo da Empresa" className="h-8 w-24 object-contain" />
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="text-[var(--primary-fg)] hover:bg-[var(--sidebar-hover-bg)]">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ERASidebar />
          </div>
        </div>
        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <ERASidebar />
        </div>
        {/* Main content */}
        <div className="flex-1 lg:pl-64">
          {/* Top bar fixa */}
          <div className="bg-[var(--primary-bg)] border-b border-[var(--primary-fg)] px-4 py-3 flex items-center justify-between lg:px-6 shadow-sm sticky top-0 z-30">
            {/* Esquerda: logo/menu */}
            <div className="flex items-center space-x-4 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-[var(--primary-fg)] hover:bg-[var(--sidebar-hover-bg)]"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2 lg:hidden">
                <img src={currentLogo} alt="Logo da Empresa" className="h-8 max-w-[120px] object-contain" />
              </div>
            </div>
            {/* Centro: breadcrumbs ou nome do curso */}
            <div className="flex-1 flex justify-center min-w-0">
              {breadcrumbs.length > 0 ? (
                <nav className="flex items-center space-x-2 text-base text-[var(--primary-fg)] font-heading font-bold tracking-[0.05em] truncate">
                  {breadcrumbs.map((crumb, idx) => (
                    <span key={idx} className={`truncate ${idx === breadcrumbs.length - 1 ? 'text-[var(--primary-fg)] font-bold' : ''}`}>
                      {crumb}
                      {idx < breadcrumbs.length - 1 && <ChevronRight className="inline mx-1 h-4 w-4 text-[var(--primary-fg)] align-middle" />}
                    </span>
                  ))}
                </nav>
              ) : (
                <img src={currentLogo} alt="Logo da Empresa" className="h-10 max-w-[200px] object-contain mx-auto" />
              )}
            </div>
            {/* Direita: perfil */}
            <div className="flex items-center space-x-4">
              <Button className="bg-[var(--primary-fg)] text-[var(--primary-bg)] font-heading font-bold px-6 py-2 rounded-lg hover:bg-[var(--primary-bg)] hover:text-[var(--primary-fg)] border-2 border-[var(--primary-fg)] transition-all duration-200">
                Fale conosco
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[var(--primary-fg)] flex items-center justify-center text-[var(--primary-bg)] font-heading font-bold">
                  {userNome?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span className="text-base text-[var(--primary-fg)] font-heading font-bold truncate max-w-[120px]">{userNome}</span>
              </div>
            </div>
          </div>
          {/* Page content */}
          <main className="p-4 lg:p-6 bg-[var(--primary-bg)] min-h-screen font-base">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
