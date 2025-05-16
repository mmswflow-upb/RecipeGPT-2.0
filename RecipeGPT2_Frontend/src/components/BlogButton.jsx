import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import compassIcon from "../assets/compass.png";

const BlogButton = () => {
  const { theme } = useTheme();

  return (
    <Link
      to="/blog"
      className="flex items-center space-x-2 hover:text-[#E63946] transition-colors"
    >
      <img
        src={compassIcon}
        alt="Discover"
        className={`w-6 h-6 object-contain ${
          theme === "light" ? "" : "brightness-0 invert"
        }`}
      />
      <span>Discover</span>
    </Link>
  );
};

export default BlogButton;
