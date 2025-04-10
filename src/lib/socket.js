// app/lib/socket.js
import { io } from "socket.io-client";

let socket;

export const initSocket = (roomId, username, userId) => {
  if (socket) {
    return socket;
  }
  
  const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  
  socket = io(SOCKET_SERVER_URL, {
    query: {
      roomId,
      username,
      userId
    }
  });
  
  socket.on("connect", () => {
    console.log("Connected to socket server");
    // Join the room
    socket.emit("joinRoom", { roomId, username, userId });
  });
  
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not initialized. Call initSocket first.");
  }
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = undefined;
  }
};