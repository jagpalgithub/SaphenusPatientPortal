import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { metricsApi } from "@/lib/api";
import { useAuth } from "./useAuth";
import { HealthMetric } from "@shared/schema";
import { useToast } from "./use-toast";

export function usePatientMetrics() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all patient health metrics
  const { 
    data: metrics,
    isLoading: isLoadingMetrics,
    error: metricsError
  } = useQuery({
    queryKey: [`/api/health-metrics/patient/${profile?.id}`, profile?.id],
    enabled: !!profile?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => {
      console.log('Received health metrics data:', data);
      return data;
    }
  });

  // Get latest health metrics
  const { 
    data: latestMetrics,
    isLoading: isLoadingLatest,
    error: latestError
  } = useQuery({
    queryKey: [`/api/health-metrics/patient/${profile?.id}/latest`, profile?.id],
    enabled: !!profile?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
