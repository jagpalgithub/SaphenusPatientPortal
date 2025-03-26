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
// Fixed to ensure hooks are called consistently in all code paths
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, path?: string }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, navigate] = useLocation();
  
  // Use a single effect for redirection and data fetching
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      navigate('/login');
    } else if (!isLoading && isAuthenticated && user) {
      // Make sure we have the necessary data preloaded
      // This ensures we get all the data needed for the dashboard
      if (user.role === 'patient') {
        // Extract the user ID - in localStorage auth it might be stored as userId
        // In normal auth flow it will be user.id
        const patientId = (user as any).userId || user.id || 1; // Use default if not set
        
        // Prefetch key data
        queryClient.prefetchQuery({ queryKey: [`/api/health-metrics/patient/${patientId}`] });
        queryClient.prefetchQuery({ queryKey: [`/api/health-metrics/patient/${patientId}/latest`] });
        queryClient.prefetchQuery({ queryKey: [`/api/appointments/patient/${patientId}`] });
        queryClient.prefetchQuery({ queryKey: [`/api/prescriptions/patient/${patientId}/active`] });
        queryClient.prefetchQuery({ queryKey: [`/api/device-alerts/patient/${patientId}/unread`] });
        queryClient.prefetchQuery({ queryKey: [`/api/updates/patient/${patientId}`] });
        queryClient.prefetchQuery({ queryKey: [`/api/messages/user/${patientId}`] });
        queryClient.prefetchQuery({ queryKey: ['/api/doctors'] });
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }
  
  // If not authenticated, show redirecting message
  if (!isAuthenticated || !user) {
    return <div className="flex min-h-screen items-center justify-center">Redirecting to login...</div>;
  }
  
  // If authenticated, render the component
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

// We're removing this component as it's causing hook ordering issues
// Instead we'll initialize auth directly in App

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent />
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
