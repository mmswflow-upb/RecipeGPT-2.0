import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={handleThemeToggle}
      className="bg-transparent border-none p-0 focus:outline-none hover:opacity-80 transition-opacity"
      title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      <i
        className={`fa-solid ${
          theme === "light" ? "fa-sun" : "fa-moon"
        } text-xl text-[#E63946]`}
      ></i>
    </button>
  );
};

export default ThemeToggle;
