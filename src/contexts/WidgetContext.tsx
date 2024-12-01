import { createContext, useContext, useState } from 'react';

interface WidgetContextType {
  isExpanded: boolean;
  setExpanded: (expanded: boolean) => void;
  toggleExpand: () => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function WidgetProvider({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const setExpanded = (expanded: boolean) => setIsExpanded(expanded);
  const toggleExpand = () => setIsExpanded(prev => !prev);

  return (
    <WidgetContext.Provider value={{ isExpanded, setExpanded, toggleExpand }}>
      {children}
    </WidgetContext.Provider>
  );
}

export const useWidget = () => {
  const context = useContext(WidgetContext);
  if (!context) throw new Error('useWidget must be used within WidgetProvider');
  return context;
}; 