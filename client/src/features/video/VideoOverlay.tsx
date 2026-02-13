import { useEffect, useRef, useState } from 'react';
import { useWebRTC } from '@/shared/hooks/useWebRTC';
import { Button } from '@/components/ui/button';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoOverlayProps {
  projectId: string;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoOverlay = ({ projectId, userId, isOpen, onClose }: VideoOverlayProps) => {
  const {
    localStream,
    remoteStream,
    isInCall,
    joinCall,
    leaveCall,
    toggleMute,
    toggleVideo,
    shareScreen,
    isMuted,
    isVideoOff,
    isScreenSharing,
  } = useWebRTC({ projectId, userId });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  // Auto-join when opened
  useEffect(() => {
    if (isOpen && !isInCall) {
      joinCall();
    } else if (!isOpen && isInCall) {
      leaveCall();
    }
  }, [isOpen]);

  // Handle stream attachment
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed transition-all duration-300 ease-in-out z-50 shadow-2xl rounded-xl overflow-hidden border border-border bg-background",
        isMinimized
          ? "bottom-4 right-4 w-64 h-48"
          : "bottom-4 right-4 w-[800px] h-[600px] max-w-[90vw] max-h-[90vh]"
      )}
    >
      {/* Header / Controls for minimize */}
      <div className="absolute top-2 right-2 z-20 flex gap-2">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-full opacity-80 hover:opacity-100"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
        </Button>
      </div>

      <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
        {/* Remote Video (Full Size) */}
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white/50 flex flex-col items-center gap-2">
            <div className="animate-pulse">Waiting for others to join...</div>
          </div>
        )}

        {/* Local Video (Picture-in-Picture) */}
        <div
          className={cn(
            "absolute transition-all duration-300 shadow-xl rounded-lg overflow-hidden border-2 border-primary/20 bg-black",
            isMinimized
              ? "hidden" // Hide local when minimized to save space? Or keep it? Let's hide for cleaner mini view
              : "bottom-24 right-4 w-48 h-36"
          )}
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={cn(
               "w-full h-full object-cover",
               // Mirror local video usually
               "scale-x-[-1]"
            )}
          />
           <div className="absolute bottom-1 left-2 text-xs text-white bg-black/50 px-1 rounded">
              You
           </div>
        </div>

        {/* Controls Bar */}
        {!isMinimized && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background/80 backdrop-blur-md p-3 rounded-full shadow-lg border border-border">
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={toggleMute}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            
            <Button
              variant={isVideoOff ? "destructive" : "secondary"}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={toggleVideo}
            >
               {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </Button>

            <Button
              variant={isScreenSharing ? "default" : "secondary"}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={() => {
                  if (typeof navigator.mediaDevices.getDisplayMedia !== 'function') {
                      alert("Screen sharing is not supported by your mobile browser.");
                      return;
                  }
                  shareScreen();
              }}
            >
              <Monitor className="h-5 w-5" />
            </Button>

            <Button
              variant="destructive"
              size="icon"
              className="rounded-full h-12 w-12 ml-4"
              onClick={() => {
                leaveCall();
                onClose();
              }}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
