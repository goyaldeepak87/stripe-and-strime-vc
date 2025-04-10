// app/components/Chat.js
"use client";

import { useState, useRef, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa";

export default function Chat({ messages, username, onSendMessage }) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-700 bg-gray-800">
        <h2 className="font-semibold text-white">Comments</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start space-x-2">
            <div className="flex-shrink-0 bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center">
              {msg.username.substring(0, 1).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline space-x-2">
                <span className="font-medium text-white">{msg.username}</span>
                <span className="text-xs text-gray-400">
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <div className="text-white break-words">{msg.text}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-700 bg-gray-800 flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-gray-700 text-white rounded-full px-4 py-2 border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit"
          disabled={!message.trim()}
          className="bg-blue-500 text-white rounded-full p-2 disabled:opacity-50"
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}