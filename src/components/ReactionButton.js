export default function ReactionButton({ emoji, onClick }) {
    return (
      <button
        onClick={onClick}
        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg transition-transform hover:scale-110"
      >
        {emoji}
      </button>
    );
  }