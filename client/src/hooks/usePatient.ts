import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import { useAuth } from "./useAuth";
import { Patient } from "@shared/schema";
import { useToast } from "./use-toast";

export function usePatient() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Update patient mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Patient> }) => 
      userApi.updatePatient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/profile'] });
      toast({
        title: "Profile updated",
        description: "Your patient profile has been successfully updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update patient profile",
        variant: "destructive",
      });
    }
  });

  // Update patient profile
  const updatePatient = async (id: number, data: Partial<Patient>) => {
    return updateMutation.mutateAsync({ id, data });
  };

  return {
    patient: profile,
    isLoading: false,
    updatePatient,
    isUpdating: updateMutation.isPending,
  };
}
