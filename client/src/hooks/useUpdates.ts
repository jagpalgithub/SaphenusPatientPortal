import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updatesApi } from "@/lib/api";
import { useAuth } from "./useAuth";
import { InsertUpdate } from "@shared/schema";
import { useToast } from "./use-toast";

interface UpdatesOptions {
  enabled?: boolean;
}

export function useUpdates(options: UpdatesOptions = {}) {
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get the patient ID (from profile, user or default for Anna)
  const patientId = profile?.id || (user ? (user as any).userId || user.id : null) || 1;
  const isEnabled = options.enabled !== false;

  // Get patient updates
  const { 
    data: updates,
    isLoading,
    error
  } = useQuery({
    queryKey: [`/api/updates/patient/${patientId}`, patientId],
    enabled: !!patientId && isEnabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: { priority: 2 } // Medium priority data
  });

  // Create update mutation
  const createMutation = useMutation({
    mutationFn: (update: InsertUpdate) => 
      updatesApi.createUpdate(update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/updates/patient/${profile?.id}`, profile?.id] });
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
