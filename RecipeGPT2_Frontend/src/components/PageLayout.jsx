import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import NavBar from "../components/Navbar";
import Footer from "../components/Footer";

const PageLayout = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div
      className={`flex flex-col min-h-screen ${
        theme === "light"
          ? "bg-[#FFFDF9] text-[#1D1D1D]"
          : "bg-black text-white"
      }`}
    >
      <NavBar />
      <main
        className={`flex flex-1 w-full pt-20 ${
          theme === "light" ? "bg-[#FFFDF9]" : "bg-black"
        }`}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
