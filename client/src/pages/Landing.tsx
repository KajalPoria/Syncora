import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, Mail, Calendar, Brain, Lock } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <canvas id="neural-network" className="absolute inset-0 z-0" />
      
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background z-10" />
      
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8 max-w-4xl">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Sparkles className="h-12 w-12 text-primary animate-pulse" />
            <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Syncora
            </h1>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            Your AI Command Center for Professional Communications
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Intelligent email prioritization, automated meeting scheduling, and smart AI assistance 
            — all in one sophisticated dashboard
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card/50 backdrop-blur border border-card-border">
              <Mail className="h-8 w-8 text-primary" />
              <h3 className="font-semibold text-foreground">Priority Inbox</h3>
              <p className="text-sm text-muted-foreground text-center">
                AI-powered email categorization
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card/50 backdrop-blur border border-card-border">
              <Calendar className="h-8 w-8 text-primary" />
              <h3 className="font-semibold text-foreground">Smart Scheduling</h3>
              <p className="text-sm text-muted-foreground text-center">
                Automated meeting detection
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card/50 backdrop-blur border border-card-border">
              <Brain className="h-8 w-8 text-primary" />
              <h3 className="font-semibold text-foreground">AI Assistant</h3>
              <p className="text-sm text-muted-foreground text-center">
                Intelligent chat support
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card/50 backdrop-blur border border-card-border">
              <Lock className="h-8 w-8 text-primary" />
              <h3 className="font-semibold text-foreground">Secure & Private</h3>
              <p className="text-sm text-muted-foreground text-center">
                Enterprise-grade security
              </p>
            </div>
          </div>

          <div className="pt-8">
            <Button
              size="lg"
              className="text-lg px-8 py-6 h-auto"
              onClick={() => setLocation("/auth")}
              data-testid="button-get-started"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
