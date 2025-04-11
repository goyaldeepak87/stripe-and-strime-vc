// app/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaVideo, FaEye, FaMicrophone, FaCamera, FaTimes } from "react-icons/fa";
import NaveBar from "@/components/NaveBar";
import { useSelector } from "react-redux";
import { RdirectUrlData } from "@/lang/RdirectUrl";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState({
    camera: null, // null = unknown, true = granted, false = denied
    microphone: null
  });
  const [loading, setLoading] = useState(false);
  const [previewStream, setPreviewStream] = useState(null);
  const { paymentStatus } = useSelector((state) => state.auth);

  // Load username from localStorage on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  // Check payment status and redirect if needed
  useEffect(() => {
    if (paymentStatus !== "paid") {
      router.push(RdirectUrlData.Home);
    }
  }, [paymentStatus, router]);

  // Clean up the preview stream when component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [previewStream]);

  // Close preview stream when modal closes
  useEffect(() => {
    if (!showPermissionModal && previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
      setPreviewStream(null);
    }
  }, [showPermissionModal, previewStream]);

  const checkMediaPermissions = async () => {
    if (!username.trim()) {
      return alert("Please enter your name");
    }

    if (!roomId.trim() && !isCreating) {
      return alert("Please enter a room ID");
    }

    // Store username in localStorage
    localStorage.setItem("username", username);

    // Show permission modal
    setShowPermissionModal(true);
    setLoading(true);

    try {
      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      // Store permission status
      setPermissionStatus({
        camera: true,
        microphone: true
      });
      
      // Keep stream for preview
      setPreviewStream(stream);
    } catch (error) {
      console.log("Permission error:", error);
      
      // Check which permission was denied
      if (error.name === "NotAllowedError") {
        // Both might be denied, we need to check individually
        try {
          await navigator.mediaDevices.getUserMedia({ video: true });
          setPermissionStatus(prev => ({ ...prev, camera: true }));
        } catch (e) {
          setPermissionStatus(prev => ({ ...prev, camera: false }));
        }
        
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          setPermissionStatus(prev => ({ ...prev, microphone: true }));
        } catch (e) {
          setPermissionStatus(prev => ({ ...prev, microphone: false }));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinStream = () => {
    // Close the preview stream
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
      setPreviewStream(null);
    }
    
    // Close modal
    setShowPermissionModal(false);
    
    // For joining an existing stream
    if (!isCreating) {
      // Open in a new tab
      const url = `${window.location.origin}${RdirectUrlData.ROME}/${roomId}?role=host`;
      window.open(url, '_blank');
    } else {
      // Generate a random room ID if not provided
      const newRoomId = roomId.trim() || Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Navigate to room as host
      router.push(`${RdirectUrlData.ROME}/${newRoomId}?role=host`);
    }
  };

  // If payment status is not "paid", return nothing (will redirect)
  if (paymentStatus !== "paid") {
    return null;
  }

  return (
    <div>
      <NaveBar />
      <div className="min-h bg-orange-200 min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Live Stream App</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {isCreating ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="Leave empty for random ID"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">If left empty, a random room ID will be generated</p>
                </div>

                <button
                  onClick={checkMediaPermissions}
                  className="w-full bg-blue-500 text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition"
                >
                  <FaVideo />
                  <span>Go Live</span>
                </button>

                <button
                  onClick={() => setIsCreating(false)}
                  className="w-full text-gray-600 p-2 hover:underline"
                >
                  Join a live stream instead
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room ID</label>
                  <input
                    type="text"
                    placeholder="Enter Room ID"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                  />
                </div>

                <button
                  onClick={checkMediaPermissions}
                  className="w-full cursor-pointer bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <FaEye />
                  <span>Join Stream</span>
                </button>

                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full text-gray-600 p-2 hover:underline"
                >
                  Create your own live stream
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button 
              onClick={() => {
                setShowPermissionModal(false);
                if (previewStream) {
                  previewStream.getTracks().forEach(track => track.stop());
                  setPreviewStream(null);
                }
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={20} />
            </button>
            
            <h2 className="text-xl font-bold mb-4">Camera & Microphone Access</h2>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p>Checking permissions...</p>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {/* Camera preview */}
                  <div className="bg-gray-100 rounded-lg overflow-hidden aspect-video relative">
                    {previewStream ? (
                      <video
                        ref={(videoEl) => {
                          if (videoEl && previewStream) {
                            videoEl.srcObject = previewStream;
                            videoEl.play().catch(e => console.error("Error playing video:", e));
                          }
                        }}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        {permissionStatus.camera === false ? (
                          <div className="text-center text-red-500">
                            <FaTimes className="mx-auto mb-2" size={32} />
                            <p>Camera access denied</p>
                          </div>
                        ) : (
                          <p>Camera preview unavailable</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Permission status */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <FaCamera className="mr-2" />
                      <span>Camera: </span>
                      {permissionStatus.camera === true ? (
                        <span className="ml-2 text-green-500 font-medium">Allowed</span>
                      ) : permissionStatus.camera === false ? (
                        <span className="ml-2 text-red-500 font-medium">Denied</span>
                      ) : (
                        <span className="ml-2 text-gray-500">Unknown</span>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <FaMicrophone className="mr-2" />
                      <span>Microphone: </span>
                      {permissionStatus.microphone === true ? (
                        <span className="ml-2 text-green-500 font-medium">Allowed</span>
                      ) : permissionStatus.microphone === false ? (
                        <span className="ml-2 text-red-500 font-medium">Denied</span>
                      ) : (
                        <span className="ml-2 text-gray-500">Unknown</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Instructions for denied permissions */}
                  {(permissionStatus.camera === false || permissionStatus.microphone === false) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                      <p className="font-medium text-yellow-800 mb-1">Permission Required</p>
                      <p className="text-yellow-700">
                        Please allow access to your camera and microphone in your browser settings.
                        Click the camera/lock icon in your address bar and change permissions.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setShowPermissionModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    
                    <button
                      onClick={handleJoinStream}
                      disabled={!permissionStatus.camera || !permissionStatus.microphone}
                      className={`px-4 py-2 rounded-lg text-white ${
                        permissionStatus.camera && permissionStatus.microphone
                          ? "bg-blue-500 hover:bg-blue-600"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {isCreating ? "Start Stream" : "Join Stream"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}