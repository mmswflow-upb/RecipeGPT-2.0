import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const SocialIcon = ({ icon, link, alt }) => {
  const { theme } = useTheme();

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="cursor-pointer group"
    >
      <img
        src={icon}
        alt={alt}
        className={`w-6 h-6 object-contain ${
          theme === "light" ? "brightness-0" : "brightness-0 invert"
        }`}
        style={{
          filter:
            "brightness(0) saturate(100%) invert(45%) sepia(8%) saturate(1097%) hue-rotate(169deg) brightness(92%) contrast(86%)",
        }}
        onMouseOver={(e) => {
          e.target.style.filter =
            "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)";
        }}
        onMouseOut={(e) => {
          e.target.style.filter =
            "brightness(0) saturate(100%) invert(45%) sepia(8%) saturate(1097%) hue-rotate(169deg) brightness(92%) contrast(86%)";
        }}
      />
    </a>
  );
};

export default SocialIcon;
