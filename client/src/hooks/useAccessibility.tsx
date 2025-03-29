import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

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
  const [highContrast, setHighContrast] = useLocalStorage('accessibility-high-contrast', false);
  const [largeText, setLargeText] = useLocalStorage('accessibility-large-text', false);
  const [screenReaderOptimized, setScreenReaderOptimized] = useLocalStorage('accessibility-screen-reader', false);

  // Apply classes to the document.documentElement (html) element
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    if (highContrast) {
      htmlElement.classList.add('high-contrast');
    } else {
      htmlElement.classList.remove('high-contrast');
    }
    
    if (largeText) {
      htmlElement.classList.add('large-text');
    } else {
      htmlElement.classList.remove('large-text');
    }
    
    if (screenReaderOptimized) {
      htmlElement.classList.add('screen-reader-optimized');
    } else {
      htmlElement.classList.remove('screen-reader-optimized');
    }
  }, [highContrast, largeText, screenReaderOptimized]);

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        setHighContrast,
        largeText,
        setLargeText,
        screenReaderOptimized,
        setScreenReaderOptimized,
      }}
    >
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