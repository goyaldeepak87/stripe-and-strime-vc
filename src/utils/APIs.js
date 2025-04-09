import axios from "axios";
import { io } from "socket.io-client";
import { DefaultHeader } from "./DefaultHeader";
import { API_BASE_URL } from "@/config/appBaseUrl";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const SERVER_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const getUserProfile = async () => {
    try {
        const res = await axios.get(`${API_BASE_URL}/user/api/user_list`, {
            headers: {
                ...await DefaultHeader(),
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching user profile:", error.message);
        throw error; // Rethrow the error for further handling if needed
    }
}

export const getpaymentSuccess = async ({sessionId}) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/user/api/payment_success?session_id=${sessionId}`, {
            headers: {
                ...await DefaultHeader(),
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching payment success:", error.message);
        throw error; // Rethrow the error for further handling if needed
    }
}


export const productPayment = async (cardData) => {  
    try {
        const res = await axios.post(`${API_BASE_URL}/user/api/checkout_sessions`, cardData, {
            headers: {
                ...await DefaultHeader(),
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching payment:", error.message);
        throw error; // Rethrow the error for further handling if needed
    }
}


// Get Agora token from our backend
// export const getAgoraToken = async ({ channelName, uid, role }) => {
//     try {
//       const response = await axios.post(`${API_URL}/token`, {
//         channelName,
//         uid,
//         role
//       });
//       return response.data;
//     } catch (error) {
//       console.error("Error getting Agora token:", error);
//       throw error;
//     }
//   };
  
//   // Join a room
//   export const joinRoom = async ({ roomId, username, role }) => {
//     try {
//       const response = await axios.post(`${API_URL}/rooms/join`, {
//         roomId,
//         username,
//         role
//       });
//       return response.data;
//     } catch (error) {
//       console.error("Error joining room:", error);
//       throw error;
//     }
//   };
  
//   // Leave a room
//   export const leaveRoom = async ({ roomId, username }) => {
//     try {
//       const response = await axios.post(`${API_URL}/rooms/leave`, {
//         roomId,
//         username
//       });
//       return response.data;
//     } catch (error) {
//       console.error("Error leaving room:", error);
//       throw error;
//     }
//   };
  
//   // Get room info
//   export const getRoomInfo = async (roomId) => {
//     try {
//       const response = await axios.get(`${API_URL}/rooms/${roomId}`);
//       return response.data;
//     } catch (error) {
//       console.error("Error getting room info:", error);
//       throw error;
//     }
//   };


// Configure axios with defaults
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.log("API Error:", error);
    
    // Check if we have a response in the error
    if (error.response) {
      // Server responded with a status code outside of 2xx
      console.log("Error response data:", error.response.data);
      console.log("Error response status:", error.response.status);
      
      // Customize error message based on status
      if (error.response.status === 404) {
        error.customMessage = "Resource not found. Please check if the URL is correct.";
      } else if (error.response.status === 500) {
        error.customMessage = "Server error. Please try again later.";
      }
    } else if (error.request) {
      // Request was made but no response received
      console.log("Error request:", error.request);
      error.customMessage = "No response from server. Please check your connection.";
    } else {
      // Something happened in setting up the request
      console.log("Error message:", error.message);
      error.customMessage = "Request failed. Please try again.";
    }
    
    return Promise.reject(error);
  }
);

// Create socket instance
export const socket = io(SERVER_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling']
});

// Socket connection management
export const connectSocket = () => {
  if (!socket.connected) {
    console.log("Connecting to socket server...");
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    console.log("Disconnecting from socket server...");
    socket.disconnect();
  }
};

// Log socket connection events
socket.on('connect', () => {
  console.log('Socket connected successfully');
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error.message);
});

// Get Agora token from our backend
export const getAgoraToken = async ({ channelName, uid, role }) => {
  try {
    console.log(`Getting token for channel: ${channelName}, uid: ${uid}, role: ${role}`);
    const response = await api.post(`/token`, {
      channelName,
      uid,
      role
    });
    console.log("Token received:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting Agora token:", error);
    throw error;
  }
};

// Create a room
export const createRoom = async ({ roomId, username, role }) => {
  try {
    const response = await api.post(`/rooms/create`, {
      roomId,
      username,
      role
    });
    return response.data;
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
};

// Join a room
export const joinRoom = async ({ roomId, username, role }) => {
  try {
    const response = await api.post(`/rooms/join`, {
      roomId,
      username,
      role
    });
    return response.data;
  } catch (error) {
    console.error("Error joining room:", error);
    throw error;
  }
};

// Leave a room
export const leaveRoom = async ({ roomId, userId }) => {
  try {
    const response = await api.post(`/rooms/leave`, {
      roomId,
      userId
    });
    return response.data;
  } catch (error) {
    console.error("Error leaving room:", error);
    throw error;
  }
};

// Get room info with better error handling
export const getRoomInfo = async (roomId) => {
  try {
    if (!roomId) {
      throw new Error("Room ID is required");
    }
    
    const response = await api.get(`/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting room info:", error);
    
    // Return a default response for 404 errors
    if (error.response && error.response.status === 404) {
      return {
        roomId,
        usersCount: 0,
        hostCount: 0,
        isActive: false,
        exists: false,
        success: false,
        error: "Room not found"
      };
    }
    
    throw error;
  }
};

// Get list of all rooms
export const getAllRooms = async () => {
  try {
    const response = await api.get(`/rooms`);
    return response.data;
  } catch (error) {
    console.error("Error getting rooms list:", error);
    throw error;
  }
};