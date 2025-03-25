import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DeviceAlert as DeviceAlertType } from "@shared/schema";
import { AlertCircle } from "lucide-react";

interface DeviceAlertProps {
  alert: DeviceAlertType;
  onDismiss: (id: number) => void;
  onSchedule: (id: number) => void;
}

export default function DeviceAlert({ alert, onDismiss, onSchedule }: DeviceAlertProps) {
  return (
    <Alert className="mb-6 rounded-md bg-accent-light bg-opacity-10 p-4 border-l-4 border-accent">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-accent" />
        </div>
        <div className="ml-3">
          <AlertTitle className="text-sm font-medium text-accent">
            Device Alert
          </AlertTitle>
          <AlertDescription className="mt-2 text-sm text-neutral-700">
            <p>{alert.message}</p>
          </AlertDescription>
          <div className="mt-3">
            <div className="flex space-x-2">
              <Button
                onClick={() => onSchedule(alert.id)}
                variant="ghost"
                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-accent hover:bg-accent hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
              >
                Schedule Now
              </Button>
              <Button
                onClick={() => onDismiss(alert.id)}
                variant="ghost"
                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-neutral-700 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Alert>
  );
}
