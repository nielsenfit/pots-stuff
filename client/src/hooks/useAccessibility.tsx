import React, { createContext, useContext, useState, useEffect } from 'react';

type AccessibilityContextType = {
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  largeText: boolean;
  setLargeText: (value: boolean) => void;
  screenReaderOptimized: boolean;
  setScreenReaderOptimized: (value: boolean) => void;
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize state from localStorage or defaults
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    const saved = localStorage.getItem('accessibility_highContrast');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [largeText, setLargeText] = useState<boolean>(() => {
    const saved = localStorage.getItem('accessibility_largeText');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [screenReaderOptimized, setScreenReaderOptimized] = useState<boolean>(() => {
    const saved = localStorage.getItem('accessibility_screenReader');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Update localStorage when settings change
  useEffect(() => {
    localStorage.setItem('accessibility_highContrast', JSON.stringify(highContrast));
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('accessibility_largeText', JSON.stringify(largeText));
    document.documentElement.classList.toggle('large-text', largeText);
  }, [largeText]);

  useEffect(() => {
    localStorage.setItem('accessibility_screenReader', JSON.stringify(screenReaderOptimized));
    document.documentElement.classList.toggle('screen-reader-optimized', screenReaderOptimized);
  }, [screenReaderOptimized]);

  // Provide context value
  const value = {
    highContrast,
    setHighContrast,
    largeText,
    setLargeText,
    screenReaderOptimized,
    setScreenReaderOptimized,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};