import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsApi, userApi } from "@/lib/api";
import { useAuth } from "./useAuth";
import { Appointment, InsertAppointment } from "@shared/schema";
import { useToast } from "./use-toast";

export function useAppointments() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get patient appointments
  const { 
    data: appointments,
    isLoading,
    error
  } = useQuery({
    queryKey: [`/api/appointments/patient/${profile?.id}`, profile?.id],
    enabled: !!profile?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get doctors for appointment selection
  const {
    data: doctors,
    isLoading: isLoadingDoctors
  } = useQuery({
    queryKey: ['/api/doctors'],
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Create appointment mutation
  const createMutation = useMutation({
    mutationFn: (appointment: InsertAppointment) => 
      appointmentsApi.createAppointment(appointment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/appointments/patient/${profile?.id}`, profile?.id] });
      toast({
        title: "Appointment scheduled",
        description: "Your appointment has been successfully scheduled",
      });
    },
    onError: (error) => {
      console.error("Failed to schedule appointment:", error);
      toast({
        title: "Error",
        description: "Failed to schedule appointment",
        variant: "destructive",
      });
    }
  });

  // Update appointment mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Appointment> }) => 
      appointmentsApi.updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/appointments/patient/${profile?.id}`, profile?.id] });
      toast({
        title: "Appointment updated",
        description: "Your appointment has been successfully updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    }
  });

  // Delete appointment mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      appointmentsApi.deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/appointments/patient/${profile?.id}`, profile?.id] });
      toast({
        title: "Appointment cancelled",
        description: "Your appointment has been successfully cancelled",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      });
    }
  });

  // Create a new appointment
  const createAppointment = async (appointment: InsertAppointment) => {
    return createMutation.mutateAsync(appointment);
  };

  // Update an appointment
  const updateAppointment = async (id: number, data: Partial<Appointment>) => {
    return updateMutation.mutateAsync({ id, data });
  };

  // Delete/cancel an appointment
  const deleteAppointment = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    appointments,
    doctors,
    isLoading: isLoading || isLoadingDoctors,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
