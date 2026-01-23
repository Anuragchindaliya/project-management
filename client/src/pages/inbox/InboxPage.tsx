
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/entities/notification/api/useNotifications';
import { Loader2, Bell, CheckCheck } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export function InboxPage() {
    const { data: notifications, isLoading } = useNotifications();
    const { mutate: markRead } = useMarkNotificationRead();
    const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsRead();
    const navigate = useNavigate();

    const handleNotificationClick = (n: any) => {
        if (!n.isRead) {
            markRead(n.id);
        }
        if (n.link) {
            navigate(n.link);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
                    <p className="text-muted-foreground">Stay updated with activity across your workspace.</p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={() => markAllRead()} disabled={isMarkingAll}>
                         <CheckCheck className="mr-2 h-4 w-4" />
                         Mark all as read
                    </Button>
                )}
            </div>

            <div className="grid gap-2">
                {notifications && notifications.length > 0 ? (
                    notifications.map((n) => (
                        <Card 
                            key={n.id} 
                            className={`transition-colors cursor-pointer border-l-4 ${!n.isRead ? 'border-l-primary bg-primary/5' : 'border-l-transparent bg-card hover:bg-accent/5'}`}
                            onClick={() => handleNotificationClick(n)}
                        >
                            <CardContent className="p-4 flex gap-4">
                                <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    <Bell className="h-4 w-4" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className={`text-sm ${!n.isRead ? 'font-semibold' : 'font-medium'}`}>{n.title}</h4>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground/80 line-clamp-2">{n.message}</p>
                                </div>
                                {!n.isRead && (
                                    <div className="flex flex-col justify-center">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium">All caught up!</h3>
                        <p className="text-sm text-muted-foreground">You don't have any notifications.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
