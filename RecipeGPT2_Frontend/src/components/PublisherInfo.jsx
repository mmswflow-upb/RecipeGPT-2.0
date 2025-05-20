import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import profilePic from "../assets/logos/profile.png";

const PublisherInfo = ({ publisher }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handlePublisherClick = (e) => {
    e.stopPropagation();
    navigate(`/profile/${publisher.id}`, {
      state: {
        publisher: {
          id: publisher.id,
          username: publisher.username,
          profile_pic: publisher.profile_pic,
          email: publisher.email,
          bio: publisher.bio,
          preferences: publisher.preferences,
        },
      },
    });
  };

  return (
    <div
      className="flex items-center space-x-2 mb-3 cursor-pointer transition-colors focus:outline-none bg-transparent border-none"
      onClick={handlePublisherClick}
    >
      <img
        src={publisher.profile_pic || profilePic}
        alt={publisher.username}
        className={`w-6 h-6 object-contain rounded-full ${
          theme === "light" ? "" : "brightness-0 invert"
        }`}
      />
      <span
        className={`text-sm ${
          theme === "light"
            ? "text-[#1D1D1D] hover:text-[#E63946]"
            : "text-white hover:text-[#E63946]"
        }`}
      >
        {publisher.username}
      </span>
    </div>
  );
};

export default PublisherInfo;
