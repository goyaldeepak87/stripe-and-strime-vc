// components/VideoRoom.js
import React, { useEffect, useState, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

// Initialize Agora client
const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });

const VideoRoom = ({ roomId, username, role, userId, agoraToken, agoraUid }) => {
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenTrack, setScreenTrack] = useState(null);
  const localVideoRef = useRef(null);
  
  // Initialize and join channel
  useEffect(() => {
    const initializeAgora = async () => {
      try {
        // Set client role based on user role
        if (role === 'audience') {
          await client.setClientRole('audience');
        } else {
          await client.setClientRole('host');
        }
        
        // Register event handlers
        client.on('user-published', handleUserPublished);
        client.on('user-unpublished', handleUserUnpublished);
        client.on('user-joined', handleUserJoined);
        client.on('user-left', handleUserLeft);
        
        // Join the channel
        await client.join(
          process.env.NEXT_PUBLIC_AGORA_APP_ID || 'your-agora-app-id', 
          roomId, 
          agoraToken, 
          agoraUid
        );
        
        console.log('Joined Agora channel successfully');
        
        // If host or co-host, create and publish local tracks
        if (role === 'host' || role === 'cohost') {
          const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
          setLocalAudioTrack(audioTrack);
          setLocalVideoTrack(videoTrack);
          
          if (localVideoRef.current) {
            videoTrack.play(localVideoRef.current);
          }
          
          await client.publish([audioTrack, videoTrack]);
          setIsPublishing(true);
          console.log('Local tracks published');
        }
      } catch (error) {
        console.error('Error initializing Agora:', error);
      }
    };
    
    if (roomId && agoraToken && username) {
      initializeAgora();
    }
    
    // Cleanup function
    return () => {
      if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.close();
      }
      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
      }
      if (screenTrack) {
        screenTrack.stop();
        screenTrack.close();
      }
      
      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
      client.off('user-joined', handleUserJoined);
      client.off('user-left', handleUserLeft);
      
      // Leave the channel
      client.leave().catch(console.error);
    };
  }, [roomId, agoraToken, username, role]);
  
  // Handle when remote user publishes tracks
  const handleUserPublished = async (user, mediaType) => {
    await client.subscribe(user, mediaType);
    console.log('Subscribed to remote user:', user.uid);
    
    if (mediaType === 'video') {
      setRemoteUsers((prevUsers) => {
        // Check if user already exists
        if (prevUsers.some(u => u.uid === user.uid)) {
          return prevUsers.map(u => 
            u.uid === user.uid ? { ...u, hasVideo: true } : u
          );
        } else {
          return [...prevUsers, { ...user, hasVideo: true, hasAudio: false }];
        }
      });
      
      // Play video in a container
      setTimeout(() => {
        if (user.videoTrack) {
          user.videoTrack.play(`remote-video-${user.uid}`);
        }
      }, 100);
    }
    
    if (mediaType === 'audio') {
      setRemoteUsers((prevUsers) => {
        if (prevUsers.some(u => u.uid === user.uid)) {
          return prevUsers.map(u => 
            u.uid === user.uid ? { ...u, hasAudio: true } : u
          );
        } else {
          return [...prevUsers, { ...user, hasVideo: false, hasAudio: true }];
        }
      });
      
      user.audioTrack.play();
    }
  };
  
  // Handle when remote user unpublishes tracks
  const handleUserUnpublished = (user, mediaType) => {
    console.log('Remote user unpublished:', user.uid, mediaType);
    
    if (mediaType === 'video') {
      setRemoteUsers((prevUsers) => 
        prevUsers.map(u => 
          u.uid === user.uid ? { ...u, hasVideo: false } : u
        )
      );
    }
    
    if (mediaType === 'audio') {
      setRemoteUsers((prevUsers) => 
        prevUsers.map(u => 
          u.uid === user.uid ? { ...u, hasAudio: false } : u
        )
      );
    }
  };
  
  // Handle when remote user joins
  const handleUserJoined = (user) => {
    console.log('Remote user joined:', user.uid);
    setRemoteUsers((prevUsers) => {
      if (!prevUsers.some(u => u.uid === user.uid)) {
        return [...prevUsers, { ...user, hasVideo: false, hasAudio: false }];
      }
      return prevUsers;
    });
  };
  
  // Handle when remote user leaves
  const handleUserLeft = (user) => {
    console.log('Remote user left:', user.uid);
    setRemoteUsers((prevUsers) => prevUsers.filter(u => u.uid !== user.uid));
  };
  
  // Handle muting/unmuting audio
  const toggleAudio = async () => {
    if (localAudioTrack) {
      if (isMuted) {
        await localAudioTrack.setEnabled(true);
      } else {
        await localAudioTrack.setEnabled(false);
      }
      setIsMuted(!isMuted);
    }
  };
  
  // Handle turning video on/off
  const toggleVideo = async () => {
    if (localVideoTrack) {
      if (isVideoOff) {
        await localVideoTrack.setEnabled(true);
      } else {
        await localVideoTrack.setEnabled(false);
      }
      setIsVideoOff(!isVideoOff);
    }
  };
  
  // Handle screen sharing
  const toggleScreenSharing = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenTrack) {
        await client.unpublish(screenTrack);
        screenTrack.stop();
        screenTrack.close();
        setScreenTrack(null);
      }
      
      // Re-publish video track if it exists
      if (localVideoTrack) {
        await client.publish(localVideoTrack);
        if (localVideoRef.current) {
          localVideoTrack.play(localVideoRef.current);
        }
      }
    } else {
      try {
        // Create screen track
        const screenTrackTemp = await AgoraRTC.createScreenVideoTrack();
        setScreenTrack(screenTrackTemp);
        
        // Unpublish video track if it exists
        if (localVideoTrack) {
          await client.unpublish(localVideoTrack);
        }
        
        // Publish screen track
        await client.publish(screenTrackTemp);
        
        if (localVideoRef.current) {
          screenTrackTemp.play(localVideoRef.current);
        }
      } catch (error) {
        console.error('Error sharing screen:', error);
        return;
      }
    }
    
    setIsScreenSharing(!isScreenSharing);
  };
  
  return (
    <div className="bg-black rounded-lg overflow-hidden relative">
      {/* Stream container */}
      <div className="aspect-video w-full bg-gray-900 relative">
        {/* Main video area - shows either the active speaker or the local video for hosts */}
        {(role === 'host' || role === 'cohost') && (
          <div 
            ref={localVideoRef} 
            className="w-full h-full flex items-center justify-center text-white"
          >
            {isVideoOff && (
              <div className="bg-gray-800 w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center text-2xl mx-auto">
                    {username.substring(0, 1).toUpperCase()}
                  </div>
                  <p className="mt-2">{username}</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Remote users - in a grid for audience, or as smaller thumbnails for hosts */}
        <div className={`${role === 'audience' ? 'grid grid-cols-1 md:grid-cols-2 gap-2' : 'absolute bottom-4 right-4 flex space-x-2'}`}>
          {remoteUsers.map((user) => (
            <div 
              key={user.uid} 
              id={`remote-video-${user.uid}`}
              className={`${role === 'audience' ? 'w-full aspect-video' : 'w-32 h-24'} bg-gray-800 rounded overflow-hidden flex items-center justify-center text-white`}
            >
              {!user.hasVideo && (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                    U
                  </div>
                  <p className="text-xs mt-1">Remote User</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Controls - only for hosts and co-hosts */}
      {(role === 'host' || role === 'cohost') && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4 flex justify-center space-x-4">
          <button 
            onClick={toggleAudio} 
            className={`rounded-full p-3 ${isMuted ? 'bg-red-600' : 'bg-gray-700'}`}
          >
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
          <button 
            onClick={toggleVideo} 
            className={`rounded-full p-3 ${isVideoOff ? 'bg-red-600' : 'bg-gray-700'}`}
          >
            {isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
          </button>
          <button 
            onClick={toggleScreenSharing} 
            className={`rounded-full p-3 ${isScreenSharing ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
          </button>
        </div>
      )}
      
      {/* Audience view message */}
      {role === 'audience' && remoteUsers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-900 bg-opacity-80">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Waiting for the host to start streaming</h3>
            <p className="text-gray-300">The stream will begin soon...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoRoom;