import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import recipeBookIcon from "../assets/logos/recipe-book.png";

const SavedRecipesButton = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const isActive = location.pathname === "/saved";

  return (
    <Link
      to="/saved"
      className={`flex items-center space-x-2 transition-colors ${
        isActive ? "text-[#E63946]" : "hover:text-[#E63946]"
      }`}
    >
      <img
        src={recipeBookIcon}
        alt="Saved Recipes"
        className={`w-6 h-6 object-contain ${
          theme === "light" ? "" : "brightness-0 invert"
        }`}
      />
      <span>Saved Recipes</span>
    </Link>
  );
};

export default SavedRecipesButton;
