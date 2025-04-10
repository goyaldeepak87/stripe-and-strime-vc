"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import LiveStream from "@/components/LiveStream";
import Chat from "@/components/Chat";
import ReactionButton from "@/components/ReactionButton";
import ShareRoom from "@/components/ShareRoom";
import { initSocket, closeSocket, getSocket } from "@/lib/socket";
import { FaArrowLeft } from "react-icons/fa";

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const roomId = params.roomId;
  const role = searchParams.get("role") || "audience";

  console.log("rdfsdfs", role)
  const [userId] = useState(Math.floor(Math.random() * 10000));
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [messages, setMessages] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  // Initialize username from localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || `User-${userId}`;
    setUsername(storedUsername);
  }, [userId]);

  // Initialize socket connection
  useEffect(() => {
    if (!username) return;

    setIsLoading(true);

    // Initialize socket connection
    const socket = initSocket(roomId, username, userId, role);

    // Listen for messages
    socket.on("message", (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for reactions
    socket.on("reaction", (reaction) => {
      setReactions(prev => [...prev, reaction]);

      // Remove reaction after animation
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== reaction.id));
      }, 3000);
    });

    // Listen for viewer count updates
    socket.on("viewerCount", (count) => {
      console.log("Viewer count:", count);
      setViewerCount(count);
    });

    socket.on("roomUsers", (users) => {
      console.log("Connected users:", users);
      setConnectedUsers(users);
    });

    // Request the initial user list
    socket.emit("requestUserList", { roomId });

    // Listen for being kicked from room
    socket.on("kickedFromRoom", () => {
      alert("You have been removed from this room by the host");
      router.push("/");
    });

    // Fetch token from backend
    const fetchToken = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            channelName: roomId,
            uid: userId,
            role: role === "host" ? "publisher" : "audience"
          }),
        });

        const data = await response.json();
        setToken(data.token);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch token:", error);
        setIsLoading(false);
      }
    };

    fetchToken();

    // Cleanup on unmount
    return () => {
      closeSocket();
    };
  }, [roomId, username, userId, role, router]);

  const sendMessage = (text) => {
    if (!text.trim()) return;

    try {
      const socket = getSocket();

      const message = {
        id: Date.now(),
        userId,
        username,
        text,
        timestamp: new Date().toISOString()
      };

      socket.emit("message", { roomId, message });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const sendReaction = (type) => {
    try {
      const socket = getSocket();

      const reaction = {
        id: Date.now(),
        userId,
        username,
        type,
        timestamp: new Date().toISOString()
      };

      socket.emit("reaction", { roomId, reaction });
    } catch (error) {
      console.error("Failed to send reaction:", error);
    }
  };
  const kickUser = (userIdToKick) => {
    if (role !== "host") return;

    try {
      const socket = getSocket();
      socket.emit("kickUser", { roomId, userIdToKick });
    } catch (error) {
      console.error("Failed to kick user:", error);
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    if (showUsers) setShowUsers(false);
  };

  console.log("Connected users:", connectedUsers);

  return (
    <div className="bg-gray-900 bg-gray-800 text-white">
      <div className="mx-auto max-w-7xl h-screen flex flex-col ">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 text-white">
          <button onClick={handleBack} className="text-white">
            <FaArrowLeft />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
              <span className="text-sm">LIVE</span>
            </div>
            <div className="text-sm">{viewerCount} viewing</div>
          </div>
          {role === "host" && <ShareRoom roomId={roomId} />}
        </div>

        {/* Main content */}
        <div className="flex-1 relative overflow-hidden">
          {/* Video stream */}
          <LiveStream
            roomId={roomId}
            token={token}
            userId={userId}
            role={role}
            isLoading={isLoading}
            viewerCount={viewerCount} // Pass the viewerCount
            users={connectedUsers}
            isHost={role === "host"}
            onKickUser={kickUser}
          />

          {/* Reactions overlay */}
          {/* <div className="absolute inset-0 pointer-events-none">
          {reactions.map((reaction) => (
            <div
              key={reaction.id}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 80 + 10}%`,
                bottom: '20%'
              }}
            >
              <span className="text-4xl">{reaction.type}</span>
            </div>
          ))}
        </div> */}

          <div className="absolute inset-0 pointer-events-none">
            {reactions.map((reaction) => (
              <div
                key={reaction.id}
                className="absolute animate-slide-up"
                style={{
                  left: `${Math.random() * 80 + 10}%`,
                  bottom: '0%', // Start from the bottom
                }}
              >
                <span className="text-4xl">{reaction.type}</span>
              </div>
            ))}
          </div>

          {/* Chat panel (mobile) */}
          <div className={`absolute inset-0 bg-black bg-opacity-50 transition-transform duration-300 transform ${showChat ? 'translate-y-0' : 'translate-y-full'} lg:hidden`}>
            <div className="h-full flex flex-col">
              <div className="p-2 text-white flex justify-between items-center">
                <span>Comments</span>
                <button onClick={toggleChat} className="text-white">Close</button>
              </div>
              <div className="flex-1 overflow-y-auto bg-gray-900 bg-opacity-90">
                <Chat
                  messages={messages}
                  username={username}
                  onSendMessage={sendMessage}
                />
              </div>
            </div>
          </div>

          {/* Desktop chat panel */}
          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-80 bg-gray-900 bg-opacity-90">
            <Chat
              messages={messages}
              username={username}
              onSendMessage={sendMessage}
            />
          </div>
        </div>

        {/* Bottom controls */}
        <div className="p-4 flex justify-between">
          <button
            onClick={toggleChat}
            className="px-4 py-2 rounded-full bg-gray-700 text-white text-sm lg:hidden"
          >
            Comments
          </button>

          <div className="flex gap-2">
            <ReactionButton onSendReaction={() => sendReaction("❤️")}>❤️</ReactionButton>
            <ReactionButton onSendReaction={() => sendReaction("👍")}>👍</ReactionButton>
            <ReactionButton onSendReaction={() => sendReaction("🔥")}>🔥</ReactionButton>
            <ReactionButton onSendReaction={() => sendReaction("👏")}>👏</ReactionButton>
            <ReactionButton onSendReaction={() => sendReaction("😮")}>😮</ReactionButton>
          </div>
        </div>
      </div>
    </div>
  );
}