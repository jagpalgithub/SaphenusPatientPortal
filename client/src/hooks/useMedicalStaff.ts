import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import { useAuth } from "./useAuth";

export function useMedicalStaff() {
  const { user } = useAuth();

  // Get all doctors
  const { 
    data: doctors,
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/doctors'],
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  return {
    doctors,
    isLoading,
    error,
  };
}
