import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { useState, useEffect } from "react";
import { GuideProvider } from "./services/GuideContext";
import { initializeAdService, refreshAds } from "./services/adService";

function Router() {
  const [location] = useLocation();
  
  // Initialize ad service when component mounts
  useEffect(() => {
    console.log('Initializing ad service');
    initializeAdService();
  }, []);
  
  // Refresh ads when location changes
  useEffect(() => {
    console.log('Route changed, refreshing ads');
    // Small delay to ensure DOM has updated before refreshing ads
    const timer = setTimeout(() => {
      refreshAds();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [location]);
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/guide/:slug" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GuideProvider>
        <Router />
        <Toaster />
      </GuideProvider>
    </QueryClientProvider>
  );
}

export default App;
