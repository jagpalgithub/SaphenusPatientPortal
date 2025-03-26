import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import LoginPage from "@/pages/LoginPage";
import TimelinePage from "@/pages/TimelinePage";
import PrescriptionsPage from "@/pages/PrescriptionsPage";
import AppointmentsPage from "@/pages/AppointmentsPage";
import MessagesPage from "@/pages/MessagesPage";
import AlertsPage from "@/pages/AlertsPage";
import SettingsPage from "@/pages/SettingsPage";
import SupportPage from "@/pages/SupportPage";
// Using our new auth system without AuthProvider
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

// Protected route component
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, path?: string }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/timeline">
        {() => <ProtectedRoute component={TimelinePage} />}
      </Route>
      <Route path="/prescriptions">
        {() => <ProtectedRoute component={PrescriptionsPage} />}
      </Route>
      <Route path="/appointments">
        {() => <ProtectedRoute component={AppointmentsPage} />}
      </Route>
      <Route path="/messages">
        {() => <ProtectedRoute component={MessagesPage} />}
      </Route>
      <Route path="/alerts">
        {() => <ProtectedRoute component={AlertsPage} />}
      </Route>
      <Route path="/settings">
        {() => <ProtectedRoute component={SettingsPage} />}
      </Route>
      <Route path="/support">
        {() => <ProtectedRoute component={SupportPage} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

// A component that initializes auth state
function AuthInitializer({ children }: { children: React.ReactNode }) {
  // Just calling useAuth will initialize the auth system
  const { isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();
  
  // This effect ensures we redirect to login page when not authenticated
  useEffect(() => {
    if (location !== '/login' && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, location]);
  
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthInitializer>
          <AppContent />
        </AuthInitializer>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  
  // If we're at the login page, don't wrap in Layout
  if (location === '/login') {
    return (
      <>
        <Router />
        <Toaster />
      </>
    );
  }
  
  // For authenticated routes, wrap in Layout
  if (isAuthenticated) {
    return (
      <>
        <Layout>
          <Router />
        </Layout>
        <Toaster />
      </>
    );
  }
  
  // Default case - just render the router (which will redirect to login)
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
