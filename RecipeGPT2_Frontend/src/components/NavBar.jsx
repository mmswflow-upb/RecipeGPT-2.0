import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <nav className="bg-[#FFFDF9] border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="flex justify-center items-center py-3 relative">
          {/* Centered Logo */}
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <i className="fa-solid fa-utensils text-[#E63946] text-2xl"></i>
            <span className="text-xl font-bold text-[#1D1D1D]">RecipeGPT</span>
          </Link>
          {/* Right section absolutely positioned */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
            {isAuthenticated ? (
              <>
                <span className="text-[#1D1D1D] mr-4 hidden sm:inline">
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
              <button className="text-[#1D1D1D] hover:text-[#E63946]">
                <i className="fa-solid fa-sun text-xl"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
