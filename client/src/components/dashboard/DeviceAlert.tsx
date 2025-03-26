import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DeviceAlert as DeviceAlertType } from "@shared/schema";
import { AlertCircle, Bell, X, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface DeviceAlertProps {
  alert: DeviceAlertType;
  onDismiss: (id: number) => void;
  onSchedule: (id: number) => void;
}

export default function DeviceAlert({ alert, onDismiss, onSchedule }: DeviceAlertProps) {
  return (
    <Alert className="mb-6 rounded-md bg-accent-light dark:bg-accent/10 bg-opacity-10 p-4 border-l-4 border-accent relative">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-6 w-6 text-accent dark:text-accent" />
        </div>
        <div className="ml-3 flex-1">
          <AlertTitle className="text-base font-medium text-accent dark:text-accent flex items-center justify-between">
            <span>Device Alert: {alert.alertType}</span>
            <span className="text-xs bg-accent text-white px-2 py-1 rounded-full">
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
                className="bg-accent hover:bg-accent/90 text-white dark:text-white flex items-center gap-1"
              >
                <Bell className="h-4 w-4" />
                Schedule Now
              </Button>
              
              <Link href="/alerts" className="no-underline">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-accent text-accent dark:text-accent hover:bg-accent/10 dark:hover:bg-accent/20 dark:border-accent flex items-center gap-1"
                >
                  <ArrowRight className="h-4 w-4" />
                  Go to Device Alerts
                </Button>
              </Link>
              
              <Button
                onClick={() => onDismiss(alert.id)}
                variant="destructive"
                size="sm"
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Alert>
  );
}
