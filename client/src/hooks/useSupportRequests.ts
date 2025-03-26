import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supportApi } from "@/lib/api";
import { useAuth } from "./useAuth";
import { InsertSupportRequest } from "@shared/schema";
import { useToast } from "./use-toast";

export function useSupportRequests() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get patient support requests
  const { 
    data: supportRequests,
    isLoading,
    error
  } = useQuery({
    queryKey: [`/api/support-requests/patient/${profile?.id}`, profile?.id],
    enabled: !!profile?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create support request mutation
  const createMutation = useMutation({
    mutationFn: (request: InsertSupportRequest) => 
      supportApi.createSupportRequest(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/support-requests/patient/${profile?.id}`, profile?.id] });
      toast({
        title: "Support request submitted",
        description: "Your support request has been successfully submitted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit support request",
        variant: "destructive",
      });
    }
  });

  // Update support request status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: number; status: string; notes?: string }) => 
      supportApi.updateSupportRequestStatus(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/support-requests/patient/${profile?.id}`, profile?.id] });
      toast({
        title: "Support request updated",
        description: "The support request status has been updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update support request",
        variant: "destructive",
      });
    }
  });

  // Create a new support request
  const createSupportRequest = async (request: InsertSupportRequest) => {
    return createMutation.mutateAsync(request);
  };

  // Update support request status
  const updateSupportRequestStatus = async (id: number, status: string, notes?: string) => {
    return updateStatusMutation.mutateAsync({ id, status, notes });
  };

  return {
    supportRequests,
    isLoading,
    error,
    createSupportRequest,
    updateSupportRequestStatus,
    isCreating: createMutation.isPending,
    isUpdating: updateStatusMutation.isPending,
  };
}
