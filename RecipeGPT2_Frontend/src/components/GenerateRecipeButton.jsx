import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import starsIcon from "../assets/stars.png";

const GenerateRecipeButton = () => {
  const { theme } = useTheme();

  return (
    <Link
      to="/generate"
      className="flex items-center space-x-2 hover:text-[#E63946] transition-colors"
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
