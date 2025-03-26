import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { metricsApi } from "@/lib/api";
import { useAuth } from "./useAuth";
import { HealthMetric } from "@shared/schema";
import { useToast } from "./use-toast";

interface PatientMetricsOptions {
  onlyLatest?: boolean;
  enabled?: boolean;
}

export function usePatientMetrics(options: PatientMetricsOptions = {}) {
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get the patient ID (from profile, user or default for Anna)
  const patientId = profile?.id || (user ? (user as any).userId || user.id : null) || 1;
  
  // Determine if we should fetch all metrics or just latest
  const fetchAllMetrics = options.onlyLatest !== true;
  const isEnabled = options.enabled !== false;
  
  // First priority - Get latest health metrics if we need it
  const { 
    data: latestMetrics,
    isLoading: isLoadingLatest,
    error: latestError
  } = useQuery({
    queryKey: [`/api/health-metrics/patient/${patientId}/latest`, patientId],
    enabled: !!patientId && isEnabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Use a higher priority for latest metrics
    meta: { priority: 3 }
  });

  // Second priority - Get all patient health metrics (not needed immediately)
  const { 
    data: metrics,
    isLoading: isLoadingMetrics,
    error: metricsError
  } = useQuery({
    queryKey: [`/api/health-metrics/patient/${patientId}`, patientId],
    enabled: !!patientId && isEnabled && fetchAllMetrics,
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Use a lower priority for all metrics since they're only needed for charts
    meta: { priority: 1 },
    select: (data) => {
      console.log('Received health metrics data:', data);
      return data;
    }
  });

  // Create health metric mutation
  const createMutation = useMutation({
    mutationFn: (metric: any) => 
      metricsApi.createHealthMetric(metric),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/health-metrics/patient/${profile?.id}`, profile?.id] });
      queryClient.invalidateQueries({ queryKey: [`/api/health-metrics/patient/${profile?.id}/latest`, profile?.id] });
      toast({
        title: "Health metrics recorded",
        description: "Your health metrics have been successfully recorded",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record health metrics",
        variant: "destructive",
      });
    }
  });

  // Update health metric mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<HealthMetric> }) => 
      metricsApi.updateHealthMetric(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/health-metrics/patient/${profile?.id}`, profile?.id] });
      queryClient.invalidateQueries({ queryKey: [`/api/health-metrics/patient/${profile?.id}/latest`, profile?.id] });
      toast({
        title: "Health metrics updated",
        description: "Your health metrics have been successfully updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update health metrics",
        variant: "destructive",
      });
    }
  });

  // Create a new health metric entry
  const createMetrics = async (metric: any) => {
    return createMutation.mutateAsync(metric);
  };

  // Update an existing health metric
  const updateMetrics = async (id: number, data: Partial<HealthMetric>) => {
    return updateMutation.mutateAsync({ id, data });
  };

  return {
    metrics,
    latestMetrics,
    isLoading: isLoadingMetrics || isLoadingLatest,
    error: metricsError || latestError,
    createMetrics,
    updateMetrics,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
