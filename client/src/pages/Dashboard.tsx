import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, HelpCircle } from "lucide-react";
import HealthMetricCard from "@/components/dashboard/HealthMetricCard";
import HealthProgressChart from "@/components/dashboard/HealthProgressChart";
import HealthScoresTrendChart from "@/components/dashboard/HealthScoresTrendChart";
import HealthScoresSpiderChart from "@/components/dashboard/HealthScoresSpiderChart";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import AppointmentList from "@/components/dashboard/AppointmentList";
import PrescriptionList from "@/components/dashboard/PrescriptionList";
import DeviceAlert from "@/components/dashboard/DeviceAlert";
import VirtualAssistant from "@/components/dashboard/VirtualAssistant";
import { useAuth } from "@/hooks/useAuth";
import { usePatientMetrics } from "@/hooks/usePatientMetrics";
import { useUpdates } from "@/hooks/useUpdates";
import { useAppointments } from "@/hooks/useAppointments";
import { usePrescriptions } from "@/hooks/usePrescriptions";
import { useAlerts } from "@/hooks/useAlerts";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, profile } = useAuth();
  // Use a flag to prevent immediate data loading that might slow down initial render
  const [dataLoadingPhase, setDataLoadingPhase] = useState<number>(0);
  
  // Only load essential data for the initial view
  const { latestMetrics, isLoading: isLoadingLatestMetrics } = usePatientMetrics({ 
    onlyLatest: true, // This should be implemented in the hook for optimization
    enabled: true // Always fetch latest metrics on first render
  });
  
  // Lazily load the rest in phases
  useEffect(() => {
    // Start phase 1 loading after initial render
    const phase1Timer = setTimeout(() => setDataLoadingPhase(1), 100);
    // Start phase 2 loading after another delay
    const phase2Timer = setTimeout(() => setDataLoadingPhase(2), 400);
    
    return () => {
      clearTimeout(phase1Timer);
      clearTimeout(phase2Timer);
    };
  }, []);
  
  // Phase 1: Load data needed for visible components
  const { metrics, isLoading: isLoadingMetrics } = usePatientMetrics({ 
    onlyLatest: false,
    enabled: dataLoadingPhase >= 1
  });
  const { updates, isLoading: isLoadingUpdates } = useUpdates({ enabled: dataLoadingPhase >= 1 });
  const { appointments, createAppointment, updateAppointment, deleteAppointment, isLoading: isLoadingAppointments } = 
    useAppointments({ enabled: dataLoadingPhase >= 1 });
  
  // Phase 2: Load data for components that might be below the fold
  const { prescriptions, isLoading: isLoadingPrescriptions } = usePrescriptions({ enabled: dataLoadingPhase >= 2 });
  const { alerts, dismissAlert, resolveAlert, isLoading: isLoadingAlerts } = useAlerts({ enabled: dataLoadingPhase >= 1 });
  
  const { toast } = useToast();
  const [dismissingAlerts, setDismissingAlerts] = useState<{[key: number]: boolean}>({});

  const handleNewAppointment = () => {
    // This function is kept for the AppointmentList component's prop
    console.log("Create new appointment");
    // We'll use Link components instead of programmatic navigation
  };

  const handleEditAppointment = (id: number) => {
    console.log("Edit appointment", id);
  };

  const handleDeleteAppointment = (id: number) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      deleteAppointment(id);
    }
  };

  const handleDismissAlert = (id: number) => {
    // Set this specific alert to dismissing state
    setDismissingAlerts(prev => ({ ...prev, [id]: true }));
    
    dismissAlert(id)
      .then(() => {
        toast({
          title: "Alert read",
          description: "The alert has been marked as read",
        });
        // Clear dismissing state for this alert
        setDismissingAlerts(prev => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to mark alert as read",
          variant: "destructive",
        });
        // Clear dismissing state for this alert
        setDismissingAlerts(prev => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
        });
      });
  };

  const handleScheduleFromAlert = (id: number) => {
    // Find the alert to get its details
    const alertsList = Array.isArray(alerts) ? alerts : [];
    const alert = alertsList.find((a: any) => a.id === id);
    if (!alert) return;
    
    // Navigate to appointments page with some context
    window.location.href = "/appointments?from=alert&alertId=" + id;
  };

  // Get next appointment
  const nextAppointment = appointments && Array.isArray(appointments) && appointments.length > 0
    ? appointments.sort((a: any, b: any) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0]
    : null;

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Dashboard Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-tight text-neutral-900 dark:text-white">Patient Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-gray-300">
            Welcome back, {user?.firstName}. Here's your health overview.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <Link href="/appointments">
            <Button
              variant="outline"
              className="inline-flex items-center px-3 py-2 border border-neutral-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-neutral-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-neutral-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-900"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5 text-neutral-500 dark:text-gray-300" />
              New Appointment
            </Button>
          </Link>
          <Link href="/support">
            <Button
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-900"
            >
              <HelpCircle className="-ml-1 mr-2 h-5 w-5" />
              Ask for Support
            </Button>
          </Link>
        </div>
      </div>

      {/* Alert Section */}
      {alerts && Array.isArray(alerts) && alerts.length > 0 && (
        <div className="mb-6">
          {alerts.map((alert: any) => (
            <DeviceAlert
              key={alert.id}
              alert={alert}
              onDismiss={handleDismissAlert}
              onSchedule={handleScheduleFromAlert}
              isDismissing={!!dismissingAlerts[alert.id]}
            />
          ))}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Mobility Score */}
        {latestMetrics && typeof latestMetrics === 'object' && (
          <>
            <HealthMetricCard
              title="Mobility Score"
              value="95/100"
              previousValue={67}
              icon={<svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>}
              iconBgColor="bg-primary-light"
              change={28}
              changeDirection="up"
              link="/timeline"
            />

            {/* Phantom Pain Score */}
            <HealthMetricCard
              title="Phantom Pain Rating"
              value="1/10"
              previousValue={7}
              icon={<svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>}
              iconBgColor="bg-success"
              change={85}
              changeDirection="down"
              link="/timeline"
            />

            {/* Sensor Sensitivity */}
            <HealthMetricCard
              title="Sensor Sensitivity"
              value="98%"
              previousValue={71}
              icon={<svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>}
              iconBgColor="bg-secondary"
              change={27}
              changeDirection="up"
              link="/settings"
            />
          </>
        )}

        {/* Next Appointment */}
        <HealthMetricCard
          title="Next Appointment"
          value={nextAppointment ? format(new Date(nextAppointment.dateTime), "MMM d") : "None"}
          icon={<svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>}
          iconBgColor="bg-neutral-400"
          link="/appointments"
          linkText="Manage appointments"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        {/* Health Progress Chart */}
        {metrics && Array.isArray(metrics) && metrics.length > 0 && (
          <HealthProgressChart healthMetrics={metrics} />
        )}

        {/* Latest Updates */}
        {updates && Array.isArray(updates) && updates.length > 0 && (
          <ActivityFeed updates={updates} />
        )}
      </div>
      
      {/* Enhanced Health Scores Visualization */}
      {metrics && Array.isArray(metrics) && metrics.length > 0 ? (
        <>
          {console.log("Rendering health score charts with metrics:", metrics)}
          <div className="grid grid-cols-1 gap-6 mb-6">
            <HealthScoresTrendChart healthMetrics={metrics} />
          </div>
        </>
      ) : (
        <div className="my-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
          <p className="text-blue-700 dark:text-blue-300">Health metrics data is not available.</p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            {metrics ? "Data array is empty." : "Metrics data is undefined."} 
          </p>
        </div>
      )}

      {/* Upcoming Appointments & Prescriptions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-6">
        {/* Upcoming Appointments */}
        {appointments && Array.isArray(appointments) && (
          <AppointmentList
            appointments={appointments}
            onNewAppointment={handleNewAppointment}
            onEditAppointment={handleEditAppointment}
            onDeleteAppointment={handleDeleteAppointment}
          />
        )}

        {/* Active Prescriptions */}
        {prescriptions && Array.isArray(prescriptions) && (
          <PrescriptionList prescriptions={prescriptions} />
        )}
      </div>

      {/* AI Assistant & Support */}
      <VirtualAssistant />
    </div>
  );
}
