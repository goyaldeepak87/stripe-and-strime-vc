"use client";

import { useState, useRef, useEffect } from "react";
import ReactionButton from "./ReactionButton";

export default function Chat({ messages, sendMessage, sendReaction }) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage("");
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-lg">Live Chat</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">No messages yet</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="flex flex-col">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {msg.username.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="ml-2">
                  <p className="text-sm font-semibold">
                    {msg.username}
                    <span className="text-xs font-normal text-gray-500 ml-2">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </p>
                  <p className="text-sm mt-1">{msg.text}</p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2 mb-2">
          <ReactionButton emoji="❤️" onClick={() => sendReaction("heart")} />
          <ReactionButton emoji="👍" onClick={() => sendReaction("like")} />
          <ReactionButton emoji="😂" onClick={() => sendReaction("laugh")} />
          <ReactionButton emoji="👏" onClick={() => sendReaction("clap")} />
        </div>
        
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}