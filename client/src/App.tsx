import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Login from "@/pages/login";
import { useSpotify } from "@/hooks/use-spotify";
import { useTheme } from "@/hooks/use-theme";
import { useEffect } from "react";

function AppContent() {
  const { user, isLoading } = useSpotify();
  const { theme } = useTheme();

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-red">
            <i className="fas fa-music text-white text-2xl"></i>
          </div>
          <p className="text-gray-secondary">Loading RedTunes...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={user ? Home : Login} />
      <Route path="/login" component={Login} />
      <Route component={() => <div>404 - Page not found</div>} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
