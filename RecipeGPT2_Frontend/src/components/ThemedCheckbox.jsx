import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const ThemedCheckbox = ({
  className = "",
  checked,
  onChange,
  id,
  ...props
}) => {
  const { theme } = useTheme();
  const boxBg =
    theme === "light"
      ? "bg-white border-gray-300"
      : "bg-[#222] border-gray-500";
  const checkColor = theme === "light" ? "text-[#E63946]" : "text-[#E63946]";

  return (
    <label
      className={`inline-flex items-center cursor-pointer select-none ${className}`}
      htmlFor={id}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
        {...props}
      />
      <span
        className={`w-4 h-4 flex items-center justify-center border rounded transition-colors duration-200 ${boxBg} ${
          checked ? checkColor : ""
        }`}
        tabIndex={0}
        aria-checked={checked}
        role="checkbox"
      >
        {checked && (
          <svg
            className="w-3 h-3"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="4 8.5 7 11.5 12 5.5" />
          </svg>
        )}
      </span>
    </label>
  );
};

export default ThemedCheckbox;
