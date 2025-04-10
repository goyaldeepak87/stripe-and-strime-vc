"use client";

import { useEffect, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash
} from "react-icons/fa";

// Agora client instance
const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });

export default function LiveStream({ roomId, token, userId, role, username }) {
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!token) return;

    const join = async () => {
      try {
        // Set role (host or audience)
        await client.setClientRole(role);

        // Join channel
        await client.join(
          process.env.NEXT_PUBLIC_AGORA_APP_ID,
          roomId,
          token,
          userId
        );

        setJoined(true);

        // If host, create and publish tracks
        if (role === "host") {
          const [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
          setLocalAudioTrack(micTrack);
          setLocalVideoTrack(camTrack);

          await client.publish([micTrack, camTrack]);
        }
      } catch (err) {
        console.error("Join error:", err);
      }
    };

    // Remote user published
    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType);

      if (mediaType === "video") {
        setRemoteUsers((prev) => {
          if (!prev.find((u) => u.uid === user.uid)) {
            return [...prev, user];
          }
          return prev;
        });
      }

      if (mediaType === "audio") {
        user.audioTrack?.play();
      }
    });

    // Handle unpublish/leave
    client.on("user-unpublished", (user, type) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    });

    client.on("user-left", (user) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    });

    join();

    return () => {
      if (localAudioTrack) localAudioTrack.close();
      if (localVideoTrack) localVideoTrack.close();
      client.removeAllListeners();
      if (joined) client.leave();
    };
  }, [token, roomId, userId, role]);

  // Play local video for host
  useEffect(() => {
    if (role === "host" && localVideoTrack) {
      localVideoTrack.play("local-player");
    }
  }, [localVideoTrack, role]);

  // Play remote video for audience
  useEffect(() => {
    if (role === "audience") {
      remoteUsers.forEach((user) => {
        user.videoTrack?.play(`remote-player-${user.uid}`);
      });
    }

    return () => {
      remoteUsers.forEach((user) => {
        user.videoTrack?.stop();
      });
    };
  }, [remoteUsers, role]);

  const toggleMic = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!micOn);
      setMicOn(!micOn);
    }
  };

  const toggleCamera = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!cameraOn);
      setCameraOn(!cameraOn);
    }
  };

  return (
    <div className="relative h-full w-full bg-black text-white">
      {/* Host view: local stream */}
      {role === "host" && (
        <div className="h-full w-full relative">
          <div id="local-player" className="h-full w-full" />

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
            <button
              onClick={toggleMic}
              className={`p-3 rounded-full ${micOn ? "bg-gray-700" : "bg-red-500"}`}
            >
              {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
            </button>
            <button
              onClick={toggleCamera}
              className={`p-3 rounded-full ${cameraOn ? "bg-gray-700" : "bg-red-500"}`}
            >
              {cameraOn ? <FaVideo /> : <FaVideoSlash />}
            </button>
          </div>
        </div>
      )}

      {/* Audience view: show host's remote video */}
      {role === "audience" && (
        <div className="h-full w-full flex items-center justify-center">
          {remoteUsers.length > 0 ? (
            remoteUsers.map((user) => (
              <div
                key={user.uid}
                id={`remote-player-${user.uid}`}
                className="w-full h-full"
              ></div>
            ))
          ) : (
            <p className="text-white">Waiting for host to start streaming...</p>
          )}
        </div>
      )}
    </div>
  );
}
