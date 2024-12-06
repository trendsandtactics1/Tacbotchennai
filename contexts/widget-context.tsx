'use client';

export function useWidget() {
  const setIsExpanded = (expanded: boolean) => {
    // Send message to parent window
    if (typeof window !== 'undefined') {
      window.parent.postMessage({ 
        type: 'widget-resize', 
        expanded 
      }, '*');
    }
  };

  return {
    setIsExpanded
  };
}
