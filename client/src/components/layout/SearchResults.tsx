import { useLocation } from "wouter";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Home,
  Clock,
  FileText,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Define all searchable pages in the app
const pages = [
  {
    title: "Dashboard",
    path: "/",
    icon: <Home className="h-4 w-4" />,
    keywords: ["dashboard", "home", "overview", "summary", "metrics"],
  },
  {
    title: "Treatment Timeline",
    path: "/timeline",
    icon: <Clock className="h-4 w-4" />,
    keywords: ["timeline", "history", "treatment", "progress", "medical history"],
  },
  {
    title: "Prescriptions",
    path: "/prescriptions",
    icon: <FileText className="h-4 w-4" />,
    keywords: ["prescriptions", "medication", "medicine", "drugs", "pharmacy"],
  },
  {
    title: "Appointments",
    path: "/appointments",
    icon: <Calendar className="h-4 w-4" />,
    keywords: ["appointments", "schedule", "doctor", "visit", "consultation", "booking"],
  },
  {
    title: "Messages",
    path: "/messages",
    icon: <MessageSquare className="h-4 w-4" />,
    keywords: ["messages", "chat", "communication", "email", "contact"],
  },
  {
    title: "Device Alerts",
    path: "/alerts",
    icon: <Bell className="h-4 w-4" />,
    keywords: ["alerts", "notifications", "warnings", "device", "sensor"],
  },
  {
    title: "Settings",
    path: "/settings",
    icon: <Settings className="h-4 w-4" />,
    keywords: ["settings", "account", "profile", "preferences", "configuration"],
  },
  {
    title: "Support",
    path: "/support",
    icon: <HelpCircle className="h-4 w-4" />,
    keywords: ["support", "help", "assistance", "ticket", "contact", "issue"],
  },
];

interface SearchResultsProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchResults({ query, isOpen, onClose }: SearchResultsProps) {
  const [, navigate] = useLocation();
  const [filteredPages, setFilteredPages] = useState(pages);
  const commandRef = useRef<HTMLDivElement>(null);
  
  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Filter pages based on query
  useEffect(() => {
    if (!query) {
      setFilteredPages(pages);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = pages.filter(
      (page) => 
        page.title.toLowerCase().includes(lowerQuery) || 
        page.keywords.some(keyword => keyword.includes(lowerQuery))
    );
    
    setFilteredPages(filtered);
  }, [query]);
  
  // Navigate to selected page
  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };
  
  if (!isOpen) {
    return null;
  }
  
  return (
    <div className="absolute top-full left-0 right-0 mt-1 z-50 mx-auto max-w-lg" ref={commandRef}>
      <Command className="rounded-lg border shadow-md bg-white dark:bg-gray-800">
        <CommandInput 
          placeholder="Search pages..." 
          value={query}
          readOnly 
          className="h-9"
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {filteredPages.map((page) => (
              <CommandItem 
                key={page.path}
                onSelect={() => handleSelect(page.path)}
                className="flex items-center gap-2 px-4 py-2 cursor-pointer"
              >
                <span className="flex items-center justify-center">{page.icon}</span>
                <span>{page.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}