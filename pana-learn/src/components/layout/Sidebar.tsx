import React, { useState } from 'react';
import { useSidebar } from '@/context/SidebarContext';
import { ERASidebar } from '../ERASidebar';
import { MobileNavigation } from '../MobileNavigation';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface SidebarProps {
  children: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const { sidebarWidth } = useSidebar();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-futuristic overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-30">
        <ERASidebar />
      </div>

      {/* Mobile Header with Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="text-white hover:bg-white/10 p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="text-white font-semibold text-lg">ERA Learn</div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">U</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <MobileNavigation 
        isOpen={isMobileMenuOpen} 
        onClose={closeMobileMenu} 
      />

      {/* Main Content with mobile padding */}
      <main 
        className="flex-1 transition-[margin-left] duration-200 ease-in-out overflow-hidden lg:ml-0"
        style={{ 
          // Ajusta o espaçamento para a sidebar fixa
          marginLeft: '0px',
          paddingTop: '0px'
        }}
      >
        {/* Mobile content padding */}
        <div className="lg:hidden pt-16 h-full overflow-y-auto mobile-scroll-fix bg-futuristic">
          {children}
        </div>
        
        {/* Desktop content */}
        <div className="hidden lg:block h-full overflow-y-auto bg-futuristic">
          {children}
        </div>
      </main>
    </div>
  );
}
