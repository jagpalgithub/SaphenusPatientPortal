import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useAlerts } from "@/hooks/useAlerts";
import { format } from "date-fns";
import { AlertTriangle, Info, Check, AlertCircle, Calendar } from "lucide-react";
import { useAppointments } from "@/hooks/useAppointments";
import { useToast } from "@/hooks/use-toast";

export default function AlertsPage() {
  const { user, profile } = useAuth();
  const { alerts, dismissAlert, resolveAlert, isLoading } = useAlerts();
  const { appointments, createAppointment } = useAppointments();
  const [activeTab, setActiveTab] = useState("all");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const { toast } = useToast();

  // Filter alerts based on active tab
  const filteredAlerts = alerts
    ? activeTab === "all"
      ? alerts
      : activeTab === "unread"
      ? alerts.filter(alert => !alert.isRead)
      : activeTab === "resolved"
      ? alerts.filter(alert => alert.isResolved)
      : alerts.filter(alert => !alert.isResolved)
    : [];

  // Get appropriate icon for alert type
  const getAlertIcon = (alertType: string, className: string = "h-5 w-5") => {
    switch (alertType) {
      case "calibration":
        return <Info className={className} />;
      case "maintenance":
        return <AlertTriangle className={className} />;
      case "error":
        return <AlertCircle className={className} />;
      default:
        return <Info className={className} />;
    }
  };

  // Get background color for alert severity
  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  // Handle dismissing an alert
  const handleDismissAlert = (alertId: number) => {
    dismissAlert(alertId).then(() => {
      toast({
        title: "Alert dismissed",
        description: "The alert has been marked as read",
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to dismiss alert",
        variant: "destructive",
      });
    });
  };

  // Handle resolving an alert
  const handleResolveAlert = () => {
    if (!selectedAlert) return;
    
    resolveAlert(selectedAlert.id, resolutionNotes).then(() => {
      setIsResolveDialogOpen(false);
      setSelectedAlert(null);
      setResolutionNotes("");
      toast({
        title: "Alert resolved",
        description: "The alert has been marked as resolved",
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      });
    });
  };

  // Open schedule dialog
  const openScheduleDialog = (alert: any) => {
    setSelectedAlert(alert);
    setIsScheduleDialogOpen(true);
  };

  // Handle scheduling appointment from alert
  const handleScheduleFromAlert = () => {
    // This would typically integrate with the appointment scheduling functionality
    // For now, we'll just mark the alert as resolved
    if (!selectedAlert) return;
    
    const notes = `Scheduled appointment for ${selectedAlert.alertType}`;
    resolveAlert(selectedAlert.id, notes).then(() => {
      setIsScheduleDialogOpen(false);
      setSelectedAlert(null);
      // Navigate to appointments page
      window.location.href = "/appointments";
      
      toast({
        title: "Appointment scheduled",
        description: "Please complete the appointment details",
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to schedule appointment",
        variant: "destructive",
      });
    });
  };

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold leading-tight text-neutral-900">Device Alerts</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Monitor and respond to alerts from your Suralis system
        </p>
      </div>
      
      {/* Alerts Tab */}
      <Card>
        <CardHeader>
          <CardTitle>Device Alerts</CardTitle>
          <CardDescription>Notifications and alerts from your prosthetic device</CardDescription>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-6">
              <p>Loading alerts...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center p-6 bg-neutral-50 rounded-md">
              <AlertCircle className="mx-auto h-12 w-12 text-neutral-400" />
              <h3 className="mt-2 text-sm font-medium text-neutral-900">No Alerts</h3>
              <p className="mt-1 text-sm text-neutral-500">
                {activeTab === "all"
                  ? "You don't have any device alerts."
                  : activeTab === "unread"
                  ? "You don't have any unread alerts."
                  : activeTab === "resolved"
                  ? "You don't have any resolved alerts."
                  : "You don't have any active alerts."}
              </p>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {filteredAlerts.map((alert) => (
                <Card key={alert.id} className={`border-l-4 ${alert.isRead ? 'border-l-neutral-300' : 'border-l-accent'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 p-2 rounded-full ${
                        alert.severity === 'high' ? 'bg-red-100' :
                        alert.severity === 'medium' ? 'bg-amber-100' : 'bg-blue-100'
                      }`}>
                        {getAlertIcon(alert.alertType, "h-5 w-5 text-neutral-700")}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-neutral-900">
                            {alert.alertType.charAt(0).toUpperCase() + alert.alertType.slice(1)} Alert
                          </h3>
                          <Badge className={getAlertSeverityColor(alert.severity)}>
                            {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-neutral-700">{alert.message}</p>
                        <div className="mt-2 text-xs text-neutral-500">
                          {format(new Date(alert.timestamp), "MMMM d, yyyy • h:mm a")}
                        </div>
                        
                        {alert.isResolved ? (
                          <div className="mt-2 p-2 bg-green-50 rounded-md">
                            <div className="flex">
                              <Check className="h-4 w-4 text-green-500" />
                              <p className="ml-2 text-xs text-green-700">Resolved</p>
                            </div>
                            {alert.resolutionNotes && (
                              <p className="mt-1 text-xs text-neutral-700">{alert.resolutionNotes}</p>
                            )}
                          </div>
                        ) : (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDismissAlert(alert.id)}
                              disabled={alert.isRead}
                            >
                              {alert.isRead ? "Dismissed" : "Dismiss"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAlert(alert);
                                setIsResolveDialogOpen(true);
                              }}
                            >
                              Resolve
                            </Button>
                            {alert.alertType === "calibration" && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => openScheduleDialog(alert)}
                              >
                                <Calendar className="mr-1 h-4 w-4" />
                                Schedule Appointment
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Resolve Alert Dialog */}
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Alert</DialogTitle>
            <DialogDescription>
              Add notes about how this alert was resolved
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Alert Message:</h4>
              <p className="text-sm">{selectedAlert?.message}</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="resolution-notes" className="text-sm font-medium">
                Resolution Notes:
              </label>
              <Textarea
                id="resolution-notes"
                placeholder="Describe how the issue was resolved"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolveAlert}>
              Mark as Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Schedule Appointment Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
            <DialogDescription>
              Schedule an appointment to address this alert
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Alert Message:</h4>
              <p className="text-sm">{selectedAlert?.message}</p>
            </div>
            
            <p className="text-sm">
              You will be redirected to the appointments page to schedule a new appointment.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleFromAlert}>
              Continue to Scheduling
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
