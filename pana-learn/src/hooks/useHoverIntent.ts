import { useState, useRef, useCallback, useEffect } from 'react';

interface UseHoverIntentOptions {
  openDelay?: number;
  closeDelay?: number;
  onEnter?: () => void;
  onLeave?: () => void;
}

export function useHoverIntent({
  openDelay = 200,
  closeDelay = 500,
  onEnter,
  onLeave
}: UseHoverIntentOptions = {}) {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const clearCurrentTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    clearCurrentTimeout();
    timeoutRef.current = setTimeout(() => {
      setIsHovered(true);
      onEnter?.();
    }, openDelay);
  }, [openDelay, onEnter, clearCurrentTimeout]);

  const handleMouseLeave = useCallback(() => {
    clearCurrentTimeout();
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      onLeave?.();
    }, closeDelay);
  }, [closeDelay, onLeave, clearCurrentTimeout]);

  const setElement = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
  }, []);

  useEffect(() => {
    return clearCurrentTimeout;
  }, [clearCurrentTimeout]);

  return {
    isHovered,
    setElement,
    handleMouseEnter,
    handleMouseLeave
  };
}
