export function isPointerNear(
  element: HTMLElement,
  event: MouseEvent,
  threshold: number = 32
): boolean {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  const distance = Math.sqrt(
    Math.pow(event.clientX - centerX, 2) + 
    Math.pow(event.clientY - centerY, 2)
  );
  
  return distance <= threshold;
}

export function getSidebarState(): 'collapsed' | 'expanded' | 'pinned' {
  if (typeof window === 'undefined') return 'collapsed';
  
  const saved = localStorage.getItem('era-sidebar-state');
  if (saved === 'pinned') return 'pinned';
  if (saved === 'expanded') return 'expanded';
  return 'collapsed';
}

export function setSidebarState(state: 'collapsed' | 'expanded' | 'pinned'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('era-sidebar-state', state);
}

export function getSidebarWidth(state: 'collapsed' | 'expanded' | 'pinned'): number {
  switch (state) {
    case 'collapsed':
      return 72;
    case 'expanded':
    case 'pinned':
      return 260;
    default:
      return 72;
  }
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}














