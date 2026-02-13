import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';
import { VideoOverlay } from './VideoOverlay';
import { useAuth } from '@/app/providers/AuthProvider';
import { useSocket } from '@/shared/hooks/useSocket';

export const VideoCallFeature = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const { user } = useAuth();
    const { socket } = useSocket();
    const [isCallOpen, setIsCallOpen] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);

    useEffect(() => {
        if (!socket || !projectId) return;

        const handleCallStatus = (data: { projectId: string; isActive: boolean }) => {
            if (data.projectId === projectId) {
                setIsCallActive(data.isActive);
            }
        };

        const handleProjectJoined = (data: { projectId: string; isCallActive: boolean }) => {
             if (data.projectId === projectId) {
                setIsCallActive(data.isCallActive);
             }
        };

        socket.on('call_status_update', handleCallStatus);
        socket.on('project_joined', handleProjectJoined);

        // Fetch initial status explicitly to avoid race conditions with room joining
        socket.emit("get_call_status", { projectId });

        return () => {
            socket.off('call_status_update', handleCallStatus);
            socket.off('project_joined', handleProjectJoined);
        };
    }, [socket, projectId]);

    if (!projectId || !user) {
        return null;
    }

    return (
        <>
            <Button 
                variant={isCallActive && !isCallOpen ? "default" : "outline"}
                size="sm" 
                onClick={() => setIsCallOpen(true)}
                className={isCallActive && !isCallOpen ? "bg-green-600 hover:bg-green-700 text-white gap-2" : "gap-2"}
            >
                <Video className="h-4 w-4" />
                {isCallActive ? (isCallOpen ? "Call Active" : "Join Call") : "Start Call"}
            </Button>

            <VideoOverlay 
                projectId={projectId}
                userId={user.id}
                isOpen={isCallOpen}
                onClose={() => setIsCallOpen(false)}
            />
        </>
    );
};
