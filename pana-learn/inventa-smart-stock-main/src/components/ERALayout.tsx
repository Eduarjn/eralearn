
import { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { ERASidebar } from "@/components/ERASidebar";
import { Button } from "@/components/ui/button";
import { Menu, X, GraduationCap } from "lucide-react";

interface ERALayoutProps {
  children: React.ReactNode;
}

export function ERALayout({ children }: ERALayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-era-light-gray">
        {/* Mobile sidebar overlay */}
        <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-white/20 era-gradient">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-8 w-8 text-era-lime" />
                <span className="text-xl font-bold sidebar-text">ERA Learn</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="text-white hover:bg-white/10">
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
          {/* Top bar */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between lg:px-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-era-text-primary hover:bg-gray-100"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2 lg:hidden">
                <GraduationCap className="h-6 w-6 text-era-lime" />
                <span className="text-lg font-bold text-era-text-primary">ERA Learn</span>
              </div>
              <h1 className="text-xl font-semibold text-era-text-primary hidden lg:block">
                Plataforma de Treinamento Corporativo
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button className="button-primary font-medium px-6 py-2 rounded-full hover:shadow-lg transition-all duration-200">
                Fale conosco
              </Button>
              <div className="text-sm text-era-text-secondary">
                Bem-vindo, <span className="font-medium text-era-text-primary">Admin</span>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
