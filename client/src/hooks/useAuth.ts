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

  // Get current user query
  const { 
    data: user, 
    isLoading: isLoadingUser,
    error: userError
  } = useQuery<User | null>({
    queryKey: ['/api/auth/user']
  });

  // Update state when user data changes
  useEffect(() => {
    if (user !== undefined) {
      updateAuthState({ user, isAuthenticated: !!user });
    }
  }, [user]);

  // Get user profile query
  const { 
    data: profile, 
    isLoading: isLoadingProfile
  } = useQuery<Patient | null>({
    queryKey: ['/api/users/profile'],
    enabled: !!globalAuthState.user && globalAuthState.user.role === 'patient'
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
      queryClient.setQueryData(['/api/auth/user'], null);
      queryClient.setQueryData(['/api/users/profile'], null);
      updateAuthState({ isAuthenticated: false, user: null, profile: null });
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

  // Auto-login for demo purposes
  useEffect(() => {
    if (userError && !isLoadingUser) {
      // For demo purposes, automatically login as Anna Wagner
      loginMutation.mutate({ username: "anna.wagner", password: "password" });
    }
  }, [userError, isLoadingUser]);

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
