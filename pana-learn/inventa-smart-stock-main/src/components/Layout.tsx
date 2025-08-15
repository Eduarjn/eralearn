
import { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        {/* Mobile sidebar overlay */}
        <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <img src="/lovable-uploads/c9f9e3e7-a54d-4972-9dbb-127fbb0c2bc8.png" alt="Inventa" className="h-8" />
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <AppSidebar />
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <AppSidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 lg:pl-64">
          {/* Top bar */}
          <div className="bg-white border-b px-4 py-3 flex items-center justify-between lg:px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <img src="/lovable-uploads/c9f9e3e7-a54d-4972-9dbb-127fbb0c2bc8.png" alt="Inventa" className="h-8 lg:hidden" />
              <h1 className="text-xl font-semibold text-gray-900 hidden lg:block">Sistema de Controle de Estoque</h1>
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
