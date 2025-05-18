import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import PageLayout from "../components/PageLayout";
import Alert from "../components/Alert";
import cameraIcon from "../assets/logos/camera.png";
import editIcon from "../assets/logos/edit.png";
import undoIcon from "../assets/logos/undo.png";
import lockIcon from "../assets/logos/lock.png";
import defaultProfile from "../assets/logos/profile.png";
import { userService } from "../services/api";

const PREFERENCE_CATEGORIES = [
  "Asian Cooking",
  "Mediterranean Cooking",
  "Latin American Cooking",
  "Middle Eastern & North African Cooking",
  "Indian & South Asian Cooking",
  "European Continental Cooking",
  "African Cooking",
  "American Cooking",
  "Vegetarian & Plant-Based",
  "Vegan",
  "Gluten-Free",
  "Low-Carb & Keto",
  "Paleo & Whole30",
  "Seafood & Pescatarian",
  "Desserts & Baking",
  "Breakfast & Brunch",
  "Street Food & Snacks",
  "Soups & Stews",
  "Salads & Grain Bowls",
  "Fusion & Modernist",
  "Halal",
  "Beverages",
];

const Settings = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPreferenceDropdown, setShowPreferenceDropdown] = useState(false);
  const [editableFields, setEditableFields] = useState({
    username: false,
    bio: false,
  });
  const [originalValues, setOriginalValues] = useState({
    username: "",
    bio: "",
    preferences: [],
  });
  const [hasChanges, setHasChanges] = useState({
    username: false,
    bio: false,
    preferences: false,
  });

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    profile_pic: "",
    bio: "",
    preferences: [],
  });

  useEffect(() => {
    // Load user data from localStorage
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setFormData({
        username: userData.username || "",
        email: userData.email || "",
        profile_pic: userData.profile_pic || "",
        bio: userData.bio || "",
        preferences: userData.preferences || [],
      });
      setOriginalValues({
        username: userData.username || "",
        bio: userData.bio || "",
        preferences: userData.preferences || [],
      });
    }
  }, []);

  if (!isAuthenticated) {
    navigate("/login", { replace: true });
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setHasChanges((prev) => ({
      ...prev,
      [name]: value !== originalValues[name],
    }));
  };

  const toggleEditField = (field) => {
    setEditableFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
    // Reset changes when closing edit mode
    if (editableFields[field]) {
      setHasChanges((prev) => ({
        ...prev,
        [field]: false,
      }));
    }
  };

  const handleUndo = (field) => {
    if (field === "preferences") {
      setFormData((prev) => ({
        ...prev,
        preferences: [...originalValues.preferences],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: originalValues[field],
      }));
    }
    setHasChanges((prev) => ({
      ...prev,
      [field]: false,
    }));
    if (field !== "preferences") {
      setEditableFields((prev) => ({
        ...prev,
        [field]: false,
      }));
    }
  };

  const handleAddPreference = (preference) => {
    if (!formData.preferences.includes(preference)) {
      setFormData((prev) => ({
        ...prev,
        preferences: [...prev.preferences, preference],
      }));
      setHasChanges((prev) => ({
        ...prev,
        preferences: true,
      }));
    }
    setShowPreferenceDropdown(false);
  };

  const handleRemovePreference = (preference) => {
    setFormData((prev) => ({
      ...prev,
      preferences: prev.preferences.filter((p) => p !== preference),
    }));
    setHasChanges((prev) => ({
      ...prev,
      preferences: true,
    }));
  };

  const handleChangePassword = () => {
    // TODO: Implement change password modal/form
  };

  const handleSaveChanges = async () => {
    try {
      // Call backend API to update user profile
      const updatedUser = await userService.updateProfile({
        username: formData.username,
        bio: formData.bio,
        profile_pic: formData.profile_pic,
        preferences: formData.preferences,
      });
      // Update localStorage with new data
      const userData = JSON.parse(localStorage.getItem("user"));
      const updatedUserData = {
        ...userData,
        ...updatedUser,
      };
      localStorage.setItem("user", JSON.stringify(updatedUserData));

      // Update original values after saving
      setOriginalValues({
        username: updatedUser.username,
        bio: updatedUser.bio,
        preferences: [...updatedUser.preferences],
      });

      // Reset all editable fields and changes
      setEditableFields({
        username: false,
        bio: false,
      });
      setHasChanges({
        username: false,
        bio: false,
        preferences: false,
      });

      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to update profile"
      );
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      username: originalValues.username,
      email: formData.email,
      profile_pic: formData.profile_pic,
      bio: originalValues.bio,
      preferences: [...originalValues.preferences],
    });
    // Reset editable fields and changes
    setEditableFields({
      username: false,
      bio: false,
    });
    setHasChanges({
      username: false,
      bio: false,
      preferences: false,
    });
    navigate(-1);
  };

  // Filter out already selected preferences
  const availablePreferences = PREFERENCE_CATEGORIES.filter(
    (pref) => !formData.preferences.includes(pref)
  );

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div id="profile-header" className="text-center mb-8">
            <div className="relative inline-block group">
              <img
                src={formData.profile_pic || defaultProfile}
                alt="Profile Picture"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg mb-4"
                style={{
                  filter:
                    theme === "dark"
                      ? "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)"
                      : "brightness(0) saturate(100%) invert(11%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)",
                }}
              />
              <button className="absolute inset-0 w-32 h-32 rounded-full bg-black bg-opacity-50 flex items-center justify-center text-[#E63946] hover:opacity-80 transition-all duration-200 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent opacity-0 group-hover:opacity-100">
                <img
                  src={cameraIcon}
                  alt="Change Photo"
                  className="w-12 h-12 object-contain"
                  style={{
                    filter:
                      "brightness(0) saturate(100%) invert(24%) sepia(98%) saturate(2472%) hue-rotate(337deg) brightness(101%) contrast(97%)",
                  }}
                />
              </button>
            </div>
            <h1
              className={`text-2xl font-bold ${
                theme === "dark" ? "text-white" : "text-[#1D1D1D]"
              }`}
            >
              Edit Profile
            </h1>
          </div>

          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          )}
          {success && (
            <Alert
              type="success"
              message={success}
              onClose={() => setSuccess(null)}
              autoClose={true}
            />
          )}

          <div
            id="profile-form"
            className={`${
              theme === "dark" ? "bg-[#222]" : "bg-white"
            } rounded-xl shadow-lg p-6`}
          >
            <div className="space-y-6">
              <div id="basic-info" className="space-y-4">
                <h2
                  className={`text-xl font-semibold ${
                    theme === "dark" ? "text-white" : "text-[#1D1D1D]"
                  } mb-4`}
                >
                  Basic Information
                </h2>
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      theme === "dark" ? "text-gray-300" : "text-[#6C757D]"
                    } mb-2`}
                  >
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      disabled={!editableFields.username}
                      className={`w-full px-4 py-2 border ${
                        theme === "dark"
                          ? editableFields.username
                            ? "border-gray-600 bg-[#333] text-white"
                            : "border-gray-600 bg-[#333] text-gray-400 cursor-not-allowed"
                          : editableFields.username
                          ? "border-gray-200 bg-white text-[#1D1D1D]"
                          : "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                      } rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent`}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                      {editableFields.username && hasChanges.username && (
                        <button
                          onClick={() => handleUndo("username")}
                          className="text-[#E63946] hover:opacity-80 transition-all duration-200 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent"
                        >
                          <img
                            src={undoIcon}
                            alt="Undo"
                            className="w-4 h-4 object-contain"
                            style={{
                              filter:
                                "brightness(0) saturate(100%) invert(24%) sepia(98%) saturate(2472%) hue-rotate(337deg) brightness(101%) contrast(97%)",
                            }}
                          />
                        </button>
                      )}
                      <button
                        onClick={() => toggleEditField("username")}
                        className="text-[#E63946] hover:opacity-80 transition-all duration-200 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent"
                      >
                        <img
                          src={editIcon}
                          alt="Edit"
                          className="w-4 h-4 object-contain"
                          style={{
                            filter:
                              "brightness(0) saturate(100%) invert(24%) sepia(98%) saturate(2472%) hue-rotate(337deg) brightness(101%) contrast(97%)",
                          }}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div id="contact-info" className="space-y-4">
                  <h2
                    className={`text-xl font-semibold ${
                      theme === "dark" ? "text-white" : "text-[#1D1D1D]"
                    } mb-4`}
                  >
                    Contact Information
                  </h2>
                  <div>
                    <label
                      className={`block text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-[#6C757D]"
                      } mb-2`}
                    >
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border ${
                          theme === "dark"
                            ? "border-gray-600 bg-[#333] text-gray-400 cursor-not-allowed"
                            : "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                        } rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent`}
                        disabled
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-[#6C757D]"
                      } mb-2`}
                    >
                      Bio
                    </label>
                    <div className="relative">
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!editableFields.bio}
                        rows="3"
                        className={`w-full px-4 py-2 border ${
                          theme === "dark"
                            ? editableFields.bio
                              ? "border-gray-600 bg-[#333] text-white"
                              : "border-gray-600 bg-[#333] text-gray-400 cursor-not-allowed"
                            : editableFields.bio
                            ? "border-gray-200 bg-white text-[#1D1D1D]"
                            : "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                        } rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent`}
                      />
                      <div className="absolute right-2 top-2 flex items-center space-x-2">
                        {editableFields.bio && hasChanges.bio && (
                          <button
                            onClick={() => handleUndo("bio")}
                            className="text-[#E63946] hover:opacity-80 transition-all duration-200 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent"
                          >
                            <img
                              src={undoIcon}
                              alt="Undo"
                              className="w-4 h-4 object-contain"
                              style={{
                                filter:
                                  "brightness(0) saturate(100%) invert(24%) sepia(98%) saturate(2472%) hue-rotate(337deg) brightness(101%) contrast(97%)",
                              }}
                            />
                          </button>
                        )}
                        <button
                          onClick={() => toggleEditField("bio")}
                          className="text-[#E63946] hover:opacity-80 transition-all duration-200 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent"
                        >
                          <img
                            src={editIcon}
                            alt="Edit"
                            className="w-4 h-4 object-contain"
                            style={{
                              filter:
                                "brightness(0) saturate(100%) invert(24%) sepia(98%) saturate(2472%) hue-rotate(337deg) brightness(101%) contrast(97%)",
                            }}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="preferences" className="space-y-4">
                  <h2
                    className={`text-xl font-semibold ${
                      theme === "dark" ? "text-white" : "text-[#1D1D1D]"
                    } mb-4`}
                  >
                    Dietary Preferences
                  </h2>
                  <div>
                    <label
                      className={`block text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-[#6C757D]"
                      } mb-2`}
                    >
                      Dietary Preferences
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {formData.preferences.map((preference, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 ${
                            theme === "dark"
                              ? "bg-gray-700 text-gray-300"
                              : "bg-[#F1FA8C] text-[#1D1D1D]"
                          } rounded-full text-sm flex items-center space-x-2`}
                        >
                          <span>{preference}</span>
                          <button
                            onClick={() => handleRemovePreference(preference)}
                            className="text-[#E63946] hover:opacity-80 transition-all duration-200 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </span>
                      ))}
                      <div className="relative flex items-center space-x-2">
                        <button
                          onClick={() =>
                            setShowPreferenceDropdown(!showPreferenceDropdown)
                          }
                          className={`px-3 py-1 border border-dashed ${
                            theme === "dark"
                              ? "border-[#E63946] text-[#E63946] hover:border-[#E63946]"
                              : "border-[#E63946] text-[#E63946] hover:border-[#E63946]"
                          } rounded-full text-sm hover:opacity-80 transition-all duration-200 focus:outline-none bg-transparent`}
                        >
                          <i className="fa-solid fa-plus"></i> Add
                        </button>
                        {hasChanges.preferences && (
                          <button
                            onClick={() => handleUndo("preferences")}
                            className="text-[#E63946] hover:opacity-80 transition-all duration-200 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent"
                          >
                            <img
                              src={undoIcon}
                              alt="Undo"
                              className="w-4 h-4 object-contain"
                              style={{
                                filter:
                                  "brightness(0) saturate(100%) invert(24%) sepia(98%) saturate(2472%) hue-rotate(337deg) brightness(101%) contrast(97%)",
                              }}
                            />
                          </button>
                        )}
                      </div>
                      {showPreferenceDropdown && (
                        <div
                          className={`absolute z-10 mt-2 w-64 rounded-md shadow-lg py-1 max-h-60 overflow-y-auto ${
                            theme === "light"
                              ? "bg-[#FFFDF9] border border-gray-200"
                              : "bg-black border border-gray-700"
                          }`}
                        >
                          {availablePreferences.map((preference) => (
                            <button
                              key={preference}
                              onClick={() => handleAddPreference(preference)}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-[#E63946] hover:text-white transition-colors bg-transparent border-none focus:outline-none ${
                                theme === "light"
                                  ? "text-gray-700"
                                  : "text-gray-200"
                              }`}
                            >
                              {preference}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div id="security" className="space-y-4">
                  <h2
                    className={`text-xl font-semibold ${
                      theme === "dark" ? "text-white" : "text-[#1D1D1D]"
                    } mb-4`}
                  >
                    Security
                  </h2>
                  <div>
                    <label
                      className={`block text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-[#6C757D]"
                      } mb-2`}
                    >
                      Password
                    </label>
                    <button
                      onClick={handleChangePassword}
                      className="flex items-center gap-1 text-[#E63946] hover:opacity-80 transition-all duration-200 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent pl-0"
                    >
                      <img
                        src={lockIcon}
                        alt="Change Password"
                        className="w-4 h-4 object-contain"
                        style={{
                          filter:
                            "brightness(0) saturate(100%) invert(24%) sepia(98%) saturate(2472%) hue-rotate(337deg) brightness(101%) contrast(97%)",
                        }}
                      />
                      <span>Change Password</span>
                    </button>
                  </div>
                </div>

                <div
                  id="profile-actions"
                  className="flex justify-end space-x-4 pt-6 border-t border-gray-200"
                >
                  <button
                    onClick={handleCancel}
                    className={`${
                      theme === "dark"
                        ? "text-gray-300 hover:text-white border-2 border-gray-600 hover:border-gray-600"
                        : "text-gray-600 hover:text-gray-800 border-2 border-gray-600 hover:border-gray-600"
                    } px-6 py-3 rounded-2xl transition-all duration-200 flex items-center space-x-2 focus:outline-none outline-none hover:outline-none bg-transparent`}
                  >
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="px-6 py-2 bg-[#E63946] text-white rounded-lg hover:opacity-80 transition-all duration-200 focus:outline-none border-none"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Settings;
