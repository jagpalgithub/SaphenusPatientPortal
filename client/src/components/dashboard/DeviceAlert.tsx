import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeviceAlert as DeviceAlertType } from "@shared/schema";
import { AlertCircle, Bell, CheckCircle, Eye, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface DeviceAlertProps {
  alert: DeviceAlertType;
  onDismiss: (id: number) => void;
  onSchedule: (id: number) => void;
  isDismissing?: boolean;
}

export default function DeviceAlert({ alert, onDismiss, onSchedule, isDismissing = false }: DeviceAlertProps) {
  return (
    <Alert className="mb-6 rounded-md bg-blue-50 dark:bg-blue-900/20 p-4 border-l-4 border-primary relative">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-6 w-6 text-primary dark:text-primary" />
        </div>
        <div className="ml-3 flex-1">
          <AlertTitle className="text-base font-medium text-primary dark:text-primary flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Device Alert: {alert.alertType}</span>
              {alert.isRead && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 ml-2">
                  <CheckCircle className="h-3 w-3" />
                  <span>Read</span>
                </Badge>
              )}
              {!alert.isRead && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 ml-2">
                  <span>Pending</span>
                </Badge>
              )}
            </div>
            <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
              {alert.severity}
            </span>
          </AlertTitle>
          <AlertDescription className="mt-2 text-sm text-neutral-700 dark:text-gray-300">
            <p>{alert.message}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {new Date(alert.timestamp).toLocaleString()}
            </p>
          </AlertDescription>
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => onSchedule(alert.id)}
                variant="default"
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white flex items-center gap-1"
              >
                <Bell className="h-4 w-4" />
                Schedule Now
              </Button>
              
              <Link href="/alerts" className="no-underline">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary text-primary hover:bg-primary/10 dark:hover:bg-primary/20 dark:border-primary flex items-center gap-1"
                >
                  <ArrowRight className="h-4 w-4" />
                  Go to Device Alerts
                </Button>
              </Link>
              
              <Button
                onClick={() => onDismiss(alert.id)}
                variant={alert.isRead ? "outline" : "secondary"}
                size="sm"
                disabled={alert.isRead || isDismissing}
                className="flex items-center gap-1"
              >
                {isDismissing ? (
                  <span className="flex items-center gap-1">
                    <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    {alert.isRead ? "Already Read" : "Mark as Read"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Alert>
  );
}
