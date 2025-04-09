"use client";

import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { FaHeart, FaSmile, FaThumbsUp, FaFire, FaLaugh, FaClap, FaSurprise } from "react-icons/fa";

const REACTIONS = [
  { icon: <FaHeart className="text-red-500" />, label: "Love", key: "love" },
  { icon: <FaThumbsUp className="text-blue-500" />, label: "Like", key: "like" },
  { icon: <FaSmile className="text-yellow-500" />, label: "Smile", key: "smile" },
  { icon: <FaFire className="text-orange-500" />, label: "Fire", key: "fire" },
  { icon: <FaLaugh className="text-green-500" />, label: "Laugh", key: "laugh" },
  { icon: <FaClap className="text-purple-500" />, label: "Clap", key: "clap" },
  { icon: <FaSurprise className="text-pink-500" />, label: "Wow", key: "wow" },
];

const Reactions = ({ roomId, username }) => {
  const [socket, setSocket] = useState(null);
  const [activeReactions, setActiveReactions] = useState([]);
  
  // Connect to socket server
  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000");
    
    socketInstance.on("connect", () => {
      console.log("Connected to reaction server");
    });
    
    socketInstance.on("reaction", (reaction) => {
      // Add the new reaction with a unique ID
      const newReaction = {
        ...reaction,
        id: Date.now() + Math.random(),
        position: Math.random() * 80 + 10 // Random position between 10% and 90%
      };
      
      setActiveReactions(prev => [...prev, newReaction]);
      
      // Remove the reaction after animation completes
      setTimeout(() => {
        setActiveReactions(prev => prev.filter(r => r.id !== newReaction.id));
      }, 3000);
    });
    
    setSocket(socketInstance);
    
    return () => {
      socketInstance.disconnect();
    };
  }, [roomId]);
  
  const sendReaction = (reactionKey) => {
    if (!socket) return;
    
    socket.emit("send-reaction", {
      roomId,
      username,
      reaction: reactionKey
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Reactions Display */}
      <div className="flex-1 relative overflow-hidden">
        {activeReactions.map((reaction) => {
          const reactionObj = REACTIONS.find(r => r.key === reaction.reaction);
          if (!reactionObj) return null;
          
          return (
            <div
              key={reaction.id}
              className="absolute bottom-0 animate-float text-2xl"
              style={{
                left: `${reaction.position}%`,
                animation: "float 3s ease-out forwards"
              }}
            >
              {reactionObj.icon}
            </div>
          );
        })}
        
        {/* Animation keyframes defined in global CSS */}
        <style jsx global>{`
          @keyframes float {
            0% {
              transform: translateY(0);
              opacity: 1;
            }
            100% {
              transform: translateY(-120px);
              opacity: 0;
            }
          }
          
          .animate-float {
            animation: float 3s ease-out forwards;
          }
        `}</style>
      </div>
      
      {/* Reaction Buttons */}
      <div className="bg-gray-50 p-3">
        <h4 className="text-sm font-medium mb-2 text-gray-700">React to the stream</h4>
        <div className="flex justify-between">
          {REACTIONS.map((reaction) => (
            <button
              key={reaction.key}
              onClick={() => sendReaction(reaction.key)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title={reaction.label}
            >
              <span className="text-xl">{reaction.icon}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reactions;