"use client";

import { useState } from "react";

export default function UserControls({ socket, roomId }) {
  const [title, setTitle] = useState("");
  
  const updateStreamInfo = () => {
    if (!socket) return;
    
    socket.emit("update-stream-info", {
      roomId,
      title
    });
    
    alert("Stream information updated!");
  };
  
  const endStream = () => {
    if (!socket) return;
    
    if (window.confirm("Are you sure you want to end the stream?")) {
      socket.emit("end-stream", { roomId });
      window.location.href = "/";
    }
  };

  return (
    <div className="bg-white p-4 border-t border-gray-300 flex items-center justify-between">
      <div className="flex items-center space-x-4 w-2/3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Stream title (optional)"
          className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={updateStreamInfo}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Update
        </button>
      </div>
      
      <button
        onClick={endStream}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        End Stream
      </button>
    </div>
  );
}