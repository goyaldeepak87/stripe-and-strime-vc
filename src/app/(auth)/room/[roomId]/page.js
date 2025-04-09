"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams} from "next/navigation";
import LiveStream from "@/components/LiveStream";
import Chat from "@/components/Chat";
import UserControls from "@/components/UserControls";
import { io } from "socket.io-client";
import axios from "axios";

export default function RoomPage({ params }) {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "audience";
  const {roomId} = useParams();
  
  const [socket, setSocket] = useState(null);
  const [token, setToken] = useState(null);
  const [uid, setUid] = useState(Math.floor(Math.random() * 10000));
  const [messages, setMessages] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [viewers, setViewers] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [hostUid, setHostUid] = useState(null);

  // Generate Agora token
  useEffect(() => {
    const generateToken = async () => {
      try {
        const response = await axios.post("http://localhost:4000/api/token", {
          channelName: roomId,
          uid,
          role: role === "audience" ? "audience" : "publisher" // Host and cohost are publishers
        });
        setToken(response.data.token);
      } catch (error) {
        console.error("Failed to get token:", error);
      }
    };

    generateToken();
  }, [roomId, uid, role]);

  // Initialize Socket.io connection
  useEffect(() => {
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
      
      // Join the room
      newSocket.emit("join-room", {
        roomId,
        uid,
        username: `User-${uid}`,
        role
      });
    });

    newSocket.on("update-viewers", (count) => {
      setViewers(count);
    });

    newSocket.on("chat-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on("reaction", (reaction) => {
      setReactions((prev) => [...prev, { ...reaction, id: Date.now() }]);
      
      // Remove the reaction after 2 seconds
      setTimeout(() => {
        setReactions((prev) => prev.filter(r => r.id !== reaction.id));
      }, 2000);
    });

    newSocket.on("host-connected", (hostId) => {
      setHostUid(hostId);
    });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [roomId, uid, role]);

  const sendMessage = (text) => {
    if (!socket || !text.trim()) return;
    
    const message = {
      roomId,
      uid,
      username: `User-${uid}`,
      text,
      timestamp: new Date().toISOString()
    };
    
    socket.emit("chat-message", message);
  };

  const sendReaction = (type) => {
    if (!socket) return;
    
    const reaction = {
      roomId,
      uid,
      type,
      position: {
        x: Math.random() * 80 + 10, // Random position between 10% and 90%
        y: Math.random() * 40 + 50  // Random position between 50% and 90%
      }
    };
    
    socket.emit("reaction", reaction);
  };

  const shareRoom = (joinRole = "audience") => {
    const url = `${window.location.origin}/room/${roomId}?role=${joinRole}`;
    navigator.clipboard.writeText(url)
      .then(() => alert("Link copied to clipboard!"))
      .catch(err => console.error("Failed to copy link:", err));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Room: {roomId}</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">{viewers} viewers</span>
          {(role === "host" || role === "cohost") && (
            <button 
              onClick={() => shareRoom("cohost")} 
              className="px-3 py-1 bg-purple-600 text-white rounded text-sm"
            >
              Invite Co-host
            </button>
          )}
          <button 
            onClick={() => shareRoom("audience")} 
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            Share
          </button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-3/4 flex flex-col">
          <div className="flex-1 relative">
            <LiveStream 
              appId={process.env.NEXT_PUBLIC_AGORA_APP_ID || "your-agora-app-id"} 
              channel={roomId} 
              token={token} 
              uid={uid} 
              role={role}
            />
            
            <div className="absolute inset-0 pointer-events-none">
              {reactions.map((reaction) => (
                <div 
                  key={reaction.id} 
                  className="absolute animate-float text-2xl"
                  style={{ 
                    left: `${reaction.position.x}%`, 
                    bottom: `${reaction.position.y}%` 
                  }}
                >
                  {reaction.type === "heart" ? "❤️" : 
                   reaction.type === "like" ? "👍" : 
                   reaction.type === "laugh" ? "😂" : "👏"}
                </div>
              ))}
            </div>
          </div>
          
          {(role === "host" || role === "cohost") && (
            <UserControls 
              socket={socket} 
              roomId={roomId} 
            />
          )}
        </div>
        
        <div className="w-1/4 border-l border-gray-300 flex flex-col bg-white">
          <Chat 
            messages={messages} 
            sendMessage={sendMessage} 
            sendReaction={sendReaction} 
          />
        </div>
      </div>
    </div>
  );
}