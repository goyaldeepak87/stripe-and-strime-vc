// pages/videoCall.js
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { createClient, createMicrophoneAndCameraTracks } from 'agora-rtc-react';

const socket = io('http://localhost:5000'); // Ensure this matches your backend URL

const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID; // Add your Agora App ID
const client = createClient({ mode: 'rtc', codec: 'vp8' });
const { MicrophoneAndCameraProvider, useMicrophoneAndCameraTracks } = createMicrophoneAndCameraTracks();

const VideoCall = () => {
    const [roomId, setRoomId] = useState('');
    const [localTracks, setLocalTracks] = useState([]);
    const [remoteUsers, setRemoteUsers] = useState({});
    const [joined, setJoined] = useState(false);

    const videoRef = useRef();

    const joinRoom = async () => {
        const { localTracks } = await createMicrophoneAndCameraTracks();
        setLocalTracks(localTracks);
        await client.join(appId, roomId, null, null);
        localTracks[1].play('local-player');
        setJoined(true);
    };

    const leaveRoom = async () => {
        setJoined(false);
        localTracks.forEach(track => track.stop());
        await client.leave();
    };

    useEffect(() => {
        client.on('user-published', async (user, mediaType) => {
            await client.subscribe(user, mediaType);
            if (mediaType === 'video') {
                const remotePlayerContainer = document.createElement('div');
                remotePlayerContainer.id = user.uid.toString();
                videoRef.current.append(remotePlayerContainer);
                user.videoTrack.play(remotePlayerContainer.id);
            }
        });

        client.on('user-unpublished', (user, mediaType) => {
            if (mediaType === 'video') {
                const remotePlayerContainer = document.getElementById(user.uid.toString());
                if (remotePlayerContainer) {
                    remotePlayerContainer.remove();
                }
            }
        });

        socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        return () => {
            leaveRoom();
        };
    }, [client, localTracks]);

    return (
        <div>
            <input
                type="text"
                placeholder="Room ID"
                onChange={(e) => setRoomId(e.target.value)}
                value={roomId}
            />
            <button onClick={joinRoom} disabled={joined}>
                Join
            </button>
            <button onClick={leaveRoom} disabled={!joined}>
                Leave
            </button>
            <div id="local-player" style={{ width: '400px', height: '300px' }}></div>
            <div ref={videoRef} style={{ display: 'flex', flexWrap: 'wrap' }}></div>
        </div>
    );
};

export default function VideoCallPage() {
    return (
        <MicrophoneAndCameraProvider>
            <VideoCall />
        </MicrophoneAndCameraProvider>
    );
}
