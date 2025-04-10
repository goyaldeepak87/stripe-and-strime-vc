"use client";

import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";

export default function UserControls({ 
  micMuted, 
  cameraMuted, 
  toggleMicrophone, 
  toggleCamera 
}) {
  return (
    <div className="bg-gray-800 p-4 flex justify-center space-x-4">
      <button
        onClick={toggleMicrophone}
        className={`p-3 rounded-full ${micMuted ? 'bg-red-500' : 'bg-blue-500'} text-white`}
      >
        {micMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
      </button>
      
      <button
        onClick={toggleCamera}
        className={`p-3 rounded-full ${cameraMuted ? 'bg-red-500' : 'bg-blue-500'} text-white`}
      >
        {cameraMuted ? <FaVideoSlash /> : <FaVideo />}
      </button>
    </div>
  );
}