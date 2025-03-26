import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { usePatientMetrics } from "@/hooks/usePatientMetrics";
import { useUpdates } from "@/hooks/useUpdates";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Clock, User, FileText, Activity, Check } from "lucide-react";
import { useAlerts } from "@/hooks/useAlerts";
import { useAppointments } from "@/hooks/useAppointments";
import { usePrescriptions } from "@/hooks/usePrescriptions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PatientInfo from "@/components/common/PatientInfo";

// Timeline item interface
interface TimelineItem {
  id: number;
  date: Date;
  type: string;
  title: string;
  description: string;
  source?: string;
  sourceImage?: string;
  icon?: JSX.Element;
}

export default function TimelinePage() {
  const { user, profile } = useAuth();
  const { metrics, isLoading: isLoadingMetrics } = usePatientMetrics();
  const { updates, isLoading: isLoadingUpdates } = useUpdates();
  const { appointments, isLoading: isLoadingAppointments } = useAppointments();
  const { prescriptions, isLoading: isLoadingPrescriptions } = usePrescriptions();
  const { alerts, isLoading: isLoadingAlerts } = useAlerts();
  const [timelineFilter, setTimelineFilter] = useState<string>("all");

  // Combine all data into a single timeline
  const createTimelineItems = (): TimelineItem[] => {
    const items: TimelineItem[] = [];

    // Add metrics
    if (metrics) {
      metrics.forEach((metric) => {
        items.push({
          id: metric.id,
          date: new Date(metric.recordDate),
          type: "metric",
          title: "Health Metrics Updated",
          description: `Mobility Score: ${metric.mobilityScore}/100, Phantom Pain: ${metric.phantomPainScore}/10`,
          icon: <Activity className="h-5 w-5 text-white" />,
        });
      });
    }

    // Add updates
    if (updates) {
      updates.forEach((update) => {
        items.push({
          id: update.id,
          date: new Date(update.timestamp),
          type: update.type,
          title: update.sourceName,
          description: update.content,
          source: update.sourceName,
          sourceImage: update.sourceImage,
          icon: update.type === "doctor_feedback" 
            ? <User className="h-5 w-5 text-white" />
            : update.type === "prescription_update"
            ? <FileText className="h-5 w-5 text-white" />
            : <Check className="h-5 w-5 text-white" />,
        });
      });
    }

    // Add appointments
    if (appointments) {
      appointments.forEach((appointment) => {
        items.push({
          id: appointment.id,
          date: new Date(appointment.dateTime),
          type: "appointment",
          title: `Appointment with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
          description: appointment.purpose,
          icon: <Clock className="h-5 w-5 text-white" />,
        });
      });
    }
    
    // Add prescriptions
    if (prescriptions) {
      prescriptions.forEach((prescription) => {
        items.push({
          id: prescription.id,
          date: new Date(prescription.startDate),
          type: "prescription_update",
          title: `Prescription: ${prescription.medicationName}`,
          description: `${prescription.dosage} - ${prescription.frequency}${prescription.notes ? `. ${prescription.notes}` : ''}`,
          source: `Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName}`,
          icon: <FileText className="h-5 w-5 text-white" />,
        });
      });
    }

    // Add alerts
    if (alerts) {
      alerts.forEach((alert) => {
        items.push({
          id: alert.id,
          date: new Date(alert.timestamp),
          type: "alert",
          title: `Device Alert: ${alert.alertType}`,
          description: alert.message,
          icon: <Activity className="h-5 w-5 text-white" />,
        });
      });
    }

    // Sort by date (newest first)
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  // Filter timeline items based on selected filter
  const filterTimelineItems = (items: TimelineItem[]) => {
    if (timelineFilter === "all") return items;
    return items.filter((item) => item.type === timelineFilter);
  };

  const timelineItems = createTimelineItems();
  const filteredTimelineItems = filterTimelineItems(timelineItems);

  // Loading state
  const isLoading = isLoadingMetrics || isLoadingUpdates || isLoadingAppointments || isLoadingPrescriptions || isLoadingAlerts;

  // Function to get appropriate background color for timeline item icon
  const getIconBgColor = (type: string) => {
    switch (type) {
      case "doctor_feedback":
        return "bg-primary";
      case "prescription_update":
        return "bg-secondary";
      case "system_calibration":
        return "bg-primary-light";
      case "appointment":
        return "bg-primary-light";
      case "alert":
        return "bg-accent";
      case "metric":
        return "bg-success";
      default:
        return "bg-neutral-400";
    }
  };

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold leading-tight text-neutral-900">Treatment Timeline</h1>
        <p className="mt-1 text-sm text-neutral-500">
          View your complete treatment history and health progress.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          {/* Timeline Filters */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Treatment Timeline</CardTitle>
              <CardDescription>
                Filter your timeline by event type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="all"
                value={timelineFilter}
                onValueChange={setTimelineFilter}
                className="w-full"
              >
                <TabsList className="grid grid-cols-4 lg:grid-cols-6">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="doctor_feedback">Feedback</TabsTrigger>
                  <TabsTrigger value="prescription_update">Prescriptions</TabsTrigger>
                  <TabsTrigger value="appointment">Appointments</TabsTrigger>
                  <TabsTrigger value="alert">Alerts</TabsTrigger>
                  <TabsTrigger value="metric">Metrics</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Timeline */}
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex justify-center p-6">
                  <p>Loading timeline...</p>
                </div>
              ) : filteredTimelineItems.length === 0 ? (
                <div className="flex justify-center p-6">
                  <p>No timeline events found.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-neutral-200"></div>
                  
                  {/* Timeline events */}
                  <ul className="space-y-6">
                    {filteredTimelineItems.map((item) => (
                      <li key={`${item.type}-${item.id}`} className="relative pl-10">
                        {/* Timeline Icon */}
                        <div className={`absolute left-0 p-2 rounded-full ${getIconBgColor(item.type)} z-10`}>
                          {item.icon}
                        </div>
                        
                        {/* Timeline Content */}
                        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-neutral-900">{item.title}</h3>
                            <span className="text-xs text-neutral-500">
                              {format(item.date, "MMM d, yyyy • h:mm a")}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-neutral-700">{item.description}</p>
                          
                          {/* If it's a doctor feedback, show the doctor's avatar */}
                          {item.type === "doctor_feedback" && (
                            <div className="mt-2 flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src={item.sourceImage || undefined} alt={item.source} />
                                <AvatarFallback>{item.source?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-neutral-500">{item.source}</span>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Patient Info Card */}
        <div>
          {profile && user && (
            <PatientInfo patient={profile} userName={`${user.firstName} ${user.lastName}`} />
          )}
        </div>
      </div>
    </div>
  );
}
