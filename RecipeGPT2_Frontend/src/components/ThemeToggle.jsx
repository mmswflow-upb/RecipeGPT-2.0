import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="bg-transparent border-none p-0 focus:outline-none hover:opacity-80 transition-opacity"
      aria-label="Toggle theme"
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      <i className="fa-solid fa-sun text-xl text-[#E63946]"></i>
    </button>
  );
};

export default ThemeToggle;
