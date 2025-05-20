import React, { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";

const ChatInput = ({ onSend, isLoading }) => {
  const [message, setMessage] = useState("");
  const { theme } = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage("");
    }
  };

  return (
    <div className="p-4 border-t border-gray-200">
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className={`flex-1 px-4 py-2 rounded-lg border ${
            theme === "dark"
              ? "border-gray-600 bg-gray-700 text-white"
              : "border-gray-200 bg-white text-[#1D1D1D]"
          } focus:outline-none focus:border-[#E63946]`}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className={`bg-[#E63946] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 flex items-center space-x-2 ${
            (isLoading || !message.trim()) && "opacity-50 cursor-not-allowed"
          }`}
        >
          <i className="fa-solid fa-paper-plane"></i>
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
