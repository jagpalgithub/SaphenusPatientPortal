import { useState, useEffect } from "react";
import Sidebar, { MobileSidebar } from "./Sidebar";
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

  // Redirect to login page if not authenticated
  if (!isAuthenticated) {
    // Using a one-time effect to redirect
    // This is preferred over using setLocation directly as it avoids additional renders
    useEffect(() => {
      setLocation('/auth');
    }, []);
    
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      {/* Mobile Sidebar - Compact, smooth implementation with proper transitions */}
      <div 
        className={`fixed inset-0 flex z-50 md:hidden transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop overlay with click handler to close */}
        <div 
          className={`fixed inset-0 bg-neutral-800 dark:bg-gray-900 transition-opacity duration-300 ${
            sidebarOpen ? 'bg-opacity-75 dark:bg-opacity-80' : 'bg-opacity-0 dark:bg-opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
        
        {/* Mobile sidebar container with slide-in animation */}
        <div 
          className={`relative max-w-[85%] w-72 h-full bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Close button */}
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Mobile sidebar content - with proper close handler */}
          <MobileSidebar onNavItemClick={() => setSidebarOpen(false)} />
        </div>
      </div>
      
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
