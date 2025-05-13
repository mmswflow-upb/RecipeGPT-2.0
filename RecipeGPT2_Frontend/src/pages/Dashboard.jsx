import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <div
      className={`flex flex-col min-h-screen ${
        theme === "light"
          ? "bg-[#FFFDF9] text-[#1D1D1D]"
          : "bg-black text-white"
      }`}
    >
      <Navbar />

      <main
        className={`flex flex-1 items-center justify-center w-full py-8 pt-20 ${
          theme === "light" ? "bg-[#FFFDF9]" : "bg-black"
        }`}
      >
        <div
          className={`rounded-lg shadow-lg p-8 w-full max-w-2xl ${
            theme === "light" ? "bg-white" : "bg-[#222]"
          }`}
        >
          <h1 className="text-2xl font-bold mb-4">Welcome to RecipeGPT!</h1>
          <p className="text-[#6C757D]">
            You are now logged in. This is your dashboard where you can manage
            your recipes and preferences.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
