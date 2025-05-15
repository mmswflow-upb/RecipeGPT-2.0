import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const SavedRecipesButton = () => {
  const { theme } = useTheme();

  return (
    <Link
      to="/saved"
      className="flex items-center space-x-2 hover:text-[#E63946] transition-colors"
    >
      <i className="fa-solid fa-bookmark text-lg"></i>
      <span>Saved Recipes</span>
    </Link>
  );
};

export default SavedRecipesButton;
