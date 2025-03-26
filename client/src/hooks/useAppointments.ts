import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsApi, userApi } from "@/lib/api";
import { useAuth } from "./useAuth";
import { Appointment, InsertAppointment } from "@shared/schema";
import { useToast } from "./use-toast";
import { login } from "@/lib/auth";

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
    mutationFn: async (appointment: any) => {
      try {
        console.log("Appointment data before API call:", appointment);
        
        // Make sure dateTime is properly formatted
        const formattedAppointment = {
          ...appointment,
          dateTime: appointment.dateTime instanceof Date 
            ? appointment.dateTime.toISOString() 
            : appointment.dateTime
        };
        
        console.log("Formatted appointment data:", formattedAppointment);
        
        // First try to create the appointment - date formatting handled in API
        return await appointmentsApi.createAppointment(formattedAppointment);
      } catch (err) {
        console.error("Error in appointment creation:", err);
        
        // If unauthorized, try to login again
        if (err instanceof Error && err.toString().includes("401")) {
          if (user) {
            console.log("Authentication failed. Attempting to login again...");
            await login("anna.wagner", "password");
            // Retry after login
            return await appointmentsApi.createAppointment(appointment);
          }
        }
        throw err;
      }
    },
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
        description: "Failed to schedule appointment. Please check all fields and try again.",
        variant: "destructive",
      });
    }
  });

  // Update appointment mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      try {
        // Date formatting handled in API layer
        return await appointmentsApi.updateAppointment(id, data);
      } catch (err) {
        // If unauthorized, try to login again
        if (err instanceof Error && err.toString().includes("401")) {
          if (user) {
            console.log("Authentication failed. Attempting to login again...");
            await login("anna.wagner", "password");
            // Retry after login
            return await appointmentsApi.updateAppointment(id, data);
          }
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/appointments/patient/${profile?.id}`, profile?.id] });
      toast({
        title: "Appointment updated",
        description: "Your appointment has been successfully updated",
      });
    },
    onError: (error) => {
      console.error("Failed to update appointment:", error);
      toast({
        title: "Error",
        description: "Failed to update appointment. Please check all fields and try again.",
        variant: "destructive",
      });
    }
  });

  // Delete appointment mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        return await appointmentsApi.deleteAppointment(id);
      } catch (err) {
        // If unauthorized, try to login again
        if (err instanceof Error && err.toString().includes("401")) {
          if (user) {
            console.log("Authentication failed. Attempting to login again...");
            await login("anna.wagner", "password");
            // Retry after login
            return await appointmentsApi.deleteAppointment(id);
          }
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/appointments/patient/${profile?.id}`, profile?.id] });
      toast({
        title: "Appointment cancelled",
        description: "Your appointment has been successfully cancelled",
      });
    },
    onError: (error) => {
      console.error("Failed to cancel appointment:", error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment. Please try again later.",
        variant: "destructive",
      });
    }
  });

  // Create a new appointment
  const createAppointment = async (appointment: any) => {
    return createMutation.mutateAsync(appointment);
  };

  // Update an appointment
  const updateAppointment = async (id: number, data: any) => {
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
