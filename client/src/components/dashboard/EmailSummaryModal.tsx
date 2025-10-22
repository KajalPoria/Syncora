import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, MapPin, Wand2, X } from "lucide-react";
import type { Email } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EmailSummaryModalProps {
  email: Email;
  onClose: () => void;
}

export function EmailSummaryModal({ email, onClose }: EmailSummaryModalProps) {
  const [summary, setSummary] = useState(email.summary);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const summarizeMutation = useMutation({
    mutationFn: async () => {
      const data = await apiRequest("POST", `/api/emails/${email.id}/summarize`, {});
      return data;
    },
    onSuccess: (data) => {
      setSummary(data.summary);
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
      toast({
        title: "Email summarized",
        description: "AI has generated a summary of this email.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Summarization failed",
        description: "Could not generate summary. Please try again.",
      });
    },
  });

  const meetingData = email.extractedMeeting as any;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="modal-email-summary">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl mb-2">{email.subject}</DialogTitle>
              <p className="text-sm text-muted-foreground">From: {email.from}</p>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                {format(new Date(email.receivedAt), "MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {meetingData && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Meeting Details
              </h3>
              <div className="space-y-2 text-sm">
                {meetingData.date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">Date:</span>
                    <span>{meetingData.date}</span>
                  </div>
                )}
                {meetingData.time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">Time:</span>
                    <span>{meetingData.time}</span>
                  </div>
                )}
                {meetingData.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">Location:</span>
                    <span>{meetingData.location}</span>
                  </div>
                )}
                {meetingData.attendees && meetingData.attendees.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="font-medium">Attendees:</span>
                    <span>{meetingData.attendees.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-primary" />
                AI Summary
              </h3>
              {!summary && (
                <Button
                  size="sm"
                  onClick={() => summarizeMutation.mutate()}
                  disabled={summarizeMutation.isPending}
                  data-testid="button-generate-summary"
                >
                  {summarizeMutation.isPending ? "Generating..." : "Generate Summary"}
                </Button>
              )}
            </div>
            {summarizeMutation.isPending ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : summary ? (
              <div className="prose prose-sm max-w-none">
                <div className="text-sm whitespace-pre-wrap">{summary}</div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Click "Generate Summary" to get AI-powered insights from this email.
              </p>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-3">Full Email</h3>
            <div className="p-4 rounded-lg bg-muted/30 border text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
              {email.body || email.snippet}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
