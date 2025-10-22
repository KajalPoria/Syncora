import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, MapPin, Video, RefreshCw } from "lucide-react";
import type { CalendarEvent } from "@shared/schema";
import { format, isToday, isTomorrow, isPast } from "date-fns";

export function CalendarWidget() {
  const { data: events, isLoading, refetch } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar/events"],
  });

  const upcomingEvents = events
    ?.filter((event) => !isPast(new Date(event.endTime)))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5) || [];

  const getEventBadge = (event: CalendarEvent) => {
    const startDate = new Date(event.startTime);
    if (isToday(startDate)) {
      return <Badge className="bg-primary text-primary-foreground">Today</Badge>;
    }
    if (isTomorrow(startDate)) {
      return <Badge className="bg-chart-2 text-white">Tomorrow</Badge>;
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Upcoming Meetings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Upcoming Meetings</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          data-testid="button-refresh-calendar"
          className="hover-elevate active-elevate-2"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No upcoming meetings</p>
            <p className="text-sm text-muted-foreground">Your calendar is clear</p>
          </div>
        ) : (
          upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="p-4 rounded-lg border hover-elevate active-elevate-2 cursor-pointer"
              data-testid={`calendar-event-${event.id}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {getEventBadge(event)}
                  </div>
                  <h4 className="font-semibold text-base mb-1">{event.title}</h4>
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="font-mono">
                    {format(new Date(event.startTime), "MMM d, h:mm a")} - {format(new Date(event.endTime), "h:mm a")}
                  </span>
                </div>

                {event.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}

                {event.meetingLink && (
                  <div className="flex items-center gap-2">
                    <Video className="h-3 w-3 text-primary" />
                    <a
                      href={event.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                      data-testid={`link-meeting-${event.id}`}
                    >
                      Join meeting
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
