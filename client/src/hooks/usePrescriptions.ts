import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { prescriptionsApi } from "@/lib/api";
import { useAuth } from "./useAuth";
import { Prescription, InsertPrescription } from "@shared/schema";
import { useToast } from "./use-toast";

interface PrescriptionsOptions {
  enabled?: boolean;
}

export function usePrescriptions(options: PrescriptionsOptions = {}) {
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get the patient ID (from profile, user or default for Anna)
  const patientId = profile?.id || (user ? (user as any).userId || user.id : null) || 1;
  const isEnabled = options.enabled !== false;

  // Get all patient prescriptions - lower priority
  const { 
    data: allPrescriptions,
    isLoading: isLoadingAll,
    error: allError
  } = useQuery({
    queryKey: [`/api/prescriptions/patient/${patientId}`, patientId],
    enabled: !!patientId && isEnabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: { priority: 1 } // Lower priority - not critical for dashboard
  });

  // Get active patient prescriptions - higher priority for dashboard
  const { 
    data: activePrescriptions,
    isLoading: isLoadingActive,
    error: activeError
  } = useQuery({
    queryKey: [`/api/prescriptions/patient/${patientId}/active`, patientId],
    enabled: !!patientId && isEnabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: { priority: 2 } // Medium priority - needed for sidebar counts
  });

  // Create prescription mutation (doctor only)
  const createMutation = useMutation({
    mutationFn: (prescription: InsertPrescription) => 
      prescriptionsApi.createPrescription(prescription),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/prescriptions/patient/${profile?.id}`, profile?.id] });
      queryClient.invalidateQueries({ queryKey: [`/api/prescriptions/patient/${profile?.id}/active`, profile?.id] });
      toast({
        title: "Prescription created",
        description: "The prescription has been successfully created",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create prescription",
        variant: "destructive",
      });
    }
  });

  // Update prescription mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Prescription> }) => 
      prescriptionsApi.updatePrescription(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/prescriptions/patient/${profile?.id}`, profile?.id] });
      queryClient.invalidateQueries({ queryKey: [`/api/prescriptions/patient/${profile?.id}/active`, profile?.id] });
      toast({
        title: "Prescription updated",
        description: "The prescription has been successfully updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update prescription",
        variant: "destructive",
      });
    }
  });

  // Create a new prescription
  const createPrescription = async (prescription: InsertPrescription) => {
    return createMutation.mutateAsync(prescription);
  };

  // Update an existing prescription
  const updatePrescription = async (id: number, data: Partial<Prescription>) => {
    return updateMutation.mutateAsync({ id, data });
  };

  // Refill prescription mutation
  const refillMutation = useMutation({
    mutationFn: (prescriptionId: number) => 
      prescriptionsApi.requestRefill(prescriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/prescriptions/patient/${profile?.id}`, profile?.id] });
      queryClient.invalidateQueries({ queryKey: [`/api/prescriptions/patient/${profile?.id}/active`, profile?.id] });
      toast({
        title: "Refill requested",
        description: "Your prescription refill request has been submitted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to request prescription refill",
        variant: "destructive",
      });
    }
  });

  // Request a prescription refill
  const requestRefill = async (prescriptionId: number) => {
    return refillMutation.mutateAsync(prescriptionId);
  };

  return {
    prescriptions: allPrescriptions,
    activePrescriptions,
    isLoading: isLoadingAll || isLoadingActive,
    error: allError || activeError,
    createPrescription,
    updatePrescription,
    requestRefill,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRequestingRefill: refillMutation.isPending,
  };
}
