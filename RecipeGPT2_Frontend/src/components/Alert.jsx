import React, { useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

const Alert = ({ type = "error", message, onClose, autoClose = true }) => {
  const { theme } = useTheme();

  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Close after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const alertStyles = {
    error: {
      light: "bg-red-50 text-red-800 border-red-200",
      dark: "bg-red-900/50 text-red-200 border-red-800",
      icon: "fa-circle-exclamation text-red-500",
    },
    warning: {
      light: "bg-yellow-50 text-yellow-800 border-yellow-200",
      dark: "bg-yellow-900/50 text-yellow-200 border-yellow-800",
      icon: "fa-triangle-exclamation text-yellow-500",
    },
    success: {
      light: "bg-green-50 text-green-800 border-green-200",
      dark: "bg-green-900/50 text-green-200 border-green-800",
      icon: "fa-circle-check text-green-500",
    },
  };

  const styles = alertStyles[type];

  return (
    <div
      className={`${
        theme === "dark" ? styles.dark : styles.light
      } border rounded-lg p-4 mb-4 flex items-center justify-between relative`}
      role="alert"
    >
      <div className="flex items-center space-x-3">
        <i className={`fa-solid ${styles.icon} text-lg`}></i>
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onClose && !autoClose && (
        <button
          onClick={onClose}
          className={`${
            type === "error"
              ? "text-red-500 hover:text-red-700"
              : type === "warning"
              ? "text-yellow-500 hover:text-yellow-700"
              : "text-green-500 hover:text-green-700"
          } transition-colors bg-transparent border-none p-0 focus:outline-none`}
          aria-label="Close alert"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>
      )}
    </div>
  );
};

export default Alert;
