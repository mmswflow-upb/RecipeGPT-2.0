import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import starsIcon from "../assets/logos/stars.png";

const GenerateRecipeButton = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const isActive = location.pathname === "/generate";

  return (
    <Link
      to="/generate"
      className={`flex items-center space-x-2 transition-colors ${
        isActive ? "text-[#E63946]" : "hover:text-[#E63946]"
      }`}
    >
      <img
        src={starsIcon}
        alt="Generate Recipe"
        className={`w-6 h-6 object-contain ${
          theme === "light" ? "" : "brightness-0 invert"
        }`}
      />
      <span>Generate Recipe</span>
    </Link>
  );
};

export default GenerateRecipeButton;
