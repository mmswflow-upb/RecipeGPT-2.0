import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import robotLogo from "../../assets/logos/robot.png";

const MessageBubble = ({ message, isUser, avatar }) => {
  const { theme } = useTheme();

  return (
    <div
      className={`flex items-start space-x-3 ${isUser ? "justify-end" : ""}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#E63946] flex items-center justify-center">
          <img
            src={robotLogo}
            alt="AI Assistant"
            className="w-6 h-6"
            style={{
              filter: "brightness(0) invert(1)",
            }}
          />
        </div>
      )}
      <div
        className={`rounded-lg p-3 max-w-[80%] ${
          isUser
            ? "bg-[#E63946] text-white"
            : theme === "dark"
            ? "bg-gray-700 text-gray-200"
            : "bg-gray-100 text-[#1D1D1D]"
        }`}
      >
        {typeof message === "string" ? (
          <p>{message}</p>
        ) : (
          <div className="space-y-2">
            {message.content}
            {message.options && (
              <div className="space-y-2 mt-3">
                {message.options.map((option, index) => (
                  <span
                    key={index}
                    className={`block p-2 rounded border ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-600 hover:border-[#E63946]"
                        : "bg-white border-gray-200 hover:border-[#E63946]"
                    } cursor-pointer`}
                    onClick={() => option.onClick && option.onClick()}
                  >
                    <div className="font-semibold">{option.title}</div>
                    {option.subtitle && (
                      <div className="text-sm text-[#6C757D]">
                        {option.subtitle}
                      </div>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full overflow-hidden">
          <img
            src={
              avatar ||
              "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg"
            }
            alt="User"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
