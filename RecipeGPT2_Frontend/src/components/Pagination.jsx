import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import previousIcon from "../assets/logos/previous.png";
import nextIcon from "../assets/logos/next.png";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  const { theme } = useTheme();
  if (totalPages <= 1) return null;
  return (
    <div
      className={`flex justify-center items-center space-x-4 mt-6 ${className}`}
    >
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 rounded disabled:opacity-50 flex items-center bg-transparent border-none shadow-none hover:bg-transparent focus:outline-none"
        style={{ background: "none", border: "none", boxShadow: "none" }}
      >
        <img
          src={previousIcon}
          alt="Previous"
          className={`w-7 h-7 ${theme === "dark" ? "filter invert" : ""}`}
          style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
        />
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 rounded disabled:opacity-50 flex items-center bg-transparent border-none shadow-none hover:bg-transparent focus:outline-none"
        style={{ background: "none", border: "none", boxShadow: "none" }}
      >
        <img
          src={nextIcon}
          alt="Next"
          className={`w-7 h-7 ${theme === "dark" ? "filter invert" : ""}`}
          style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
        />
      </button>
    </div>
  );
};

export default Pagination;
