import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { prescriptionsApi } from "@/lib/api";
import { useAuth } from "./useAuth";
import { Prescription, InsertPrescription } from "@shared/schema";
import { useToast } from "./use-toast";

export function usePrescriptions() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all patient prescriptions
  const { 
    data: allPrescriptions,
    isLoading: isLoadingAll,
    error: allError
  } = useQuery({
    queryKey: ['/api/prescriptions/patient', profile?.id],
    enabled: !!profile?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get active patient prescriptions
  const { 
    data: activePrescriptions,
    isLoading: isLoadingActive,
    error: activeError
  } = useQuery({
    queryKey: ['/api/prescriptions/patient', profile?.id, 'active'],
    enabled: !!profile?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create prescription mutation (doctor only)
  const createMutation = useMutation({
    mutationFn: (prescription: InsertPrescription) => 
      prescriptionsApi.createPrescription(prescription),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prescriptions/patient', profile?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/prescriptions/patient', profile?.id, 'active'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/prescriptions/patient', profile?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/prescriptions/patient', profile?.id, 'active'] });
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

  return {
    prescriptions: allPrescriptions,
    activePrescriptions,
    isLoading: isLoadingAll || isLoadingActive,
    error: allError || activeError,
    createPrescription,
    updatePrescription,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
