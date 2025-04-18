// components/LiveStream.js
"use client";

import { useState, useEffect, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaUsers,
  FaEye,
  FaEyeSlash,
  FaVolumeUp,
  FaVolumeMute,
  FaSpinner
} from "react-icons/fa";
import { getSocket } from "@/lib/socket";

const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });

let localTracks = {
  videoTrack: null,
  audioTrack: null
};

export default function LiveStream({ roomId, token, userId, role, isLoading, viewerCount = 0, users = [] }) {
  console.log("LiveStream component mounted with role:", role, users);
  const [isClientJoined, setIsClientJoined] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [error, setError] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [allowAudienceAudio, setAllowAudienceAudio] = useState(true);
  const [allowAudienceVideo, setAllowAudienceVideo] = useState(true);
  const [connectedUsers, setConnectedUsers] = useState(users || []);
  const [showUserList, setShowUserList] = useState(false);
  const [hostActive, setHostActive] = useState(false);
  const [hostMuted, setHostMuted] = useState(false);
  const [hostVideoOff, setHostVideoOff] = useState(false);
  // Track different tracks separately to fix the issue
  const [hostHasPublishedAudio, setHostHasPublishedAudio] = useState(false);
  const [hostHasPublishedVideo, setHostHasPublishedVideo] = useState(false);

  const localPlayerRef = useRef(null);
  const remotePlayersRef = useRef({});

  useEffect(() => {
    return () => {
      leaveChannel();
    };
  }, []);

  useEffect(() => {
    if (token && !isClientJoined && !isLoading) {
      joinChannel();
    }
  }, [token, isLoading]);

  useEffect(() => {
    const savedAudio = localStorage.getItem(`${roomId}_allowAudio`);
    const savedVideo = localStorage.getItem(`${roomId}_allowVideo`);
    if (savedAudio !== null) setAllowAudienceAudio(savedAudio === "true");
    if (savedVideo !== null) setAllowAudienceVideo(savedVideo === "true");
  }, [roomId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("userList", (users) => {
      setConnectedUsers(users);
    });

    // Listen for host media status updates
    socket.on("hostMediaStatus", ({ audioEnabled, videoEnabled }) => {
      console.log("Received host media status update:", { audioEnabled, videoEnabled });
      setHostMuted(!audioEnabled);
      setHostVideoOff(!videoEnabled);
    });

    // Request initial host media status when audience joins
    if (role === "audience") {
      socket.emit("requestHostMediaStatus", { roomId });
    }

    if (role === "host") {
      socket.emit("requestUserList", { roomId });
    }

    return () => {
      socket.off("userList");
      socket.off("hostMediaStatus");
    };
  }, [roomId, role]);

  const joinChannel = async () => {
    if (isClientJoined) return;

    try {
      setError(null);

      await client.setClientRole(role === "host" ? "host" : "audience");

      client.on("user-published", handleUserPublished);
      client.on("user-unpublished", handleUserUnpublished);
      client.on("user-joined", handleUserJoined);
      client.on("user-left", handleUserLeft);

      await client.join(process.env.NEXT_PUBLIC_AGORA_APP_ID, roomId, token, Number(userId));

      setIsClientJoined(true);

      if (role === "host" && !isPublishing) {
        await publishLocalTracks();
        const socket = getSocket();
        if (socket) socket.emit("requestUserList", { roomId });
      }
    } catch (err) {
      setError(`Failed to join: ${err.message}`);
    }
  };

  const publishLocalTracks = async () => {
    try {
      localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();

      localTracks.videoTrack.play(localPlayerRef.current);

      await client.publish([localTracks.audioTrack, localTracks.videoTrack]);
      setIsPublishing(true);
      
      // Notify all clients about initial media status
      notifyMediaStatus(true, true);
    } catch (err) {
      setError(`Failed to publish media: ${err.message}`);
    }
  };

  const handleUserJoined = (user) => {
    console.log("User joined:", user.uid);
    if (role === "host") {
      // When a new user joins and you're the host, send current media status
      notifyMediaStatus(micOn, cameraOn);
    }
  };

  const handleUserLeft = (user) => {
    console.log("User left:", user.uid);
    setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
    
    // If this was the host and you're audience, mark host as inactive
    if (role === "audience" && user.uid === getHostUid()) {
      setHostActive(false);
      setHostHasPublishedAudio(false);
      setHostHasPublishedVideo(false);
    }
  };

  const handleUserPublished = async (user, mediaType) => {
    await client.subscribe(user, mediaType);

    // Add to remote users if not already there
    setRemoteUsers((prev) => {
      if (!prev.some((u) => u.uid === user.uid)) {
        console.log("New remote user:", user.uid, mediaType);
        return [...prev, user];
      }
      return prev;
    });

    // Mark host as active if audience and update specific track availability
    if (role === "audience") {
      setHostActive(true);
      
      if (mediaType === "audio") {
        setHostHasPublishedAudio(true);
        setHostMuted(false); // Reset muted state when audio is published
      } else if (mediaType === "video") {
        setHostHasPublishedVideo(true);
        setHostVideoOff(false); // Reset video off state when video is published
      }
    }

    if (mediaType === "video" && allowAudienceVideo) {
      const el = remotePlayersRef.current[user.uid];
      if (el) {
        user.videoTrack?.play(el);
      }
    }

    if (mediaType === "audio" && allowAudienceAudio) {
      user.audioTrack?.play();
    }
  };

  const handleUserUnpublished = (user, mediaType) => {
    console.log("User unpublished:", user.uid, mediaType);
    
    // For audience: check if this is the host unpublishing tracks
    if (role === "audience") {
      if (mediaType === "audio") {
        setHostMuted(true);
        // Don't set hostHasPublishedAudio to false, as we still want to show the stream
      } else if (mediaType === "video") {
        setHostVideoOff(true);
        // Don't set hostHasPublishedVideo to false, we want to show placeholder
      }
    }
    
    // Don't remove user from list - just mark tracks as unavailable
    setRemoteUsers((prev) => 
      prev.map((u) => {
        if (u.uid === user.uid) {
          if (mediaType === "audio") {
            return { ...u, hasAudio: false };
          } else if (mediaType === "video") {
            return { ...u, hasVideo: false };
          }
        }
        return u;
      })
    );
  };

  const getHostUid = () => {
    // Find the host in connected users, could be optimized by storing host ID
    const hostUser = connectedUsers.find(user => user.role === "host");
    return hostUser ? Number(hostUser.userId) : null;
  };

  const leaveChannel = async () => {
    if (localTracks.videoTrack) {
      localTracks.videoTrack.stop();
      localTracks.videoTrack.close();
      localTracks.videoTrack = null;
    }

    if (localTracks.audioTrack) {
      localTracks.audioTrack.stop();
      localTracks.audioTrack.close();
      localTracks.audioTrack = null;
    }

    if (isClientJoined) {
      await client.leave();
      setIsClientJoined(false);
    }

    client.removeAllListeners();
    setIsPublishing(false);
    setRemoteUsers([]);
  };

  const toggleMic = async () => {
    if (localTracks.audioTrack) {
      const newMicState = !micOn;
      await localTracks.audioTrack.setEnabled(newMicState);
      setMicOn(newMicState);
      
      // Notify other users of the changed state
      notifyMediaStatus(newMicState, cameraOn);
    }
  };

  const toggleCamera = async () => {
    if (localTracks.videoTrack) {
      const newCameraState = !cameraOn;
      await localTracks.videoTrack.setEnabled(newCameraState);
      setCameraOn(newCameraState);
      
      // Notify other users of the changed state
      notifyMediaStatus(micOn, newCameraState);
    }
  };

  // Function to notify other clients about host's media status
  const notifyMediaStatus = (audioEnabled, videoEnabled) => {
    if (role === "host") {
      const socket = getSocket();
      if (socket) {
        socket.emit("hostMediaStatus", {
          roomId,
          audioEnabled,
          videoEnabled
        });
      }
    }
  };

  const toggleAudienceAudio = () => {
    const updated = !allowAudienceAudio;
    setAllowAudienceAudio(updated);
    localStorage.setItem(`${roomId}_allowAudio`, updated);
    
    // Update audio playback for existing remote users
    remoteUsers.forEach(user => {
      if (updated && user.audioTrack) {
        user.audioTrack.play();
      } else if (!updated && user.audioTrack) {
        user.audioTrack.stop();
      }
    });
    
    getSocket()?.emit("permissionChange", { roomId, type: "audio", allowed: updated });
  };

  const toggleAudienceVideo = () => {
    const updated = !allowAudienceVideo;
    setAllowAudienceVideo(updated);
    localStorage.setItem(`${roomId}_allowVideo`, updated);
    
    // Update video playback for existing remote users
    remoteUsers.forEach(user => {
      const el = remotePlayersRef.current[user.uid];
      if (updated && user.videoTrack && el) {
        user.videoTrack.play(el);
      } else if (!updated && user.videoTrack) {
        user.videoTrack.stop();
      }
    });
    
    getSocket()?.emit("permissionChange", { roomId, type: "video", allowed: updated });
  };

  const toggleUserList = () => {
    setShowUserList(!showUserList);
    if (!showUserList && role === "host") {
      getSocket()?.emit("requestUserList", { roomId });
    }
  };

  const kickUser = (uid) => {
    if (role === "host") {
      getSocket()?.emit("kickUser", { roomId, userIdToKick: uid });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-black">
        <FaSpinner className="animate-spin text-white text-3xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-black text-white">
        <div>
          <p className="text-red-500">{error}</p>
          <button onClick={joinChannel} className="mt-2 px-4 py-2 bg-blue-600 rounded">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Important change: Consider host active if either audio or video has been published
  const isHostStreamActive = hostHasPublishedAudio || hostHasPublishedVideo;

  return (
    <div className="relative h-full w-full bg-black text-white">
      {/* Viewer Count & User List */}
      <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-80 px-3 py-2 rounded flex gap-3 items-center z-10">
        <FaUsers />
        <span>{viewerCount} viewers</span>
        {role === "host" && (
          <button onClick={toggleUserList} className="text-sm underline">
            {showUserList ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>

      {showUserList && (
        <div className="absolute top-16 left-4 bg-gray-900 bg-opacity-90 p-4 rounded max-h-64 overflow-y-auto w-64 z-10">
          <div className="text-sm font-medium mb-2">Connected Users</div>
          <ul className="space-y-2 text-xs">
            {users.map((user) => (
              <li key={user.userId} className="flex justify-between items-center">
                <span>{user.username} ({user.role})</span>
                {user.role !== "host" && role === "host" && (
                  <button onClick={() => kickUser(user.userId)} className="text-red-400 text-xs px-2 py-1 bg-red-800 rounded">
                    Kick
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Host media status indicator for audience */}
      {role === "audience" && hostActive && (
        <div className="absolute top-4 right-4 bg-gray-800 bg-opacity-80 px-3 py-2 rounded z-10 flex items-center gap-2 top-[9px]">
          {hostMuted && <FaMicrophoneSlash className="text-red-500" title="Host muted" />}
          {hostVideoOff && <FaVideoSlash className="text-red-500" title="Host video off" />}
        </div>
      )}

      {/* Local video (host) */}
      {role === "host" && (
        <>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 z-10 left-[36%]">
            <button onClick={toggleMic} className={`p-3 rounded-full cursor-pointer ${micOn ? "bg-gray-700" : "bg-red-600"}`}>
              {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
            </button>
            <button onClick={toggleCamera} className={`p-3 rounded-full cursor-pointer ${cameraOn ? "bg-gray-700" : "bg-red-600"}`}>
              {cameraOn ? <FaVideo /> : <FaVideoSlash />}
            </button>
          </div>
          <div className="h-full w-full">
            <div ref={localPlayerRef} className="w-full h-full">
              {!cameraOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-center -ml-[335px]">
                    <FaVideoSlash className="mx-auto text-4xl mb-2" />
                    <p>Camera is off</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Remote video (audience) */}
      {role === "audience" && (
        <div className="h-full w-full">
          {isHostStreamActive ? (
            remoteUsers.map((user) => (
              <div key={user.uid} className="relative h-full w-full">
                {/* Video container always shows, even when host video is off */}
                <div 
                  ref={(el) => (remotePlayersRef.current[user.uid] = el)} 
                  className="w-full h-full"
                />
                
                {/* Show placeholder when host video is off */}
                {hostVideoOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-center -ml-[335px]">
                      <FaVideoSlash className="mx-auto text-4xl mb-2" />
                      <p>Host's camera is turned off</p>
                    </div>
                  </div>
                )}
                
                {/* Audio muted indicator */}
                {hostMuted && (
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 rounded-full p-2">
                    <FaMicrophoneSlash className="text-red-500" />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-white">Waiting for host to start streaming...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}