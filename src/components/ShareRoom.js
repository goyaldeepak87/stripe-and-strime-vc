// app/components/ShareRoom.js
import { useState } from "react";
import { FaShare, FaCopy, FaCheck } from "react-icons/fa";

export default function ShareRoom({ roomId }) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleShareModal = () => {
    setShowShareModal(!showShareModal);
    setCopied(false);
  };

  const getShareUrl = (role) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/room/${roomId}?role=${role}`;
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative">
      <button onClick={toggleShareModal} className="text-white">
        <FaShare />
      </button>
      
      {showShareModal && (
        <div className="absolute right-0 top-10 w-72 bg-white rounded-lg shadow-lg p-4 z-50">
          <h3 className="font-semibold mb-3">Share this room</h3>
          
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500 mb-1">Join as co-host</div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getShareUrl("host")}
                  className="flex-1 bg-gray-100 p-2 rounded text-sm"
                />
                <button
                  onClick={() => copyToClipboard(getShareUrl("host"))}
                  className="p-2 text-blue-500"
                >
                  {copied ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500 mb-1">Join as audience</div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getShareUrl("audience")}
                  className="flex-1 bg-gray-100 p-2 rounded text-sm"
                />
                <button
                  onClick={() => copyToClipboard(getShareUrl("audience"))}
                  className="p-2 text-blue-500"
                >
                  {copied ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-3 text-right">
            <button
              onClick={toggleShareModal}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}