import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { useState } from "react";
import { GuideProvider } from "./services/GuideContext";

function Router() {
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
