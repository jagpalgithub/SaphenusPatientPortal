import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useRoute } from "wouter";
import { Loader2 } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isLoading, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg dark:text-gray-300">Loading...</span>
      </div>
    );
  }

  // In a real application, we would redirect to login here
  if (!isAuthenticated) {
    // For demo purposes, we're assuming the user is automatically logged in
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div
            className="fixed inset-0 bg-neutral-600 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-80"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <Sidebar />
        </div>
      )}
      
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-neutral-50 dark:bg-gray-900">
          {children}
        </div>
        
        <Footer />
      </main>
    </div>
  );
}
