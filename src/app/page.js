// app/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaVideo, FaEye } from "react-icons/fa";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleJoin = () => {
    if (!username.trim()) {
      return alert("Please enter your name");
    }
    
    if (!roomId.trim()) {
      return alert("Please enter a room ID");
    }
    
    // Store username in localStorage
    localStorage.setItem("username", username);
    
    // Navigate to room as audience
    router.push(`/room/${roomId}?role=audience`);
  };

  const handleCreateRoom = () => {
    if (!username.trim()) {
      return alert("Please enter your name");
    }
    
    // Generate a random room ID if not provided
    const newRoomId = roomId.trim() || Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Store username in localStorage
    localStorage.setItem("username", username);
    
    // Navigate to room as host
    router.push(`/room/${newRoomId}?role=host`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
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
                onClick={handleCreateRoom}
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
                onClick={handleJoin}
                className="w-full bg-blue-500 text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition"
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
  );
}