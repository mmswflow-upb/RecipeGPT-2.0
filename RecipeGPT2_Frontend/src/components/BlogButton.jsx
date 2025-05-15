import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const BlogButton = () => {
  const { theme } = useTheme();

  return (
    <Link
      to="/blog"
      className="flex items-center space-x-2 hover:text-[#E63946] transition-colors"
    >
      <i className="fa-solid fa-newspaper text-lg"></i>
      <span>Blog</span>
    </Link>
  );
};

export default BlogButton;
