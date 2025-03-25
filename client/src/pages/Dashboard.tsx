import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, HelpCircle } from "lucide-react";
import HealthMetricCard from "@/components/dashboard/HealthMetricCard";
import HealthProgressChart from "@/components/dashboard/HealthProgressChart";
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
import { format } from "date-fns";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { metrics, latestMetrics, isLoading: isLoadingMetrics } = usePatientMetrics();
  const { updates, isLoading: isLoadingUpdates } = useUpdates();
  const { appointments, createAppointment, updateAppointment, deleteAppointment, isLoading: isLoadingAppointments } = useAppointments();
  const { prescriptions, isLoading: isLoadingPrescriptions } = usePrescriptions();
  const { alerts, dismissAlert, resolveAlert, isLoading: isLoadingAlerts } = useAlerts();

  const handleNewAppointment = () => {
    // This would typically open a modal or navigate to an appointment creation page
    console.log("Create new appointment");
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
    dismissAlert(id);
  };

  const handleScheduleFromAlert = (id: number) => {
    // This would typically open the appointment scheduling with pre-filled data
    console.log("Schedule from alert", id);
    handleNewAppointment();
  };

  // Get next appointment
  const nextAppointment = appointments && appointments.length > 0
    ? appointments.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0]
    : null;

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Dashboard Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-tight text-neutral-900">Patient Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Welcome back, {user?.firstName}. Here's your health overview.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <Button
            variant="outline"
            onClick={handleNewAppointment}
            className="inline-flex items-center px-3 py-2 border border-neutral-300 shadow-sm text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5 text-neutral-500" />
            New Appointment
          </Button>
          <Button
            onClick={() => window.location.href = "/support"}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <HelpCircle className="-ml-1 mr-2 h-5 w-5" />
            Ask for Support
          </Button>
        </div>
      </div>

      {/* Alert Section */}
      {alerts && alerts.length > 0 && (
        <div className="mb-6">
          {alerts.map((alert) => (
            <DeviceAlert
              key={alert.id}
              alert={alert}
              onDismiss={handleDismissAlert}
              onSchedule={handleScheduleFromAlert}
            />
          ))}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Mobility Score */}
        {latestMetrics && (
          <>
            <HealthMetricCard
              title="Mobility Score"
              value={`${latestMetrics.mobilityScore}/100`}
              previousValue={metrics && metrics.length > 1 ? metrics[metrics.length - 2].mobilityScore : undefined}
              icon={<svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>}
              iconBgColor="bg-primary-light"
              change={8}
              changeDirection="up"
              link="/timeline"
            />

            {/* Phantom Pain Score */}
            <HealthMetricCard
              title="Phantom Pain Rating"
              value={`${latestMetrics.phantomPainScore}/10`}
              previousValue={metrics && metrics.length > 1 ? metrics[metrics.length - 2].phantomPainScore : undefined}
              icon={<svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>}
              iconBgColor="bg-success"
              change={50}
              changeDirection="down"
              link="/timeline"
            />

            {/* Sensor Sensitivity */}
            <HealthMetricCard
              title="Sensor Sensitivity"
              value={`${latestMetrics.sensorSensitivity}%`}
              previousValue={metrics && metrics.length > 1 ? metrics[metrics.length - 2].sensorSensitivity : undefined}
              icon={<svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>}
              iconBgColor="bg-secondary"
              change={0}
              changeDirection="neutral"
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Health Progress Chart */}
        {metrics && metrics.length > 0 && (
          <HealthProgressChart healthMetrics={metrics} />
        )}

        {/* Latest Updates */}
        {updates && updates.length > 0 && (
          <ActivityFeed updates={updates} />
        )}
      </div>

      {/* Upcoming Appointments & Prescriptions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-6">
        {/* Upcoming Appointments */}
        {appointments && (
          <AppointmentList
            appointments={appointments}
            onNewAppointment={handleNewAppointment}
            onEditAppointment={handleEditAppointment}
            onDeleteAppointment={handleDeleteAppointment}
          />
        )}

        {/* Active Prescriptions */}
        {prescriptions && (
          <PrescriptionList prescriptions={prescriptions} />
        )}
      </div>

      {/* AI Assistant & Support */}
      <VirtualAssistant />
    </div>
  );
}
