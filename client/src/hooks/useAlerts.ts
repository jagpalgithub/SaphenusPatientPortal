import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertsApi } from "@/lib/api";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface AlertsOptions {
  enabled?: boolean;
}

export function useAlerts(options: AlertsOptions = {}) {
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get the patient ID (from profile, user or default for Anna)
  const patientId = profile?.id || (user ? (user as any).userId || user.id : null) || 1;
  const isEnabled = options.enabled !== false;

  // Get all patient device alerts
  const { 
    data: alerts,
    isLoading,
    error
  } = useQuery({
    queryKey: [`/api/device-alerts/patient/${patientId}`, patientId],
    enabled: !!patientId && isEnabled,
    staleTime: 1000 * 60 * 1, // 1 minute - alerts are important
    meta: { priority: 2 } // Medium priority data
  });

  // Get unread patient device alerts - higher priority
  const { 
    data: unreadAlerts,
    isLoading: isLoadingUnread,
    error: unreadError
  } = useQuery({
    queryKey: [`/api/device-alerts/patient/${patientId}/unread`, patientId],
    enabled: !!patientId && isEnabled,
    staleTime: 1000 * 60 * 1, // 1 minute
    meta: { priority: 3 } // High priority data for notifications
  });

  // Mark device alert as read mutation
  const dismissMutation = useMutation({
    mutationFn: (alertId: number) => 
      alertsApi.markDeviceAlertAsRead(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/device-alerts/patient/${profile?.id}`, profile?.id] });
      queryClient.invalidateQueries({ queryKey: [`/api/device-alerts/patient/${profile?.id}/unread`, profile?.id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark alert as read",
        variant: "destructive",
      });
    }
  });

  // Resolve device alert mutation
  const resolveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) => 
      alertsApi.resolveDeviceAlert(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/device-alerts/patient/${profile?.id}`, profile?.id] });
      queryClient.invalidateQueries({ queryKey: [`/api/device-alerts/patient/${profile?.id}/unread`, profile?.id] });
      toast({
        title: "Alert resolved",
        description: "The device alert has been resolved",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      });
    }
  });

  // Mark an alert as read
  const dismissAlert = async (alertId: number) => {
    return dismissMutation.mutateAsync(alertId);
  };

  // Resolve an alert with notes
  const resolveAlert = async (alertId: number, notes: string) => {
    return resolveMutation.mutateAsync({ id: alertId, notes });
  };

  return {
    alerts,
    unreadAlerts,
    isLoading: isLoading || isLoadingUnread,
    error: error || unreadError,
    dismissAlert,
    resolveAlert,
    isDismissing: dismissMutation.isPending,
    isResolving: resolveMutation.isPending,
  };
}
