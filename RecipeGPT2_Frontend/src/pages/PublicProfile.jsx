import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import PageLayout from "../components/PageLayout";
import Alert from "../components/Alert";
import { userService } from "../services/api";
import profilePic from "../assets/logos/profile.png";

const PublicProfile = () => {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // If we have publisher data from navigation state, use it
        if (location.state?.publisher) {
          setProfile(location.state.publisher);
          setLoading(false);
          return;
        }

        // Otherwise fetch from API
        const data = await userService.getPublisherProfile(userId);
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, location.state]);

  if (!isAuthenticated) {
    navigate("/login", { replace: true });
    return null;
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading profile...</div>
        </div>
      </PageLayout>
    );
  }

  if (error || !profile) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <Alert type="error" message={error || "Profile not found"} />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div
        className={`container mx-auto px-4 py-8 mb-16 ${
          theme === "dark" ? "bg-[#1a1a1a]" : "bg-[#FFFDF9]"
        } rounded-3xl`}
      >
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className={`mb-6 flex items-center space-x-2 px-4 py-2 rounded-2xl text-[#E63946] hover:opacity-80 transition-all duration-200 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent`}
          >
            <i className="fa-solid fa-arrow-left"></i>
            <span>Back</span>
          </button>

          <div className="flex flex-col items-center space-y-6">
            {/* Profile Picture */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden">
              <img
                src={profile.profile_pic || profilePic}
                alt={profile.username}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Username */}
            <h1
              className={`text-2xl font-bold ${
                theme === "dark" ? "text-white" : "text-[#1D1D1D]"
              }`}
            >
              {profile.username}
            </h1>

            {/* Email */}
            <p
              className={`text-sm ${
                theme === "dark" ? "text-gray-300" : "text-[#6C757D]"
              }`}
            >
              {profile.email}
            </p>

            {/* Bio */}
            {profile.bio && (
              <div
                className={`w-full p-6 rounded-2xl ${
                  theme === "dark" ? "bg-[#222]" : "bg-white"
                } shadow-md`}
              >
                <h2
                  className={`text-lg font-semibold mb-3 ${
                    theme === "dark" ? "text-white" : "text-[#1D1D1D]"
                  }`}
                >
                  About
                </h2>
                <p
                  className={`${
                    theme === "dark" ? "text-gray-300" : "text-[#6C757D]"
                  }`}
                >
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Preferences */}
            {profile.preferences && profile.preferences.length > 0 && (
              <div className="w-full">
                <h2
                  className={`text-lg font-semibold mb-3 ${
                    theme === "dark" ? "text-white" : "text-[#1D1D1D]"
                  }`}
                >
                  Cooking Preferences
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.preferences.map((preference, idx) => (
                    <span
                      key={idx}
                      className={`text-sm px-3 py-1 rounded-full ${
                        theme === "light"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {preference}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default PublicProfile;
