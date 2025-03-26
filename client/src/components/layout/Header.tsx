import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAlerts } from "@/hooks/useAlerts";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { user } = useAuth();
  const { unreadAlerts } = useAlerts();
  const [searchQuery, setSearchQuery] = useState("");
  
  const hasUnreadAlerts = unreadAlerts && unreadAlerts.length > 0;

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200 dark:border-gray-700">
        <div className="flex items-center md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="inline-flex items-center justify-center p-2 rounded-md text-neutral-500 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <span className="ml-2 text-lg font-semibold text-primary md:hidden">
            Saphenus PMS
          </span>
        </div>

        <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
          <div className="max-w-lg w-full lg:max-w-xs">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-neutral-400 dark:text-gray-500" />
              </div>
              <Input
                id="search"
                name="search"
                className="block w-full pl-10 pr-3 py-2 border border-neutral-200 dark:border-gray-700 rounded-md leading-5 bg-neutral-50 dark:bg-gray-800 placeholder-neutral-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center">
          {/* Theme Switcher */}
          <ThemeSwitcher />
          
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative flex-shrink-0 p-1 mx-3 text-neutral-500 dark:text-gray-400 rounded-full hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" />
            {hasUnreadAlerts && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-accent transform translate-x-1/2 -translate-y-1/2"></span>
            )}
          </Button>

          {/* Profile dropdown */}
          <div className="ml-3 relative hidden md:block">
            <div>
              <Button
                variant="ghost"
                size="icon"
                className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                id="user-menu-button"
              >
                <span className="sr-only">Open user menu</span>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImage} alt={`${user?.firstName} ${user?.lastName}`} />
                  <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
