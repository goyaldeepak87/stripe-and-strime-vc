"use client";

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import socket from '@/lib/socket';
import { createAgoraClient, createTracks } from '@/lib/agora';

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
const CHANNEL = 'test-room';

export default function VideoCallPage() {
  const [joined, setJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const uid = useRef(Math.floor(Math.random() * 10000));
  const client = useRef(createAgoraClient());
  const localTracks = useRef([]);

  const joinCall = async () => {
    const res = await axios.get(`http://localhost:8003/v1/agora/token`, {
      params: {
        channel: CHANNEL,
        uid: uid.current,
      },
    });

    const token = res.data.token;
    localTracks.current = await createTracks();

    await client.current.join(APP_ID, CHANNEL, token, uid.current);
    await client.current.publish(localTracks.current);

    if (localVideoRef.current) {
      localTracks.current[1].play(localVideoRef.current);
    }

    setJoined(true);
    socket.emit('join-room', { room: CHANNEL, uid: uid.current });
  };

  useEffect(() => {
    if (localVideoRef.current) {
      joinCall();
    }

    client.current.on('user-published', async (user, mediaType) => {
      await client.current.subscribe(user, mediaType);
      if (mediaType === 'video') {
        setRemoteUsers((prev) => [...prev, user]);
        if (remoteVideoRef.current) {
          user.videoTrack?.play(remoteVideoRef.current);
        }
      }
    });

    client.current.on('user-unpublished', (user) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    });

    return () => {
      client.current.leave();
      localTracks.current.forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Agora 1-on-1 Video Call</h1>

      {!joined ? (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={joinCall}
        >
          Join Call
        </button>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-lg font-semibold">You</h2>
            <div
              ref={localVideoRef}
              className="w-full h-64 bg-black rounded-lg"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold">Remote User</h2>
            <div
              ref={remoteVideoRef}
              className="w-full h-64 bg-black rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
