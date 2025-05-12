import React from "react";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDF9]">
      <Navbar />

      <main className="flex flex-1 items-center justify-center w-full bg-[#FFFDF9] py-8 pt-20">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
          <h1 className="text-2xl font-bold text-[#1D1D1D] mb-4">
            Welcome to RecipeGPT!
          </h1>
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
