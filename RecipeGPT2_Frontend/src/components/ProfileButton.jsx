import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import defaultProfilePic from "../assets/logos/profile.png";
import settingsIcon from "../assets/logos/settings.png";
import logoutIcon from "../assets/logos/logout.png";

const ProfileButton = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme } = useTheme();
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

  const handleSettings = () => {
    navigate("/settings");
    setShowDropdown(false);
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

  if (!isAuthenticated) return null;

  return (
    <div className="relative mr-6" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center space-x-2 hover:text-[#E63946] transition-colors focus:outline-none bg-transparent border-none ${
          theme === "light" ? "text-[#1D1D1D]" : "text-white"
        }`}
        title="Profile"
      >
        <img
          src={user?.profile_pic || defaultProfilePic}
          alt="Profile"
          className={`w-6 h-6 object-contain rounded-full ${
            theme === "light" ? "" : "brightness-0 invert"
          }`}
        />
        <span>Profile</span>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div
          className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${
            theme === "light"
              ? "bg-[#FFFDF9] border border-gray-200"
              : "bg-black border border-gray-700"
          }`}
        >
          <button
            onClick={handleSettings}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-[#E63946] hover:text-white transition-colors bg-transparent border-none focus:outline-none ${
              theme === "light" ? "text-gray-700" : "text-gray-200"
            }`}
          >
            <div className="flex items-center space-x-2">
              <img
                src={settingsIcon}
                alt="Settings"
                className={`w-4 h-4 object-contain ${
                  theme === "light" ? "" : "brightness-0 invert"
                }`}
              />
              <span>Settings</span>
            </div>
          </button>
          <div
            className={`h-px my-1 ${
              theme === "light" ? "bg-gray-200" : "bg-gray-700"
            }`}
          />
          <button
            onClick={handleLogout}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-[#E63946] hover:text-white transition-colors bg-transparent border-none focus:outline-none ${
              theme === "light" ? "text-gray-700" : "text-gray-200"
            }`}
          >
            <div className="flex items-center space-x-2">
              <img
                src={logoutIcon}
                alt="Logout"
                className={`w-4 h-4 object-contain ${
                  theme === "light" ? "" : "brightness-0 invert"
                }`}
              />
              <span>Logout</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileButton;
