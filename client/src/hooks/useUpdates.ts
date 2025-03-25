import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updatesApi } from "@/lib/api";
import { useAuth } from "./useAuth";
import { InsertUpdate } from "@shared/schema";
import { useToast } from "./use-toast";

export function useUpdates() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get patient updates
  const { 
    data: updates,
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/updates/patient', profile?.id],
    enabled: !!profile?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create update mutation
  const createMutation = useMutation({
    mutationFn: (update: InsertUpdate) => 
      updatesApi.createUpdate(update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/updates/patient', profile?.id] });
      toast({
        title: "Update created",
        description: "The update has been successfully created",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create update",
        variant: "destructive",
      });
    }
  });

  // Create a new update
  const createUpdate = async (update: InsertUpdate) => {
    return createMutation.mutateAsync(update);
  };

  return {
    updates,
    isLoading,
    error,
    createUpdate,
    isCreating: createMutation.isPending,
  };
}
