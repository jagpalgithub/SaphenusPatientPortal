import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Home,
  Clock,
  FileText,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  HelpCircle
} from "lucide-react";
import { useAlerts } from "@/hooks/useAlerts";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: number;
}

const NavItem = ({ href, icon, label, active, badge }: NavItemProps) => {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center px-2 py-2 text-sm font-medium rounded-md",
          active
            ? "bg-primary text-white dark:text-white"
            : "text-neutral-700 hover:bg-neutral-100 dark:text-gray-300 dark:hover:bg-gray-800"
        )}
      >
        <span className="mr-3 h-5 w-5">{icon}</span>
        {label}
        {badge && badge > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 ml-auto text-xs font-medium rounded-full bg-accent text-white">
            {badge}
          </span>
        )}
      </a>
    </Link>
  );
};

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { unreadAlerts } = useAlerts();

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-neutral-200 dark:border-gray-700 bg-primary dark:bg-primary">
          <span className="text-lg font-semibold text-white dark:text-white">Saphenus PMS</span>
        </div>

        {/* User Profile */}
        <div className="flex items-center px-4 py-3 border-b border-neutral-200 dark:border-gray-700">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profileImage} alt={`${user?.firstName} ${user?.lastName}`} />
            <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-neutral-800 dark:text-gray-200">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs font-medium text-neutral-500 dark:text-gray-400">
              {user?.role === "patient" ? "Patient" : "Doctor"}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          <NavItem
            href="/"
            icon={<Home className="text-inherit" />}
            label="Dashboard"
            active={location === "/"}
          />
          <NavItem
            href="/timeline"
            icon={<Clock className="text-inherit" />}
            label="Treatment Timeline"
            active={location === "/timeline"}
          />
          <NavItem
            href="/prescriptions"
            icon={<FileText className="text-inherit" />}
            label="Prescriptions"
            active={location === "/prescriptions"}
          />
          <NavItem
            href="/appointments"
            icon={<Calendar className="text-inherit" />}
            label="Appointments"
            active={location === "/appointments"}
          />
          <NavItem
            href="/messages"
            icon={<MessageSquare className="text-inherit" />}
            label="Messages"
            active={location === "/messages"}
          />
          <NavItem
            href="/alerts"
            icon={<Bell className="text-inherit" />}
            label="Device Alerts"
            active={location === "/alerts"}
            badge={unreadAlerts?.length}
          />
          <NavItem
            href="/settings"
            icon={<Settings className="text-inherit" />}
            label="Settings"
            active={location === "/settings"}
          />
          <NavItem
            href="/support"
            icon={<HelpCircle className="text-inherit" />}
            label="Help & Support"
            active={location === "/support"}
          />
        </nav>
      </div>
    </aside>
  );
}
