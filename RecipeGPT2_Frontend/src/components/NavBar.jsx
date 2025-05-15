import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import defaultProfilePic from "../assets/profile.png";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          {/* Left: Logo */}
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <i
              className={`fa-solid fa-utensils text-2xl ${
                theme === "light" ? "text-[#E63946]" : "text-[#E63946]"
              }`}
            ></i>
            <span className="text-xl font-bold">RecipeGPT</span>
          </Link>

          {/* Center: Navigation Links */}
          {isAuthenticated && (
            <div className="flex items-center space-x-6">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 hover:text-[#E63946] transition-colors"
              >
                <i className="fa-solid fa-house text-lg"></i>
                <span>Dashboard</span>
              </Link>
              <Link
                to="/generate"
                className="flex items-center space-x-2 hover:text-[#E63946] transition-colors"
              >
                <i className="fa-solid fa-wand-magic-sparkles text-lg"></i>
                <span>Generate Recipe</span>
              </Link>
              <Link
                to="/saved"
                className="flex items-center space-x-2 hover:text-[#E63946] transition-colors"
              >
                <i className="fa-solid fa-bookmark text-lg"></i>
                <span>Saved Recipes</span>
              </Link>
            </div>
          )}

          {/* Right: Theme/Profile */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="hover:opacity-80 transition-opacity focus:outline-none"
                  title="Profile"
                >
                  <img
                    src={user?.profile_pic || defaultProfilePic}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-[#E63946]"
                  />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div
                    className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${
                      theme === "light"
                        ? "bg-white border border-gray-200"
                        : "bg-[#222] border border-gray-700"
                    }`}
                  >
                    <button
                      onClick={handleLogout}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[#E63946] hover:text-white transition-colors ${
                        theme === "light" ? "text-gray-700" : "text-gray-200"
                      }`}
                    >
                      <i className="fa-solid fa-right-from-bracket mr-2"></i>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={handleThemeToggle}
              className="bg-transparent border-none p-0 focus:outline-none hover:opacity-80 transition-opacity"
              title={
                theme === "light"
                  ? "Switch to Dark Mode"
                  : "Switch to Light Mode"
              }
            >
              <i
                className={`fa-solid ${
                  theme === "light" ? "fa-sun" : "fa-moon"
                } text-xl text-[#E63946]`}
              ></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
