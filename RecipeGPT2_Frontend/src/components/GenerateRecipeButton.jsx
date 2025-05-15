import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const GenerateRecipeButton = () => {
  const { theme } = useTheme();

  return (
    <Link
      to="/generate"
      className="flex items-center space-x-2 hover:text-[#E63946] transition-colors"
    >
      <i className="fa-solid fa-wand-magic-sparkles text-lg"></i>
      <span>Generate Recipe</span>
    </Link>
  );
};

export default GenerateRecipeButton;
