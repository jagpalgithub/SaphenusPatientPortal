import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Patient } from "@shared/schema";
import { login, logout, getCurrentUser } from "@/lib/auth";
import { userApi } from "@/lib/api";

// Simplified hook-based auth without using context provider
// We'll use a singleton pattern instead to share state across components
let globalAuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null as User | null,
  profile: null as Patient | null,
};

let authStateListeners: (() => void)[] = [];

function notifyListeners() {
  authStateListeners.forEach(listener => listener());
}

// Function to update the global auth state
function updateAuthState(newState: Partial<typeof globalAuthState>) {
  globalAuthState = { ...globalAuthState, ...newState };
  notifyListeners();
}

// Hook to subscribe to auth state changes
export function useAuth() {
  const queryClient = useQueryClient();
  const [, forceUpdate] = useState({});

  // Subscribe to auth state changes
  useEffect(() => {
    const listener = () => forceUpdate({});
    authStateListeners.push(listener);
    return () => {
      authStateListeners = authStateListeners.filter(l => l !== listener);
    };
  }, []);

  // Check localStorage first, then fallback to server auth
  const checkLocalAuth = () => {
    try {
      const localAuth = localStorage.getItem('saphenus_auth');
      if (localAuth) {
        const parsedAuth = JSON.parse(localAuth);
        if (parsedAuth.isAuthenticated) {
          return parsedAuth;
        }
      }
      return null;
    } catch (e) {
      console.error("Error checking local auth:", e);
      return null;
    }
  };

  // Try to get user from localStorage first
  useEffect(() => {
    const localUser = checkLocalAuth();
    if (localUser) {
      console.log("Found authenticated user in localStorage:", localUser);
      updateAuthState({ 
        user: localUser, 
        isAuthenticated: true,
        isLoading: false 
      });
      
      // Also fetch profile data from the backend
      // This ensures we get all the data associated with the user
      queryClient.fetchQuery({ 
        queryKey: ['/api/users/profile']
      });
      
      // Fetch other essential data needed for the dashboard
      if (localUser.role === 'patient') {
        const patientId = localUser.userId || 1; // Use default patient ID if not present
        queryClient.fetchQuery({ queryKey: [`/api/health-metrics/patient/${patientId}`] });
        queryClient.fetchQuery({ queryKey: [`/api/appointments/patient/${patientId}`] });
        queryClient.fetchQuery({ queryKey: [`/api/prescriptions/patient/${patientId}`] });
        queryClient.fetchQuery({ queryKey: [`/api/device-alerts/patient/${patientId}`] });
        queryClient.fetchQuery({ queryKey: [`/api/updates/patient/${patientId}`] });
        queryClient.fetchQuery({ queryKey: [`/api/support-requests/patient/${patientId}`] });
        queryClient.fetchQuery({ queryKey: [`/api/messages/user/${localUser.userId || 1}`] });
        queryClient.fetchQuery({ queryKey: ['/api/doctors'] });
      }
    }
  }, [queryClient]);

  // Get current user query as backup
  const { 
    data: user, 
    isLoading: isLoadingUser,
    error: userError
  } = useQuery<User | null>({
    queryKey: ['/api/auth/user'],
    enabled: !checkLocalAuth() // Only run if no local auth
  });

  // Update state when user data changes
  useEffect(() => {
    if (user !== undefined && !checkLocalAuth()) {
      updateAuthState({ user, isAuthenticated: !!user });
    }
  }, [user]);

  // Get user profile query
  const { 
    data: profile, 
    isLoading: isLoadingProfile
  } = useQuery<Patient | null>({
    queryKey: ['/api/users/profile'],
    enabled: !!globalAuthState.user
  });
  
  // Update state when profile data changes
  useEffect(() => {
    if (profile !== undefined) {
      updateAuthState({ profile });
    }
  }, [profile]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) => 
      login(username, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/profile'] });
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear localStorage auth data
      localStorage.removeItem('saphenus_auth');
      
      // Clear query cache
      queryClient.setQueryData(['/api/auth/user'], null);
      queryClient.setQueryData(['/api/users/profile'], null);
      
      // Update global state
      updateAuthState({ isAuthenticated: false, user: null, profile: null });
      
      // Force instant reload to login page
      window.location.replace('/login');
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (userData: Partial<User>) => 
      userApi.updateUser(userData.id as number, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    }
  });

  // Set loading state
  useEffect(() => {
    if (!isLoadingUser && !isLoadingProfile) {
      updateAuthState({ isLoading: false });
    }
  }, [isLoadingUser, isLoadingProfile]);

  // No auto-login anymore
  // We want users to log in manually with the login form

  const handleLogin = async (username: string, password: string) => {
    return loginMutation.mutateAsync({ username, password });
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  const handleUpdateUser = async (userData: Partial<User>) => {
    return updateUserMutation.mutateAsync(userData);
  };

  return {
    isAuthenticated: globalAuthState.isAuthenticated,
    isLoading: globalAuthState.isLoading,
    user: globalAuthState.user,
    profile: globalAuthState.profile,
    login: handleLogin,
    logout: handleLogout,
    updateUser: handleUpdateUser,
  };
}
