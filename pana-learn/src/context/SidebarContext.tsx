import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSidebarState, setSidebarState, getSidebarWidth } from '@/lib/sidebar-utils';

type SidebarState = 'collapsed' | 'expanded' | 'pinned';

interface SidebarContextType {
  sidebarState: SidebarState;
  setSidebarState: (state: SidebarState) => void;
  sidebarWidth: number;
  isExpanded: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [sidebarState, setSidebarStateState] = useState<SidebarState>(getSidebarState);
  const sidebarWidth = getSidebarWidth(sidebarState);
  const isExpanded = sidebarState === 'expanded' || sidebarState === 'pinned';

  const handleSetSidebarState = (state: SidebarState) => {
    setSidebarStateState(state);
    setSidebarState(state);
  };

  useEffect(() => {
    setSidebarStateState(getSidebarState());
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        sidebarState,
        setSidebarState: handleSetSidebarState,
        sidebarWidth,
        isExpanded,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}







