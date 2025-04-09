"use client";

import React, { useEffect, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { 
  AgoraRTCProvider, 
  useLocalCameraTrack, 
  useLocalMicrophoneTrack, 
  usePublish, 
  useJoin, 
  useRemoteUsers, 
  RemoteUser, 
  LocalUser 
} from "agora-rtc-react";

// Wrapper component to provide AgoraRTC context
const LiveStream = ({ appId, channel, token, uid, role }) => {
  // Create Agora RTC client - IMPORTANT: Set mode to "live" instead of "rtc"
  const [client] = useState(() => 
    AgoraRTC.createClient({ 
      mode: "live", // Using "live" mode which supports client roles
      codec: "vp8"
    })
  );

  return (
    <AgoraRTCProvider client={client}>
      <LiveStreamContent 
        appId={appId} 
        channel={channel} 
        token={token} 
        uid={uid} 
        role={role} 
        client={client} // Pass client to inner component
      />
    </AgoraRTCProvider>
  );
};

// Inner component that uses the Agora hooks
const LiveStreamContent = ({ appId, channel, token, uid, role, client }) => {
  const [isActive, setIsActive] = useState(false);
  const [micOn, setMicOn] = useState(role !== "audience");
  const [cameraOn, setCameraOn] = useState(role !== "audience");
  
  // Set client role based on user role
  useEffect(() => {
    const setClientRole = async () => {
      try {
        // Use the passed client instance instead of creating a new one
        if (role === "audience") {
          await client.setClientRole("audience");
        } else {
          await client.setClientRole("host");
        }
        console.log(`Client role set to: ${role === "audience" ? "audience" : "host"}`);
      } catch (error) {
        console.error("Error setting client role:", error);
      }
    };
    
    if (client && client.connectionState !== "DISCONNECTED") {
      setClientRole();
    }
  }, [role, client]);
  
  // Join the channel
  useJoin(
    { 
      appid: appId, 
      channel: channel, 
      token: token || null, 
      uid: uid 
    }, 
    isActive && token !== null
  );

  // Get local media tracks based on role
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn && role !== "audience");
  const { localCameraTrack } = useLocalCameraTrack(cameraOn && role !== "audience");
  
  // Publish local tracks if user is a host or co-host
  usePublish([localMicrophoneTrack, localCameraTrack]);
  
  // Get remote users in the channel
  const remoteUsers = useRemoteUsers();

  // Once we have a token, activate the connection
  useEffect(() => {
    if (token) {
      setIsActive(true);
    }
  }, [token]);

  const toggleMic = () => {
    if (role === "audience") return;
    setMicOn(!micOn);
  };

  const toggleCamera = () => {
    if (role === "audience") return;
    setCameraOn(!cameraOn);
  };

  return (
    <div className="w-full h-full bg-black flex flex-col">
      <div className="flex-1 relative">
        {/* Main video display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-2 h-full">
          {/* Show local video if host or co-host */}
          {(role === "host" || role === "cohost") && (
            <div className="relative bg-gray-800 rounded overflow-hidden w-full h-64">
              <LocalUser
                audioTrack={localMicrophoneTrack}
                cameraOn={cameraOn}
                micOn={micOn}
                videoTrack={localCameraTrack}
                className="w-full h-full object-cover"
              >
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-sm">
                  You ({role})
                </div>
              </LocalUser>
            </div>
          )}
          
          {/* Show remote users */}
          {remoteUsers.map((user) => (
            <div key={user.uid} className="relative bg-gray-800 rounded overflow-hidden w-full h-64">
              <RemoteUser
                user={user}
                className="w-full h-full object-cover"
              >
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-sm">
                  User {user.uid}
                </div>
              </RemoteUser>
            </div>
          ))}
          
          {/* Placeholder if no streams */}
          {role === "audience" && remoteUsers.length === 0 && (
            <div className="flex items-center justify-center bg-gray-800 rounded w-full h-64">
              <p className="text-white">Waiting for host to start the stream...</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Controls for host/co-host */}
      {(role === "host" || role === "cohost") && (
        <div className="bg-gray-900 p-4 flex justify-center space-x-4">
          <button 
            onClick={toggleMic}
            className={`p-3 rounded-full ${micOn ? 'bg-blue-600' : 'bg-red-600'}`}
          >
            {micOn ? '🎙️' : '🔇'}
          </button>
          <button 
            onClick={toggleCamera}
            className={`p-3 rounded-full ${cameraOn ? 'bg-blue-600' : 'bg-red-600'}`}
          >
            {cameraOn ? '📹' : '🚫'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LiveStream;