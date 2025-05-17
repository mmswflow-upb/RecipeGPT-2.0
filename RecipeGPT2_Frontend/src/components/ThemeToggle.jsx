import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import sunIcon from "../assets/logos/sun.png";
import moonIcon from "../assets/logos/moon.png";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="bg-transparent border-none p-0 focus:outline-none hover:opacity-80 transition-opacity"
      aria-label="Toggle theme"
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      <img
        src={theme === "light" ? sunIcon : moonIcon}
        alt={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        className="w-6 h-6 object-contain"
        style={{
          filter:
            "brightness(0) saturate(100%) invert(24%) sepia(98%) saturate(2472%) hue-rotate(337deg) brightness(101%) contrast(97%)",
        }}
      />
    </button>
  );
};

export default ThemeToggle;
