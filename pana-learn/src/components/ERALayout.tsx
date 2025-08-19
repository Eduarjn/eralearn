import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle, ChevronRight, Mail, Phone, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from '@/hooks/useAuth';
import { AISupportButton } from './AISupportButton';
import { Sidebar } from './layout/Sidebar';
import { useSidebar } from '@/context/SidebarContext';
import { useResponsive } from '@/hooks/useResponsive';

interface ERALayoutProps {
  children: React.ReactNode;
  breadcrumbs?: string[];
  cursoNome?: string;
  userNome?: string;
}

export function ERALayout({ children, breadcrumbs = [], cursoNome = '', userNome = 'Admin' }: ERALayoutProps) {
  const { userProfile } = useAuth();
  const { sidebarWidth, isExpanded } = useSidebar();
  const { isDesktop, isLargeDesktop } = useResponsive();
  const [showContactDialog, setShowContactDialog] = useState(false);

  return (
    <>
      <Sidebar>
        <div className="flex flex-col h-full sidebar-layout">
        {/* Header */}
        <header className="bg-surface border-b border-futuristic px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            {/* Esquerda: breadcrumbs */}
            <div className="flex items-center space-x-4">
              {/* Breadcrumbs */}
              <div className="hidden sm:flex items-center space-x-2 text-sm text-muted">
                {breadcrumbs.map((crumb, idx) => (
                  <span key={idx} className={`${idx === breadcrumbs.length - 1 ? 'font-semibold text-text' : ''}`}>
                    {crumb}
                    {idx < breadcrumbs.length - 1 && <ChevronRight className="inline mx-1 h-4 w-4" />}
                  </span>
                ))}
              </div>
            </div>

            {/* Centro: título da página */}
            <div className="flex-1 flex justify-center min-w-0">
              {breadcrumbs.length > 0 ? (
                <nav className="flex items-center space-x-2 text-base text-text font-bold tracking-[0.05em] truncate">
                  {breadcrumbs.map((crumb, idx) => (
                    <span key={idx} className={`truncate ${idx === breadcrumbs.length - 1 ? 'text-accent' : ''}`}>
                      {crumb}
                      {idx < breadcrumbs.length - 1 && <ChevronRight className="inline mx-1 h-4 w-4 text-muted align-middle" />}
                    </span>
                  ))}
                </nav>
              ) : (
                <h1 className="text-xl font-bold text-text">ERA Learn</h1>
              )}
            </div>

            {/* Direita: ações */}
            <div className="flex items-center space-x-4">
              {/* Botão Fale Conosco */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowContactDialog(true)}
                className="text-muted hover:text-text hover:bg-surface-hover border border-transparent hover:border-accent transition-all duration-200"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Fale Conosco</span>
              </Button>

              {/* Avatar do usuário */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">
                    {userProfile?.nome?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="hidden sm:inline text-sm text-text">
                  {userProfile?.nome || 'Usuário'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main 
          className="flex-1 p-4 lg:p-6 overflow-y-auto transition-all duration-200 ease-in-out sidebar-content main-content"
          style={{ 
            marginLeft: (isDesktop || isLargeDesktop) ? `${sidebarWidth}px` : '0px',
            width: (isDesktop || isLargeDesktop) ? `calc(100% - ${sidebarWidth}px)` : '100%'
          }}
        >
          {children}
        </main>

        {/* Botão de Suporte IA */}
        <AISupportButton />
      </div>
      </Sidebar>

      {/* Dialog de contato */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span>Fale Conosco</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-accent" />
              <div>
                <p className="font-semibold text-text">Email</p>
                <p className="text-sm text-muted">contato@eralearn.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-accent" />
              <div>
                <p className="font-semibold text-text">Telefone</p>
                <p className="text-sm text-muted">(11) 9999-9999</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-accent" />
              <div>
                <p className="font-semibold text-text">Endereço</p>
                <p className="text-sm text-muted">São Paulo, SP</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setShowContactDialog(false)}
              className="btn-futuristic"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
