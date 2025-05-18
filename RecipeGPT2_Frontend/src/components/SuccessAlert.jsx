import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const SuccessAlert = ({ message, onClose }) => {
  const { theme } = useTheme();

  return (
    <div className="max-w-3xl mx-auto mb-8">
      <div
        className={`${
          theme === "light" ? "bg-green-50" : "bg-green-900"
        } border border-green-400 px-4 py-3 rounded relative flex items-center justify-between`}
        role="alert"
      >
        <span
          className={`block sm:inline ${
            theme === "light" ? "text-green-400" : "text-green-200"
          }`}
        >
          {message}
        </span>
        <button
          onClick={onClose}
          className="ml-4 bg-transparent border-none p-0 hover:opacity-80 transition-opacity focus:outline-none"
        >
          <svg
            className={`fill-current h-6 w-6 ${
              theme === "light" ? "text-green-400" : "text-green-200"
            }`}
            role="button"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <title>Close</title>
            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SuccessAlert;
