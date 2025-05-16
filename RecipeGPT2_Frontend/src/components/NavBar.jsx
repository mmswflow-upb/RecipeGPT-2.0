import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import ProfileButton from "./ProfileButton";
import ThemeToggle from "./ThemeToggle";
import BlogButton from "./BlogButton";
import SavedRecipesButton from "./SavedRecipesButton";
import GenerateRecipeButton from "./GenerateRecipeButton";
import forkAndKnifeIcon from "../assets/fork-and-knife.png";

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
              <img
                src={forkAndKnifeIcon}
                alt="RecipeGPT"
                className="w-8 h-8 object-contain [filter:invert(24%)_sepia(98%)_saturate(2472%)_hue-rotate(337deg)_brightness(101%)_contrast(97%)]"
              />
              <span className="text-2xl font-bold">RecipeGPT</span>
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
