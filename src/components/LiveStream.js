'use client';
import React, { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import axios from "axios";
import io from "socket.io-client";

// Initialize Agora RTC client
const client = AgoraRTC.createClient({ mode: "live", codec: "h264" });

const LiveStream = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [token, setToken] = useState("");
  const [channelName, setChannelName] = useState("testChannel");
  const [userId, setUserId] = useState("user1");
  const [comments, setComments] = useState([]);
  const [reaction, setReaction] = useState("");
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Initialize WebSocket client
  const socket = useRef(null);

  useEffect(() => {
    if (isStreaming) {
      startStreaming();
    }

    // Initialize WebSocket connection
    socket.current = io("http://localhost:5000");  // Your WebSocket server URL

    // Listen for new comments and reactions
    socket.current.on("new-comment", (message) => {
      setComments((prev) => [...prev, message]);
    });

    socket.current.on("new-reaction", (reaction) => {
      setReaction(reaction);
    });

    return () => {
      socket.current.disconnect();
      stopStreaming();
    };
  }, [isStreaming]);

  // Function to get the token from the backend
  const getToken = async () => {
    try {
      const response = await axios.post("http://localhost:5000/generate-token", {
        channelName,
        userId,
      });
      setToken(response.data.token);
    } catch (error) {
      console.error("Error generating token:", error);
    }
  };

  const startStreaming = async () => {
    await getToken();

    // Join the Agora channel as the publisher (host)
    await client.join(process.env.NEXT_PUBLIC_AGORA_APP_ID, channelName, token, userId);

    // Create and publish the local video track
    const localTrack = await AgoraRTC.createCameraVideoTrack();
    localTrack.play(localVideoRef.current);

    // Publish the local track (this is for the host, the one who streams)
    await client.publish([localTrack]);

    setIsStreaming(true);
  };

  const stopStreaming = async () => {
    // Leave the channel and stop the stream
    await client.leave();
    setIsStreaming(false);
  };

  // Handle new comments
  const handleCommentSubmit = (comment) => {
    socket.current.emit("send-comment", { userId, comment });
  };

  // Handle reactions
  const handleReaction = (reaction) => {
    socket.current.emit("send-reaction", { userId, reaction });
    setReaction(reaction);
  };

  useEffect(() => {
    // Listen for remote users (viewers)
    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === "video") {
        const remoteTrack = user.videoTrack;
        remoteTrack.play(remoteVideoRef.current);
      }
    });

    client.on("user-unpublished", (user, mediaType) => {
      if (mediaType === "video") {
        remoteVideoRef.current.srcObject = null;
      }
    });

    return () => {
      client.removeAllListeners();
    };
  }, []);

  return (
    <div>
      <h1>{isStreaming ? "Live Streaming!" : "Start Streaming"}</h1>
      <button onClick={() => setIsStreaming(!isStreaming)}>
        {isStreaming ? "Stop Streaming" : "Start Streaming"}
      </button>

      <div>
        <h2>Your Stream</h2>
        <video ref={localVideoRef} autoPlay muted width="300" />
      </div>

      <div>
        <h2>Viewer's Stream</h2>
        <video ref={remoteVideoRef} autoPlay width="300" />
      </div>

      {/* Comments Section */}
      <div>
        <h3>Comments</h3>
        {comments.map((comment, index) => (
          <div key={index}>{comment.userId}: {comment.comment}</div>
        ))}
        <input
          type="text"
          placeholder="Type a comment..."
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleCommentSubmit(e.target.value);
              e.target.value = "";
            }
          }}
        />
      </div>

      {/* Reaction Section */}
      <div>
        <button onClick={() => handleReaction("👍")}>👍</button>
        <button onClick={() => handleReaction("❤️")}>❤️</button>
        <button onClick={() => handleReaction("😂")}>😂</button>
      </div>

      {/* Show Latest Reaction */}
      {reaction && <h3>Latest Reaction: {reaction}</h3>}
    </div>
  );
};

export default LiveStream;
