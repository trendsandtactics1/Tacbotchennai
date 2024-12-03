'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface WidgetContextType {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function WidgetProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <WidgetContext.Provider value={{ isExpanded, setIsExpanded }}>
      {children}
    </WidgetContext.Provider>
  );
}

export function useWidget() {
  const context = useContext(WidgetContext);
  if (context === undefined) {
    throw new Error('useWidget must be used within a WidgetProvider');
  }
  return context;
}
