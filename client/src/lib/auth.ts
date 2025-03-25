import { authApi } from "./api";
import { User } from "@shared/schema";

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

// Mock login function for development purposes
// In a real app, this would authenticate with the server
export async function login(username: string, password: string) {
  try {
    const user = await authApi.login(username, password);
    return user;
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
