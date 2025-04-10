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
import { EyeOff } from "react-feather";

const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });

let localTracks = {
  videoTrack: null,
  audioTrack: null
};

export default function LiveStream({ roomId, token, userId, role, isLoading, viewerCount = 0, users }) {
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

  const localPlayerRef = useRef(null);
  const remotePlayersRef = useRef({});

  console.log("connectedUsers", connectedUsers, viewerCount);


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

    if (role === "host") {
      socket.emit("requestUserList", { roomId });
    }

    return () => socket.off("userList");
  }, [roomId, role]);

  const joinChannel = async () => {
    if (isClientJoined) return;

    try {
      setError(null);

      await client.setClientRole(role === "host" ? "host" : "audience");

      client.on("user-published", handleUserPublished);
      client.on("user-unpublished", handleUserUnpublished);

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
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();

    localTracks.videoTrack.play(localPlayerRef.current);

    await client.publish([localTracks.audioTrack, localTracks.videoTrack]);
    setIsPublishing(true);
  };

  const handleUserPublished = async (user, mediaType) => {
    await client.subscribe(user, mediaType);

    setRemoteUsers((prev) => {
      if (!prev.some((u) => u.uid === user.uid)) return [...prev, user];
      return prev;
    });

    if (mediaType === "video" && allowAudienceVideo) {
      const el = remotePlayersRef.current[user.uid];
      if (el) user.videoTrack?.play(el);
    }

    if (mediaType === "audio" && allowAudienceAudio) {
      user.audioTrack?.play();
    }
  };

  const handleUserUnpublished = (user) => {
    setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
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
      await localTracks.audioTrack.setEnabled(!micOn);
      setMicOn(!micOn);
    }
  };

  const toggleCamera = async () => {
    if (localTracks.videoTrack) {
      await localTracks.videoTrack.setEnabled(!cameraOn);
      setCameraOn(!cameraOn);
    }
  };

  const toggleAudienceAudio = () => {
    const updated = !allowAudienceAudio;
    setAllowAudienceAudio(updated);
    localStorage.setItem(`${roomId}_allowAudio`, updated);
    getSocket()?.emit("permissionChange", { roomId, type: "audio", allowed: updated });
  };

  const toggleAudienceVideo = () => {
    const updated = !allowAudienceVideo;
    setAllowAudienceVideo(updated);
    localStorage.setItem(`${roomId}_allowVideo`, updated);
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
                {user.role !== "host" && (
                  <button onClick={() => kickUser(user.userId)} className="text-red-400 text-xs px-2 py-1 bg-red-800 rounded">
                    Kick
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Audience Control (Host Only) */}
      {/* {role === "host" && (
        <div className="absolute top-4 right-4 bg-gray-800 bg-opacity-80 p-3 rounded z-10">
          <div className="text-sm font-medium mb-2 text-center">Audience Controls</div>
          <div className="space-y-2">
            <button onClick={toggleAudienceAudio} className={`flex items-center gap-2 p-2 rounded ${allowAudienceAudio ? "bg-green-600" : "bg-red-600"}`}>
              {allowAudienceAudio ? <FaVolumeUp /> : <FaVolumeMute />}
              {allowAudienceAudio ? "Audio On" : "Audio Off"}
            </button>
            <button onClick={toggleAudienceVideo} className={`flex items-center gap-2 p-2 rounded ${allowAudienceVideo ? "bg-green-600" : "bg-red-600"}`}>
              {allowAudienceVideo ? <FaEye /> : <FaEyeSlash />}
              {allowAudienceVideo ? "Video On" : "Video Off"}
            </button>
          </div>
        </div>
      )} */}

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
            <div ref={localPlayerRef} className="w-full h-full"></div>
          </div>
        </>
      )}

      {/* Remote video (audience) */}
      {remoteUsers.length > 0 ? (
        remoteUsers.map((user) => (
          <div key={user.uid} className="h-full w-full">
            <div ref={(el) => (remotePlayersRef.current[user.uid] = el)} className="w-full h-full" />
          </div>
        ))
      ) : role === "audience" ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-white pr-[325]">Waiting for host to start streaming...</p>
        </div>
      ) : null}
    </div>
  );
}
