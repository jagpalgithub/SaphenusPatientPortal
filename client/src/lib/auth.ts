import { authApi } from "./api";
import { User } from "@shared/schema";

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

// Login function
// In a real app, this would authenticate with the server
export async function login(username: string, password: string) {
  try {
    const user = await authApi.login(username, password);
    
    // Normalize the user object to ensure it has expected properties
    const normalizedUser = {
      // Ensure required fields exist with proper names
      id: user.id || user.userId || 1,
      username: user.username || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      role: user.role || 'patient',
      password: '', // Don't store the actual password
      profileImage: user.profileImage || null
    };
    
    console.log("Normalized user from login:", normalizedUser);
    
    // Store auth info in localStorage for persistence
    localStorage.setItem('saphenus_auth', JSON.stringify({
      ...normalizedUser,
      isAuthenticated: true,
    }));
    
    return normalizedUser;
  } catch (error) {
    throw new Error("Failed to login");
  }
}

// Mock logout function
export async function logout() {
  try {
    await authApi.logout();
    return true;
  } catch (error) {
    throw new Error("Failed to logout");
  }
}

// Get the current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    return await authApi.getCurrentUser();
  } catch (error) {
    return null;
  }
}
