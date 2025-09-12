import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSidebarReturn {
  isExpanded: boolean;
  isPinned: boolean;
  expand: () => void;
  collapse: () => void;
  togglePin: () => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

export function useSidebar(): UseSidebarReturn {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoCollapseDelay = 800; // 800ms delay

  // Load pinned state from localStorage on mount
  useEffect(() => {
    const savedPinned = localStorage.getItem('sidebarPinned');
    if (savedPinned !== null) {
      setIsPinned(JSON.parse(savedPinned));
      // If pinned, start expanded
      if (JSON.parse(savedPinned)) {
        setIsExpanded(true);
      }
    }
  }, []);

  // Save pinned state to localStorage
  const savePinnedState = useCallback((pinned: boolean) => {
    localStorage.setItem('sidebarPinned', JSON.stringify(pinned));
  }, []);

  // Clear timeout
  const clearTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Expand sidebar
  const expand = useCallback(() => {
    setIsExpanded(true);
    clearTimeout();
  }, [clearTimeout]);

  // Collapse sidebar
  const collapse = useCallback(() => {
    if (!isPinned) {
      setIsExpanded(false);
    }
    clearTimeout();
  }, [isPinned, clearTimeout]);

  // Toggle pin state
  const togglePin = useCallback(() => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    savePinnedState(newPinned);
    
    if (newPinned) {
      // If pinning, expand
      setIsExpanded(true);
    } else {
      // If unpinning, collapse after delay
      timeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, autoCollapseDelay);
    }
  }, [isPinned, savePinnedState]);

  // Handle mouse enter
  const handleMouseEnter = useCallback(() => {
    expand();
  }, [expand]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    if (!isPinned) {
      timeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, autoCollapseDelay);
    }
  }, [isPinned]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        if (isExpanded && !isPinned) {
          collapse();
        }
        break;
      case 'Enter':
      case ' ':
        if (e.target === e.currentTarget) {
          e.preventDefault();
          if (isExpanded) {
            collapse();
          } else {
            expand();
          }
        }
        break;
    }
  }, [isExpanded, isPinned, expand, collapse]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      clearTimeout();
    };
  }, [clearTimeout]);

  return {
    isExpanded,
    isPinned,
    expand,
    collapse,
    togglePin,
    handleMouseEnter,
    handleMouseLeave,
    handleKeyDown,
  };
}



































