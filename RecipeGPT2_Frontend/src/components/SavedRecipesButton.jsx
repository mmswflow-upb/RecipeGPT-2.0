import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import recipeBookIcon from "../assets/recipe-book.png";

const SavedRecipesButton = () => {
  const { theme } = useTheme();

  return (
    <Link
      to="/saved"
      className="flex items-center space-x-2 hover:text-[#E63946] transition-colors"
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
