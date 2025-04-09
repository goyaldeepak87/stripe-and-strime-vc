"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaVideo, FaUsers } from "react-icons/fa";

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [role, setRole] = useState("audience");

  const createRoom = () => {
    // Generate a random room ID if one isn't provided
    const generatedRoomId = roomId || Math.random().toString(36).substring(2, 9);
    router.push(`/room/${generatedRoomId}?role=host`);
  };

  const joinRoom = () => {
    if (!roomId) {
      alert("Please enter a Room ID to join");
      return;
    }
    router.push(`/room/${roomId}?role=${role}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">Live Streaming App</h1>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
              Room ID
            </label>
            <input
              type="text"
              id="roomId"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter Room ID (optional for create)"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>
          
          <div className="flex justify-between gap-4">
            <button
              onClick={createRoom}
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 w-1/2"
            >
              <FaVideo className="mr-2" />
              Create Room
            </button>
            
            <button
              onClick={joinRoom}
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 w-1/2"
            >
              <FaUsers className="mr-2" />
              Join Room
            </button>
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Join as
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            >
              <option value="audience">Audience</option>
              <option value="cohost">Co-Host</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}