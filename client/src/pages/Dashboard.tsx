import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bell, Sparkles, LogOut, Settings } from "lucide-react";
import { PriorityInbox } from "@/components/dashboard/PriorityInbox";
import { CalendarWidget } from "@/components/dashboard/CalendarWidget";
import { TaskList } from "@/components/dashboard/TaskList";
import { AIChat } from "@/components/dashboard/AIChat";
import { NotificationPanel } from "@/components/dashboard/NotificationPanel";
import { Badge } from "@/components/ui/badge";
import type { User, Notification } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-3 py-2"
            data-testid="button-logo"
          >
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Syncora</h1>
          </button>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                data-testid="button-notifications"
                className="hover-elevate active-elevate-2"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              {showNotifications && (
                <NotificationPanel
                  notifications={notifications}
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </div>
            
            <ThemeToggle />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/settings")}
              data-testid="button-settings"
              className="hover-elevate active-elevate-2"
            >
              <Settings className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              data-testid="button-logout"
              className="hover-elevate active-elevate-2"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back{user?.name ? `, ${user.name}` : ""}!</h2>
          <p className="text-muted-foreground">Your AI command center is ready</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <PriorityInbox />
          <CalendarWidget />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <TaskList />
          </div>
          <div className="lg:col-span-2">
            <AIChat />
          </div>
        </div>
      </main>
    </div>
  );
}
