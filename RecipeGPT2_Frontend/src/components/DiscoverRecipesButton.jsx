import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import compassIcon from "../assets/logos/compass.png";

const DiscoverRecipesButton = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const isActive = location.pathname === "/discover";

  return (
    <Link
      to="/discover"
      className={`flex items-center space-x-2 transition-colors ${
        isActive ? "text-[#E63946]" : "hover:text-[#E63946]"
      }`}
    >
      <img
        src={compassIcon}
        alt="Discover Recipes"
        className={`w-6 h-6 object-contain ${
          theme === "light" ? "" : "brightness-0 invert"
        }`}
      />
      <span>Discover</span>
    </Link>
  );
};

export default DiscoverRecipesButton;
