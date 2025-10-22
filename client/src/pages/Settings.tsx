import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, Shield, Bell, Mail, Calendar, Sparkles } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import type { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [show2FASetup, setShow2FASetup] = useState(false);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const enable2FAMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/2fa/enable", {});
    },
    onSuccess: (data) => {
      setShow2FASetup(true);
      toast({
        title: "2FA Setup",
        description: "Scan the QR code with your authenticator app.",
      });
    },
  });

  const disable2FAMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/2fa/disable", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
      });
    },
  });

  const connectGoogleMutation = useMutation({
    mutationFn: async (service: "gmail" | "calendar" | "drive") => {
      window.location.href = `/api/google/connect/${service}`;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            data-testid="button-back"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Account
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled />
              </div>
              {user?.name && (
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={user.name} disabled />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security
              </CardTitle>
              <CardDescription>Manage your security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  checked={user?.twoFactorEnabled || false}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      enable2FAMutation.mutate();
                    } else {
                      disable2FAMutation.mutate();
                    }
                  }}
                  data-testid="switch-2fa"
                />
              </div>

              {show2FASetup && (
                <div className="p-4 rounded-lg bg-muted/30 border">
                  <p className="text-sm mb-2">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <div className="h-48 w-48 bg-muted flex items-center justify-center">
                      QR Code Placeholder
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    After scanning, enter the 6-digit code from your app to verify
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SiGoogle className="h-5 w-5 text-primary" />
                Google Integrations
              </CardTitle>
              <CardDescription>Connect your Google services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label>Gmail</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Access and prioritize your emails
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => connectGoogleMutation.mutate("gmail")}
                  data-testid="button-connect-gmail"
                >
                  Connect Gmail
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Label>Google Calendar</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sync your meetings and events
                  </p>
                </div>
                <Button
                  variant="outline"
                  disabled
                  data-testid="button-connect-calendar"
                >
                  Connected
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription>Customize how Syncora looks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark mode
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
