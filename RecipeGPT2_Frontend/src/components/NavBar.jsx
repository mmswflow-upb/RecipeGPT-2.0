import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

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
          {/* Right: Theme/Logout */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <>
                <span className="mr-4 hidden sm:inline">
                  Welcome, {user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-[#E63946] hover:text-[#cc333f] transition duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleThemeToggle}
                className="p-0 bg-transparent shadow-none focus:outline-none group"
              >
                <i className="fa-solid fa-sun text-xl text-[#E63946] group-hover:text-[#cc333f] group-focus:text-[#cc333f] dark:group-hover:text-white dark:group-focus:text-white transition-colors"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
