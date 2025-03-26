import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Patient } from "@shared/schema";
import { login, logout, getCurrentUser, ExtendedUser } from "@/lib/auth";
import { userApi } from "@/lib/api";

// Simplified hook-based auth without using context provider
// We'll use a singleton pattern instead to share state across components
let globalAuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null as ExtendedUser | null,
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

  // Try to get user from localStorage first with optimized loading
  useEffect(() => {
    const localUser = checkLocalAuth();
    if (localUser) {
      console.log("Found authenticated user in localStorage:", localUser);
      
      // Normalize the user object to ensure it has expected properties
      // This is crucial for various components that expect specific fields
      const normalizedUser = {
        // Ensure required fields exist with proper names
        id: localUser.id || localUser.userId || 1,
        username: localUser.username || '',
        firstName: localUser.firstName || '',
        lastName: localUser.lastName || '',
        email: localUser.email || '',
        role: localUser.role || 'patient',
        password: '', // Don't store the actual password
        profileImage: localUser.profileImage || null
      };
      
      console.log("Normalized user object:", normalizedUser);
      
      // Immediately update auth state for faster UI rendering
      updateAuthState({ 
        user: normalizedUser,
        isAuthenticated: true,
        isLoading: false 
      });
      
      // Check if this is a fast login (from our optimized login flow)
      const isFastLogin = Boolean(localUser.fastLogin);
      
      // For patient role, prioritize data loading based on what's visible first
      if (normalizedUser.role === 'patient') {
        const patientId = normalizedUser.id || 1;
        
        // First batch - highest priority (immediately visible on dashboard)
        // Use lower priority promises for these, they'll be fetched in parallel
        Promise.all([
          // Latest metrics are needed for the dashboard cards
          queryClient.prefetchQuery({ 
            queryKey: [`/api/health-metrics/patient/${patientId}/latest`] 
          }),
          // Active prescriptions for the sidebar count
          queryClient.prefetchQuery({ 
            queryKey: [`/api/prescriptions/patient/${patientId}/active`] 
          }),
          // Unread alerts for the notification badge
          queryClient.prefetchQuery({ 
            queryKey: [`/api/device-alerts/patient/${patientId}/unread`] 
          })
        ]);
        
        // Second batch - medium priority (visible but can load a bit later)
        setTimeout(() => {
          Promise.all([
            queryClient.prefetchQuery({ 
              queryKey: [`/api/health-metrics/patient/${patientId}`] 
            }),
            queryClient.prefetchQuery({ 
              queryKey: [`/api/appointments/patient/${patientId}`] 
            }),
            queryClient.prefetchQuery({ 
              queryKey: [`/api/updates/patient/${patientId}`] 
            })
          ]);
        }, 100);
        
        // Third batch - lower priority (not immediately visible)
        setTimeout(() => {
          Promise.all([
            queryClient.prefetchQuery({ 
              queryKey: [`/api/prescriptions/patient/${patientId}`] 
            }),
            queryClient.prefetchQuery({ 
              queryKey: [`/api/device-alerts/patient/${patientId}`] 
            }),
            queryClient.prefetchQuery({ 
              queryKey: [`/api/messages/user/${patientId}`] 
            }),
            queryClient.prefetchQuery({ 
              queryKey: ['/api/doctors'] 
            }),
            queryClient.prefetchQuery({ 
              queryKey: ['/api/users/profile'] 
            }),
            queryClient.prefetchQuery({ 
              queryKey: [`/api/support-requests/patient/${patientId}`] 
            })
          ]);
        }, 300);
      } else {
        // For non-patient roles, fetch profile first
        queryClient.prefetchQuery({ 
          queryKey: ['/api/users/profile'] 
        });
      }
    }
  }, [queryClient]);

  // Get current user query as backup
  const { 
    data: user, 
    isLoading: isLoadingUser,
    error: userError
  } = useQuery<ExtendedUser | null>({
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

  // Logout mutation with improved transition
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear localStorage auth data
      localStorage.removeItem('saphenus_auth');
      
      // Clear query cache
      queryClient.setQueryData(['/api/auth/user'], null);
      queryClient.setQueryData(['/api/users/profile'], null);
      
      // Update global state first to ensure smooth transition
      updateAuthState({ 
        isAuthenticated: false, 
        user: null, 
        profile: null,
        isLoading: false
      });
      
      // Use history API to navigate to login page without refresh
      window.history.pushState({}, '', '/login');
      
      // Dispatch a popstate event to trigger the router update
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (userData: Partial<ExtendedUser>) => 
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

  const handleUpdateUser = async (userData: Partial<ExtendedUser>) => {
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
