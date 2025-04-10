// app/components/ReactionButton.js
export default function ReactionButton({ children, onSendReaction }) {
    return (
      <button 
        onClick={onSendReaction}
        className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg hover:bg-gray-600 transition"
      >
        {children}
      </button>
    );
  }