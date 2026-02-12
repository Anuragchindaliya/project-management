
import { useEffect, useRef, useState } from 'react';
import { useSocket } from './useSocket';

const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
  ],
};

interface WebRTCProps {
  projectId: string;
  userId: string;
}

export const useWebRTC = ({ projectId }: WebRTCProps) => {
  const { socket } = useSocket();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // Keep track of all peer connections: socketId -> RTCPeerConnection
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Initialize local media
  const initLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      return null;
    }
  };

  const createPeerConnection = (peerSocketId: string, stream: MediaStream) => {
    const pc = new RTCPeerConnection(STUN_SERVERS);

    // Add local tracks to peer connection
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice_candidate', {
          candidate: event.candidate,
          to: peerSocketId
        });
      }
    };

    // Handle incoming streams
    pc.ontrack = (event) => {
      console.log('Received remote stream from', peerSocketId);
      // For this MVP, we just show the last connected peer's stream
      // In a real app, we'd manage a list of remote streams
      setRemoteStream(event.streams[0]);
    };

    peersRef.current.set(peerSocketId, pc);
    return pc;
  };

  const joinCall = async () => {
    if (!socket) return;
    
    // 1. Get local media
    const stream = await initLocalMedia();
    if (!stream) return;

    // 2. Join the call room
    socket.emit('join_call', { projectId });
    setIsInCall(true);
  };

  const leaveCall = () => {
    if (!socket) return;

    // 1. Stop local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // 2. Close all peer connections
    peersRef.current.forEach(pc => pc.close());
    peersRef.current.clear();

    // 3. Reset state
    setLocalStream(null);
    setRemoteStream(null);
    setIsInCall(false);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);

    // 4. Notify server
    socket.emit('leave_call', { projectId });
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        // Just disable the track, don't stop it, so we can re-enable
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const shareScreen = async () => {
    if (isScreenSharing) {
        // Stop screen sharing
        stopScreenShare();
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = stream.getVideoTracks()[0];

        screenTrack.onended = () => {
           stopScreenShare();
        };

        if (localStreamRef.current) {
             peersRef.current.forEach(pc => {
                 const senders = pc.getSenders();
                 const sender = senders.find(s => s.track?.kind === 'video');
                 if (sender) {
                     sender.replaceTrack(screenTrack);
                 }
             });
             
             // Update local view
             // We usually keep local camera in the corner, but maybe we want to see what we share?
             // For now, let's just replace the track sent to peers.
             screenStreamRef.current = stream;
             setIsScreenSharing(true);
        }
    } catch (e) {
        console.error("Error sharing screen", e);
    }
  };
  
  const stopScreenShare = () => {
      if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(t => t.stop());
          screenStreamRef.current = null;
      }
      
      // Revert to camera
      if (localStreamRef.current) {
          const cameraTrack = localStreamRef.current.getVideoTracks()[0];
          peersRef.current.forEach(pc => {
             const senders = pc.getSenders();
             const sender = senders.find(s => s.track?.kind === 'video');
             if (sender) {
                 sender.replaceTrack(cameraTrack);
             }
         });
      }
      setIsScreenSharing(false);
  };

  // Socket Event Listeners
  useEffect(() => {
    if (!socket || !isInCall) return;

    // A new user joined the call
    // We (existing user) initiate the offer
    const handleUserJoined = async ({ socketId }: { socketId: string }) => {
       console.log("New user joined call:", socketId);
       if (!localStreamRef.current) return;
       
       // Create PC
       const pc = createPeerConnection(socketId, localStreamRef.current);
       
       // Create Offer
       const offer = await pc.createOffer();
       await pc.setLocalDescription(offer);
       
       socket.emit('usage_offer', {
           offer,
           to: socketId
       });
    };
    
    // We are the new user, receiving an offer
    const handleUsageOffer = async ({ offer, from }: { offer: RTCSessionDescriptionInit, from: string }) => {
        console.log("Received offer from:", from);
        if (!localStreamRef.current) return;

        let pc = peersRef.current.get(from);
        if (!pc) {
            pc = createPeerConnection(from, localStreamRef.current);
        }

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        socket.emit('usage_answer', {
            answer,
            to: from
        });
    };
    
    const handleUsageAnswer = async ({ answer, from }: { answer: RTCSessionDescriptionInit, from: string }) => {
        console.log("Received answer from:", from);
        const pc = peersRef.current.get(from);
        if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
    };
    
    const handleIceCandidate = async ({ candidate, from }: { candidate: RTCIceCandidate, from: string }) => {
        const pc = peersRef.current.get(from);
        if (pc) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
    };
    
    const handleUserLeft = ({ socketId }: { socketId: string }) => {
        const pc = peersRef.current.get(socketId);
        if (pc) {
            pc.close();
            peersRef.current.delete(socketId);
            // If that was the remote stream we were showing, clear it
            // (In a real app, we'd pick the next available stream or show grid)
            // For now, if we have 0 peers, clear remote
            if (peersRef.current.size === 0) {
                setRemoteStream(null);
            }
        }
    };

    socket.on('user_joined_call', handleUserJoined);
    socket.on('usage_offer', handleUsageOffer);
    socket.on('usage_answer', handleUsageAnswer);
    socket.on('ice_candidate', handleIceCandidate);
    socket.on('user_left_call', handleUserLeft); // Assuming I add this to backend? I did.

    return () => {
      socket.off('user_joined_call', handleUserJoined);
      socket.off('usage_offer', handleUsageOffer);
      socket.off('usage_answer', handleUsageAnswer);
      socket.off('ice_candidate', handleIceCandidate);
      socket.off('user_left_call', handleUserLeft);
    };
  }, [socket, isInCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // If we unmount, leave the call
      if (isInCall) {
          leaveCall();
      }
    };
  }, []);

  return {
    localStream,
    remoteStream,
    isInCall,
    isMuted,
    isVideoOff,
    isScreenSharing,
    joinCall,
    leaveCall,
    toggleMute,
    toggleVideo,
    shareScreen
  };
};
