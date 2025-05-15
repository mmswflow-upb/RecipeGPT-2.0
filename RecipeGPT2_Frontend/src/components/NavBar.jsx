import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import ProfileButton from "./ProfileButton";
import ThemeToggle from "./ThemeToggle";
import BlogButton from "./BlogButton";
import SavedRecipesButton from "./SavedRecipesButton";
import GenerateRecipeButton from "./GenerateRecipeButton";

const NavBar = () => {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();

  return (
    <nav
      className={`${
        theme === "light"
          ? "bg-[#FFFDF9] text-[#1D1D1D]"
          : "bg-black text-white"
      } border-b border-gray-200 fixed w-full top-0 z-50`}
    >
      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="flex justify-between items-center py-3 relative">
          {/* Left: Logo and Navigation */}
          <div className="flex items-center space-x-6">
            <Link
              to={isAuthenticated ? "/generate" : "/"}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <i
                className={`fa-solid fa-utensils text-2xl ${
                  theme === "light" ? "text-[#E63946]" : "text-[#E63946]"
                }`}
              ></i>
              <span className="text-xl font-bold">RecipeGPT</span>
            </Link>

            {isAuthenticated && (
              <>
                <GenerateRecipeButton />
                <SavedRecipesButton />
                <BlogButton />
              </>
            )}
          </div>

          {/* Right: Theme and Profile */}
          <div className="flex items-center">
            <ProfileButton />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
