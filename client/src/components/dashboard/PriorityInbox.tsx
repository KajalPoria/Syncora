import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Wand2, RefreshCw } from "lucide-react";
import { EmailSummaryModal } from "./EmailSummaryModal";
import type { Email } from "@shared/schema";
import { format } from "date-fns";

export function PriorityInbox() {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  
  const { data: emails, isLoading, refetch } = useQuery<Email[]>({
    queryKey: ["/api/emails"],
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-chart-2 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityLabel = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Priority Inbox</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const sortedEmails = [...(emails || [])].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
  });

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Priority Inbox</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            data-testid="button-refresh-emails"
            className="hover-elevate active-elevate-2"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedEmails.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No emails yet</p>
              <p className="text-sm text-muted-foreground">Connect your Gmail to get started</p>
            </div>
          ) : (
            sortedEmails.map((email) => (
              <div
                key={email.id}
                className={`p-4 rounded-lg border transition-all hover-elevate active-elevate-2 cursor-pointer ${
                  !email.isRead ? "bg-accent/5" : ""
                }`}
                onClick={() => setSelectedEmail(email)}
                data-testid={`email-item-${email.id}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`${getPriorityColor(email.priority)} text-xs`}>
                        {getPriorityLabel(email.priority)}
                      </Badge>
                      {!email.isRead && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="font-semibold truncate">{email.from}</p>
                    <p className="text-sm font-medium truncate">{email.subject}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEmail(email);
                    }}
                    data-testid={`button-summarize-${email.id}`}
                    className="shrink-0 gap-1"
                  >
                    <Wand2 className="h-3 w-3" />
                    <span className="text-xs">Summarize</span>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {email.snippet}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {format(new Date(email.receivedAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {selectedEmail && (
        <EmailSummaryModal
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
        />
      )}
    </>
  );
}
