// lib/socket.js
import io from 'socket.io-client';

let socket = null;

export function initSocket(roomId, username, userId, role = 'audience') {
  if (socket) {
    closeSocket();
  }

  // Connect to socket server with user info in query params
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
  console.log('Connecting to socket server at:', socketUrl);
  
  socket = io(socketUrl, {
    query: {
      roomId,
      username,
      userId,
      role
    },
    transports: ['websocket', 'polling'],  // Try WebSocket first, then fallback to polling
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  // Handle connection
  socket.on('connect', () => {
    console.log('Socket connected');
    
    // Join room with user info
    socket.emit('joinRoom', { 
      roomId, 
      user: { 
        userId, 
        username, 
        role 
      }
    });
    
    // If audience, request current host media status
    if (role === 'audience') {
      socket.emit('requestHostMediaStatus', { roomId });
    }
  });

  // Handle connection errors
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
  
  // Handle reconnection attempts
  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`Socket reconnection attempt ${attemptNumber}`);
  });
  
  // Handle reconnection failures
  socket.on('reconnect_failed', () => {
    console.error('Socket reconnection failed');
    alert('Failed to connect to the room. Please refresh the page and try again.');
  });
  
  // Listen for permission changes
  socket.on('permissionChange', ({ type, allowed }) => {
    console.log(`Permission changed: ${type} is now ${allowed ? 'allowed' : 'denied'}`);
    
    if (type === "audio") {
      localStorage.setItem(`${roomId}_allowAudio`, allowed);
      // Application will need to read this and apply audio permission changes
    } else if (type === "video") {
      localStorage.setItem(`${roomId}_allowVideo`, allowed);
      // Application will need to read this and apply video permission changes
    }
  });
  
  // Listen for kicks (for audience)
  socket.on('kickedFromRoom', () => {
    alert("You have been removed from this room by the host");
    window.location.href = "/"; // Redirect to home
  });

  return socket;
}

// Get the current socket instance
export function getSocket() {
  return socket;
}

// Close the socket connection
export function closeSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}