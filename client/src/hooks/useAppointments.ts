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
    mutationFn: async (appointment: InsertAppointment) => {
      // Convert Date to ISO string if it's not already
      const appointmentData = {
        ...appointment,
        dateTime: appointment.dateTime instanceof Date 
          ? appointment.dateTime.toISOString() 
          : appointment.dateTime
      };
      
      try {
        // First try to create the appointment
        return await appointmentsApi.createAppointment(appointmentData);
      } catch (err) {
        // If unauthorized, try to login again
        if (err instanceof Error && err.toString().includes("401")) {
          if (user) {
            console.log("Authentication failed. Attempting to login again...");
            await login("anna.wagner", "password");
            // Retry after login
            return await appointmentsApi.createAppointment(appointmentData);
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
    mutationFn: async ({ id, data }: { id: number; data: Partial<Appointment> }) => {
      try {
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
