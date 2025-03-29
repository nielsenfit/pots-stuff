import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import History from "@/pages/History";
import Insights from "@/pages/Insights";
import Settings from "@/pages/Settings";
import Medications from "@/pages/Medications";
import SaltTracker from "@/pages/SaltTracker";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AccessibilityProvider } from "@/hooks/useAccessibility";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/history" component={History} />
      <Route path="/insights" component={Insights} />
      <Route path="/medications" component={Medications} />
      <Route path="/salt-tracker" component={SaltTracker} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Set default dark mode if not already set
  useEffect(() => {
    if (localStorage.getItem("theme") === null) {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      <AccessibilityProvider>
        <QueryClientProvider client={queryClient}>
          <div 
            className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200" 
            role="application"
            aria-label="PoTs Symptom Tracker application"
          >
            <a 
              href="#main-content" 
              className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-white"
            >
              Skip to main content
            </a>
            <Router />
            <Toaster />
          </div>
        </QueryClientProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}

export default App;
