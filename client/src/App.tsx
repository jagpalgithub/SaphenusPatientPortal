import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import TimelinePage from "@/pages/TimelinePage";
import PrescriptionsPage from "@/pages/PrescriptionsPage";
import AppointmentsPage from "@/pages/AppointmentsPage";
import MessagesPage from "@/pages/MessagesPage";
import AlertsPage from "@/pages/AlertsPage";
import SettingsPage from "@/pages/SettingsPage";
import SupportPage from "@/pages/SupportPage";
// Using our new auth system without AuthProvider
import { useAuth } from "@/hooks/useAuth";
import { Suspense, useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/timeline" component={TimelinePage} />
      <Route path="/prescriptions" component={PrescriptionsPage} />
      <Route path="/appointments" component={AppointmentsPage} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/alerts" component={AlertsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/support" component={SupportPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

// A component that initializes auth state
function AuthInitializer({ children }: { children: React.ReactNode }) {
  // Just calling useAuth will initialize the auth system
  const auth = useAuth();
  
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <Layout>
          <Router />
        </Layout>
        <Toaster />
      </AuthInitializer>
    </QueryClientProvider>
  );
}

export default App;
