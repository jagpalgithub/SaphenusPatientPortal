import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { Check, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAlerts } from "@/hooks/useAlerts";
import { DeviceAlert } from "@shared/schema";

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsDropdown({ isOpen, onClose }: NotificationsDropdownProps) {
  const { unreadAlerts, dismissAlert } = useAlerts();
  const notificationsRef = useRef<HTMLDivElement>(null);
  
  // Ensure unreadAlerts is always an array
  const alertsArray = Array.isArray(unreadAlerts) ? unreadAlerts : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleDismissAlert = async (alertId: number) => {
    await dismissAlert(alertId);
  };

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

  if (!isOpen) return null;

  return (
    <div
      ref={notificationsRef}
      className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 max-h-[500px] overflow-y-auto"
      style={{ top: "100%" }}
    >
      <div className="p-4 border-b border-neutral-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Notifications</h3>
          <Link href="/alerts">
            <Button 
              variant="link"
              size="sm" 
              className="text-xs text-primary hover:underline cursor-pointer bg-transparent border-0 h-auto p-0"
              onClick={() => onClose()}
            >
              View all
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-2">
        {alertsArray.length === 0 ? (
          <div className="py-4 px-2 text-center">
            <p className="text-sm text-neutral-500 dark:text-gray-400">No new notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alertsArray.map((alert: DeviceAlert) => (
              <Card key={alert.id} className="border-l-4 border-l-accent">
                <CardContent className="p-3">
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 p-1 rounded-full ${
                      alert.severity === 'high' ? 'bg-red-100' :
                      alert.severity === 'medium' ? 'bg-amber-100' : 'bg-blue-100'
                    }`}>
                      {getAlertIcon(alert.alertType, "h-4 w-4 text-neutral-700")}
                    </div>
                    <div className="ml-2 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-medium text-neutral-900 dark:text-white">
                          {alert.alertType.charAt(0).toUpperCase() + alert.alertType.slice(1)} Alert
                        </h4>
                        <Badge className={`text-xs ${getAlertSeverityColor(alert.severity)}`}>
                          {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-neutral-700 dark:text-gray-300">{alert.message}</p>
                      <div className="mt-1 text-xs text-neutral-500 dark:text-gray-400">
                        {format(new Date(alert.timestamp), "MMM d • h:mm a")}
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleDismissAlert(alert.id)}
                        >
                          Mark as Read
                        </Button>
                        <Link href="/alerts">
                          <Button
                            variant="default"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => onClose()}
                          >
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}