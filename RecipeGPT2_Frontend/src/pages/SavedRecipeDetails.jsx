import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import PageLayout from "../components/PageLayout";
import Alert from "../components/Alert";
import { useAuth } from "../contexts/AuthContext";
import { getDefaultImage } from "../utils/categoryImageMap";
import clockIcon from "../assets/logos/clock.png";
import cookingIcon from "../assets/logos/cooking.png";
import servingIcon from "../assets/logos/serving.png";
import copyingIcon from "../assets/logos/copying.png";
import editIcon from "../assets/logos/edit.png";
import undoIcon from "../assets/logos/undo.png";
import binIcon from "../assets/logos/bin.png";
import cameraIcon from "../assets/logos/camera.png";
import globalIcon from "../assets/logos/global.png";
import lockIcon from "../assets/logos/lock.png";
import starIcon from "../assets/logos/star.png";
import aiAssistIcon from "../assets/logos/ai-assist.png";
import { userService } from "../services/api";
import PublisherInfo from "../components/PublisherInfo";

const SavedRecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [hasChanges, setHasChanges] = useState({
    title: false,
    description: false,
    ingredients: false,
    instructions: false,
    isPublic: false,
  });
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([
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
  ]);
  const [deleteAlert, setDeleteAlert] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveAlert, setSaveAlert] = useState(null);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById("category-dropdown");
      const addButton = document.getElementById("add-category-button");
      if (
        dropdown &&
        !dropdown.contains(event.target) &&
        !addButton?.contains(event.target)
      ) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get recipe from navigation state if available
  const recipe = location.state?.recipe || null;

  useEffect(() => {
    if (recipe && recipe.id && formData === null && originalData === null) {
      setFormData({ ...recipe, isPublic: recipe.public });
      setOriginalData({ ...recipe, isPublic: recipe.public });
    }
    // Only set on first mount, not on every recipe change
    // eslint-disable-next-line
  }, []);

  if (!isAuthenticated) {
    navigate("/login", { replace: true });
    return null;
  }

  if (!recipe || !recipe.id) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <Alert type="error" message="Recipe not found" />
        </div>
      </PageLayout>
    );
  }

  // Use formData for rendering, but fallback to recipe if formData is null
  const displayData = formData || recipe;

  const handleCopyRecipe = () => {
    const recipeText = `
Recipe: ${displayData.title}
Prep Time: ${displayData.estimatedPrepTime || "10"} mins
Cook Time: ${displayData.estimatedCookingTime || "20"} mins
Servings: ${displayData.servings || "2"}
${displayData.dietaryInfo ? `Dietary Info: ${displayData.dietaryInfo}` : ""}

Ingredients:
${displayData.ingredients.map((ing) => `- ${ing}`).join("\n")}

Instructions:
${displayData.instructions.map((inst, idx) => `${idx + 1}. ${inst}`).join("\n")}
    `;
    navigator.clipboard.writeText(recipeText);
    setShowCopyAlert(true);
    setTimeout(() => setShowCopyAlert(false), 3000);
  };

  const handleEditToggle = () => setEditMode((prev) => !prev);
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setHasChanges((prev) => ({
      ...prev,
      [name]: (type === "checkbox" ? checked : value) !== originalData[name],
    }));
  };
  const handleListChange = (field, idx, value) => {
    setFormData((prev) => {
      const updated = [...prev[field]];
      updated[idx] = value;
      return { ...prev, [field]: updated };
    });
    setHasChanges((prev) => ({
      ...prev,
      [field]: true,
    }));
  };
  const handleAddListItem = (field) => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
    setHasChanges((prev) => ({
      ...prev,
      [field]: true,
    }));
  };
  const handleRemoveListItem = (field, idx) => {
    setFormData((prev) => {
      const updated = prev[field].filter((_, i) => i !== idx);
      return { ...prev, [field]: updated };
    });
    setHasChanges((prev) => ({
      ...prev,
      [field]: true,
    }));
  };
  const handleUndo = (field) => {
    if (field === "ingredients" || field === "instructions") {
      setFormData((prev) => ({
        ...prev,
        [field]: [...originalData[field]],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: originalData[field],
      }));
    }
    setHasChanges((prev) => ({
      ...prev,
      [field]: false,
    }));
  };
  const handleCancel = () => {
    setFormData({ ...originalData });
    setEditMode(false);
    setHasChanges({
      title: false,
      description: false,
      ingredients: false,
      instructions: false,
      isPublic: false,
    });
  };
  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      if (displayData.isUserOwner) {
        await fetch(
          `${
            import.meta.env.VITE_SERVER_URL || "http://localhost:8080"
          }/api/recipes/${displayData.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } else {
        // Use the userService to delete saved recipes
        await userService.deleteSavedRecipes([displayData.id]);

        // Update local user data
        const user = JSON.parse(localStorage.getItem("user"));
        user.savedRecipes = (user?.savedRecipes || []).filter(
          (id) => id !== displayData.id
        );
        localStorage.setItem("user", JSON.stringify(user));
      }
      navigate("/saved");
    } catch (err) {
      setDeleteAlert("Failed to delete recipe. Please try again.");
    }
  };
  const handleSaveChanges = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_SERVER_URL || "http://localhost:8080"
        }/api/recipes/${displayData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            title: formData.title,
            categories: formData.categories,
            ingredients: formData.ingredients,
            instructions: formData.instructions,
            estimatedCookingTime: formData.estimatedCookingTime,
            estimatedPrepTime: formData.estimatedPrepTime,
            servings: formData.servings,
            image: formData.image,
            description: formData.description,
            isPublic: formData.isPublic,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to update recipe");
      const updatedRecipe = await response.json();
      setOriginalData({
        ...updatedRecipe,
        isUserOwner: displayData.isUserOwner,
      });
      setFormData({ ...updatedRecipe, isUserOwner: displayData.isUserOwner });
      setEditMode(false);
      setHasChanges({
        title: false,
        description: false,
        ingredients: false,
        instructions: false,
        isPublic: false,
      });
      setSaveAlert("Recipe updated successfully!");
      setTimeout(() => setSaveAlert(null), 3000);
    } catch (err) {
      setSaveAlert("Failed to update recipe. Please try again.");
    }
  };

  return (
    <PageLayout>
      <div
        className={`container mx-auto px-4 py-8 mb-16 ${
          theme === "dark" ? "bg-[#1a1a1a]" : "bg-[#FFFDF9]"
        } rounded-3xl`}
      >
        <div id="recipe-details" className="max-w-4xl mx-auto p-6">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className={`mb-6 flex items-center space-x-2 px-4 py-2 rounded-2xl text-[#E63946] hover:opacity-80 transition-all duration-200 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent`}
          >
            <i className="fa-solid fa-arrow-left"></i>
            <span>Back</span>
          </button>

          <div id="recipe-header" className="mb-8">
            <div className="relative h-[400px] rounded-3xl overflow-hidden mb-8 group">
              <img
                className="w-full h-full object-cover"
                src={
                  displayData.image || getDefaultImage(displayData.categories)
                }
                alt={displayData.title}
              />
              {editMode && (
                <button className="absolute inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 text-[#E63946] hover:opacity-80 transition-all duration-200 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent opacity-0 group-hover:opacity-100">
                  <img
                    src={cameraIcon}
                    alt="Change Photo"
                    className="w-20 h-20 object-contain"
                    style={{
                      filter:
                        "brightness(0) saturate(100%) invert(24%) sepia(98%) saturate(2472%) hue-rotate(337deg) brightness(101%) contrast(97%)",
                    }}
                  />
                </button>
              )}
            </div>

            <div id="recipe-info" className="mb-8">
              {/* Publisher Info */}
              {!displayData.isUserOwner && displayData.publisherId && (
                <PublisherInfo
                  publisher={{
                    id: displayData.publisherId,
                    username: displayData.publisherName,
                    profile_pic: displayData.publisherProfilePic,
                    email: displayData.publisherEmail,
                    bio: displayData.publisherBio,
                    preferences: displayData.publisherPreferences,
                  }}
                />
              )}
              <h1
                className={`text-3xl font-bold mb-4 ${
                  theme === "dark" ? "text-white" : "text-[#1D1D1D]"
                }`}
              >
                {displayData.isUserOwner && editMode ? (
                  <div className="relative">
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border ${
                        theme === "dark"
                          ? "border-gray-600 bg-[#333] text-white"
                          : "border-gray-200 bg-white text-[#1D1D1D]"
                      } rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none text-2xl font-bold`}
                    />
                    {hasChanges.title && (
                      <button
                        onClick={() => handleUndo("title")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#E63946] hover:opacity-80 transition-all duration-200 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent"
                      >
                        <img
                          src={undoIcon}
                          alt="Undo"
                          className="w-4 h-4 object-contain inline"
                          style={{
                            filter:
                              "brightness(0) saturate(100%) invert(24%) sepia(98%) saturate(2472%) hue-rotate(337deg) brightness(101%) contrast(97%)",
                          }}
                        />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span>{displayData.title}</span>
                    <div className="flex items-center space-x-2">
                      <img
                        src={starIcon}
                        alt="Rating"
                        className="w-6 h-6 object-contain"
                        style={{
                          filter:
                            "brightness(0) saturate(100%) invert(76%) sepia(61%) saturate(1012%) hue-rotate(358deg) brightness(103%) contrast(107%)",
                        }}
                      />
                      <span className="text-2xl font-medium text-[#FFB800]">
                        {displayData.rating
                          ? displayData.rating.toFixed(1)
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                )}
              </h1>
              <div
                className={`flex flex-col space-y-4 mb-6 ${
                  theme === "dark" ? "text-gray-300" : "text-[#6C757D]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    {displayData.isUserOwner && editMode ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <img
                            src={clockIcon}
                            alt="Prep Time"
                            className="w-5 h-5 object-contain"
                            style={{
                              filter:
                                theme === "light"
                                  ? "brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(90%)"
                                  : "brightness(0) invert(1)",
                            }}
                          />
                          <input
                            type="number"
                            name="estimatedPrepTime"
                            value={formData.estimatedPrepTime}
                            onChange={handleInputChange}
                            min="0"
                            className={`w-20 px-2 py-1 border ${
                              theme === "dark"
                                ? "border-gray-600 bg-[#333] text-white"
                                : "border-gray-200 bg-white text-[#1D1D1D]"
                            } rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none`}
                          />
                          <span>mins</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <img
                            src={cookingIcon}
                            alt="Cook Time"
                            className="w-5 h-5 object-contain"
                            style={{
                              filter:
                                theme === "light"
                                  ? "brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(90%)"
                                  : "brightness(0) invert(1)",
                            }}
                          />
                          <input
                            type="number"
                            name="estimatedCookingTime"
                            value={formData.estimatedCookingTime}
                            onChange={handleInputChange}
                            min="0"
                            className={`w-20 px-2 py-1 border ${
                              theme === "dark"
                                ? "border-gray-600 bg-[#333] text-white"
                                : "border-gray-200 bg-white text-[#1D1D1D]"
                            } rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none`}
                          />
                          <span>mins</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <img
                            src={servingIcon}
                            alt="Servings"
                            className="w-5 h-5 object-contain"
                            style={{
                              filter:
                                theme === "light"
                                  ? "brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(90%)"
                                  : "brightness(0) invert(1)",
                            }}
                          />
                          <input
                            type="number"
                            name="servings"
                            value={formData.servings}
                            onChange={handleInputChange}
                            min="1"
                            className={`w-20 px-2 py-1 border ${
                              theme === "dark"
                                ? "border-gray-600 bg-[#333] text-white"
                                : "border-gray-200 bg-white text-[#1D1D1D]"
                            } rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none`}
                          />
                          <span>servings</span>
                        </div>
                      </>
                    ) : (
                      <>
                        {displayData.estimatedPrepTime > 0 && (
                          <span className="flex items-center space-x-2">
                            <img
                              src={clockIcon}
                              alt="Prep Time"
                              className="w-5 h-5 object-contain"
                              style={{
                                filter:
                                  theme === "light"
                                    ? "brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(90%)"
                                    : "brightness(0) invert(1)",
                              }}
                            />
                            <span>
                              Prep: {displayData.estimatedPrepTime} mins
                            </span>
                          </span>
                        )}
                        {displayData.estimatedCookingTime > 0 && (
                          <span className="flex items-center space-x-2">
                            <img
                              src={cookingIcon}
                              alt="Cook Time"
                              className="w-5 h-5 object-contain"
                              style={{
                                filter:
                                  theme === "light"
                                    ? "brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(90%)"
                                    : "brightness(0) invert(1)",
                              }}
                            />
                            <span>
                              Cook: {displayData.estimatedCookingTime} mins
                            </span>
                          </span>
                        )}
                        <span className="flex items-center space-x-2">
                          <img
                            src={servingIcon}
                            alt="Servings"
                            className="w-5 h-5 object-contain"
                            style={{
                              filter:
                                theme === "light"
                                  ? "brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(90%)"
                                  : "brightness(0) invert(1)",
                            }}
                          />
                          <span>{displayData.servings || "2"} servings</span>
                        </span>
                      </>
                    )}
                  </div>
                  {/* Public/Private Status on the right of the info row, live in both modes */}
                  <div className="flex items-center">
                    {(
                      displayData.isUserOwner && editMode
                        ? formData.isPublic
                        : displayData.public
                    ) ? (
                      <span className="flex items-center text-green-600 font-semibold text-sm ml-4">
                        <img
                          src={globalIcon}
                          alt="Public Recipe"
                          className="w-5 h-5 mr-1 object-contain"
                          style={{
                            filter:
                              theme === "dark"
                                ? "brightness(0) invert(1)"
                                : "none",
                          }}
                        />
                        Public
                      </span>
                    ) : (
                      <span className="flex items-center text-gray-500 font-semibold text-sm ml-4">
                        <img
                          src={lockIcon}
                          alt="Private Recipe"
                          className="w-5 h-5 mr-1 object-contain"
                          style={{
                            filter:
                              theme === "dark"
                                ? "brightness(0) invert(1)"
                                : "none",
                          }}
                        />
                        Private
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold mb-2">Categories</h3>
                </div>
                {displayData.isUserOwner && editMode ? (
                  <div className="flex items-center justify-between w-full">
                    {/* Left: Categories tags and Add button */}
                    <div className="flex flex-wrap gap-2 items-center">
                      {formData.categories.map((category, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1 ${
                            theme === "dark"
                              ? "bg-gray-700 text-gray-300"
                              : "bg-[#F1FA8C] text-[#1D1D1D]"
                          } rounded-full text-sm flex items-center space-x-2`}
                        >
                          <span>{category}</span>
                          <button
                            onClick={() => {
                              const newCategories = formData.categories.filter(
                                (c) => c !== category
                              );
                              setFormData((prev) => ({
                                ...prev,
                                categories: newCategories,
                              }));
                              setHasChanges((prev) => ({
                                ...prev,
                                categories: true,
                              }));
                            }}
                            className="text-[#E63946] hover:opacity-80 transition-all duration-200 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </span>
                      ))}
                      <div className="relative flex items-center space-x-2">
                        <button
                          id="add-category-button"
                          onClick={() =>
                            setShowCategoryDropdown(!showCategoryDropdown)
                          }
                          className={`px-3 py-1 border border-dashed ${
                            theme === "dark"
                              ? "border-[#E63946] text-[#E63946] hover:border-[#E63946]"
                              : "border-[#E63946] text-[#E63946] hover:border-[#E63946]"
                          } rounded-full text-sm hover:opacity-80 transition-all duration-200 focus:outline-none bg-transparent`}
                        >
                          <i className="fa-solid fa-plus"></i> Add
                        </button>
                        {hasChanges.categories && (
                          <button
                            onClick={() => handleUndo("categories")}
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
                      {showCategoryDropdown && (
                        <div
                          id="category-dropdown"
                          className={`absolute z-10 mt-2 w-64 rounded-md shadow-lg py-1 max-h-60 overflow-y-auto ${
                            theme === "light"
                              ? "bg-[#FFFDF9] border border-gray-200"
                              : "bg-black border border-gray-700"
                          }`}
                        >
                          {availableCategories
                            .filter(
                              (category) =>
                                !formData.categories.includes(category)
                            )
                            .map((category) => (
                              <button
                                key={category}
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    categories: [...prev.categories, category],
                                  }));
                                  setHasChanges((prev) => ({
                                    ...prev,
                                    categories: true,
                                  }));
                                  setShowCategoryDropdown(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-[#E63946] hover:text-white transition-colors bg-transparent border-none focus:outline-none ${
                                  theme === "light"
                                    ? "text-gray-700"
                                    : "text-gray-200"
                                }`}
                              >
                                {category}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                    {/* Right: Make Public button for publishers, or read-only status for non-publishers */}
                    {user?.isPublisher ? (
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              isPublic: !prev.isPublic,
                            }));
                            setHasChanges((prev) => ({
                              ...prev,
                              isPublic:
                                !hasChanges.isPublic ||
                                originalData.isPublic !== !formData.isPublic,
                            }));
                          }}
                          className={`px-6 py-2 rounded-2xl font-semibold transition-all duration-200 focus:outline-none border-2
                            ${
                              formData.isPublic
                                ? theme === "dark"
                                  ? "bg-[#2d070a] text-[#ffb3b3] border-[#E63946] hover:bg-[#a11a24] hover:text-white hover:border-[#E63946]"
                                  : "bg-[#ffeaea] text-[#E63946] border-[#E63946] hover:bg-[#c72c3b] hover:text-white hover:border-[#E63946]"
                                : theme === "dark"
                                ? "bg-[#222] text-gray-300 border-gray-600 hover:bg-[#111] hover:text-white hover:border-gray-600"
                                : "bg-white text-gray-600 border-gray-600 hover:bg-gray-300 hover:text-gray-800 hover:border-gray-600"
                            }
                          `}
                        >
                          {formData.isPublic ? "Make Private" : "Make Public"}
                        </button>
                        {hasChanges.isPublic && (
                          <button
                            type="button"
                            onClick={() => handleUndo("isPublic")}
                            className="ml-2 text-[#E63946] hover:opacity-80 transition-all duration-200 focus:outline-none border-none outline-none bg-transparent"
                          >
                            <img
                              src={undoIcon}
                              alt="Undo"
                              className="w-4 h-4 object-contain inline"
                              style={{
                                filter:
                                  "brightness(0) saturate(100%) invert(24%) sepia(98%) saturate(2472%) hue-rotate(337deg) brightness(101%) contrast(97%)",
                              }}
                            />
                            <span className="ml-1">Undo</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center ml-4">
                        {formData.isPublic ? (
                          <span className="flex items-center text-green-600 font-semibold text-sm">
                            <img
                              src={globalIcon}
                              alt="Public Recipe"
                              className="w-5 h-5 mr-1 object-contain"
                              style={{
                                filter:
                                  theme === "dark"
                                    ? "brightness(0) invert(1)"
                                    : "none",
                              }}
                            />
                            Public
                          </span>
                        ) : (
                          <span className="flex items-center text-gray-500 font-semibold text-sm">
                            <img
                              src={lockIcon}
                              alt="Private Recipe"
                              className="w-5 h-5 mr-1 object-contain"
                              style={{
                                filter:
                                  theme === "dark"
                                    ? "brightness(0) invert(1)"
                                    : "none",
                              }}
                            />
                            Private
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  displayData.categories &&
                  displayData.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {displayData.categories.map((category, idx) => (
                        <span
                          key={idx}
                          className={`text-sm px-3 py-1 rounded-full ${
                            theme === "light"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-gray-700 text-gray-300"
                          }`}
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )
                )}
              </div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                {displayData.isUserOwner && editMode ? (
                  <div className="relative">
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className={`w-full px-4 py-2 border ${
                        theme === "dark"
                          ? "border-gray-600 bg-[#333] text-white"
                          : "border-gray-200 bg-white text-[#1D1D1D]"
                      } rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none resize-none`}
                    />
                    {hasChanges.description && (
                      <button
                        onClick={() => handleUndo("description")}
                        className="absolute right-2 top-2 text-[#E63946] hover:opacity-80 transition-all duration-200 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent"
                      >
                        <img
                          src={undoIcon}
                          alt="Undo"
                          className="w-4 h-4 object-contain inline"
                          style={{
                            filter:
                              "brightness(0) saturate(100%) invert(24%) sepia(98%) saturate(2472%) hue-rotate(337deg) brightness(101%) contrast(97%)",
                          }}
                        />
                      </button>
                    )}
                  </div>
                ) : (
                  <p>{displayData.description}</p>
                )}
              </div>
            </div>

            <div
              id="recipe-content"
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <div id="ingredients" className="md:col-span-1">
                <div
                  className={`${
                    theme === "dark"
                      ? "bg-[#222] text-white"
                      : "bg-white text-[#1D1D1D]"
                  } rounded-3xl shadow-lg p-6`}
                >
                  <h2
                    className={`text-xl font-bold mb-4 ${
                      theme === "dark" ? "text-white" : "text-[#1D1D1D]"
                    }`}
                  >
                    Ingredients
                    {editMode && hasChanges.ingredients && (
                      <button
                        onClick={() => handleUndo("ingredients")}
                        className="ml-2 text-[#E63946] hover:opacity-80 transition-all duration-200 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent"
                      >
                        <img
                          src={undoIcon}
                          alt="Undo"
                          className="w-4 h-4 object-contain inline"
                          style={{
                            filter:
                              "brightness(0) saturate(100%) invert(24%) sepia(98%) saturate(2472%) hue-rotate(337deg) brightness(101%) contrast(97%)",
                          }}
                        />
                      </button>
                    )}
                  </h2>
                  {displayData.isUserOwner && editMode ? (
                    <ul className="space-y-3">
                      {formData.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-center space-x-3">
                          <div className="relative flex-1">
                            <textarea
                              value={ingredient}
                              onChange={(e) =>
                                handleListChange(
                                  "ingredients",
                                  index,
                                  e.target.value
                                )
                              }
                              rows="2"
                              className={`w-full px-4 py-2 pr-10 border ${
                                theme === "dark"
                                  ? "border-gray-600 bg-[#333] text-white"
                                  : "border-gray-200 bg-white text-[#1D1D1D]"
                              } rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none resize-none`}
                            />
                            <div className="absolute right-2 top-2 flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveListItem("ingredients", index)
                                }
                                className="text-[#E63946] hover:opacity-80 transition-all duration-200 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent"
                              >
                                <img
                                  src={binIcon}
                                  alt="Remove"
                                  className="w-4 h-4"
                                  style={{
                                    filter:
                                      theme === "dark"
                                        ? "brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(90%)"
                                        : "none",
                                  }}
                                />
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                      <li>
                        <button
                          type="button"
                          onClick={() => handleAddListItem("ingredients")}
                          className={`${
                            theme === "dark"
                              ? "text-green-400 hover:text-green-300"
                              : "text-[#10b981] hover:text-green-600"
                          } px-6 py-3 rounded-2xl hover:opacity-80 transition-all duration-200 flex items-center space-x-2 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent`}
                        >
                          + Add Ingredient
                        </button>
                      </li>
                    </ul>
                  ) : (
                    <ul className="space-y-3">
                      {displayData.ingredients.map((ingredient, index) => (
                        <li
                          key={index}
                          className={`flex items-center space-x-3 ${
                            theme === "dark"
                              ? "text-gray-300"
                              : "text-[#6C757D]"
                          }`}
                        >
                          <i className="fa-solid fa-circle text-xs"></i>
                          <span>{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div id="instructions" className="md:col-span-2">
                <div
                  className={`${
                    theme === "dark"
                      ? "bg-[#222] text-white"
                      : "bg-white text-[#1D1D1D]"
                  } rounded-3xl shadow-lg p-6`}
                >
                  <h2
                    className={`text-xl font-bold mb-4 ${
                      theme === "dark" ? "text-white" : "text-[#1D1D1D]"
                    }`}
                  >
                    Instructions
                    {editMode && hasChanges.instructions && (
                      <button
                        onClick={() => handleUndo("instructions")}
                        className="ml-2 text-[#E63946] hover:opacity-80 transition-all duration-200 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent"
                      >
                        <img
                          src={undoIcon}
                          alt="Undo"
                          className="w-4 h-4 object-contain inline"
                          style={{
                            filter:
                              "brightness(0) saturate(100%) invert(24%) sepia(98%) saturate(2472%) hue-rotate(337deg) brightness(101%) contrast(97%)",
                          }}
                        />
                      </button>
                    )}
                  </h2>
                  {displayData.isUserOwner && editMode ? (
                    <ol className="space-y-6">
                      {formData.instructions.map((instruction, index) => (
                        <li key={index} className="flex space-x-4 items-center">
                          <span className="flex-shrink-0 w-8 h-8 bg-[#E63946] text-white rounded-full flex items-center justify-center">
                            {index + 1}
                          </span>
                          <div className="relative flex-1">
                            <textarea
                              value={instruction}
                              onChange={(e) =>
                                handleListChange(
                                  "instructions",
                                  index,
                                  e.target.value
                                )
                              }
                              rows="2"
                              className={`w-full px-4 py-2 pr-10 border ${
                                theme === "dark"
                                  ? "border-gray-600 bg-[#333] text-white"
                                  : "border-gray-200 bg-white text-[#1D1D1D]"
                              } rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none resize-none`}
                            />
                            <div className="absolute right-2 top-2 flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveListItem("instructions", index)
                                }
                                className="text-[#E63946] hover:opacity-80 transition-all duration-200 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent"
                              >
                                <img
                                  src={binIcon}
                                  alt="Remove"
                                  className="w-4 h-4"
                                  style={{
                                    filter:
                                      theme === "dark"
                                        ? "brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(90%)"
                                        : "none",
                                  }}
                                />
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                      <li>
                        <button
                          type="button"
                          onClick={() => handleAddListItem("instructions")}
                          className={`${
                            theme === "dark"
                              ? "text-green-400 hover:text-green-300"
                              : "text-[#10b981] hover:text-green-600"
                          } px-6 py-3 rounded-2xl hover:opacity-80 transition-all duration-200 flex items-center space-x-2 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent`}
                        >
                          + Add Instruction
                        </button>
                      </li>
                    </ol>
                  ) : (
                    <ol className="space-y-6">
                      {displayData.instructions.map((instruction, index) => (
                        <li key={index} className="flex space-x-4">
                          <span className="flex-shrink-0 w-8 h-8 bg-[#E63946] text-white rounded-full flex items-center justify-center">
                            {index + 1}
                          </span>
                          <p
                            className={
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-[#6C757D]"
                            }
                          >
                            {instruction}
                          </p>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            </div>

            <div
              id="recipe-actions"
              className="mt-8 flex flex-col items-center space-y-4"
            >
              <div className="flex space-x-4">
                <button
                  onClick={handleCopyRecipe}
                  className="bg-[#4CAF50] text-white px-6 py-3 rounded-2xl hover:opacity-80 transition-all duration-200 flex items-center space-x-2 focus:outline-none border-none outline-none hover:border-none hover:outline-none"
                >
                  <img
                    src={copyingIcon}
                    alt="Copy"
                    className="w-5 h-5 mr-2"
                    style={{
                      filter: "brightness(0) invert(1)",
                    }}
                  />
                  <span>Copy Recipe</span>
                </button>
                <button
                  onClick={() =>
                    navigate(`/ai-assist/${displayData.id}`, {
                      state: { recipe: displayData },
                    })
                  }
                  className="bg-[#6366F1] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 flex items-center space-x-2"
                >
                  <img
                    src={aiAssistIcon}
                    alt="AI Assist"
                    className="w-5 h-5 filter brightness-0 invert"
                  />
                  <span>AI Assist</span>
                </button>
                {/* Delete button */}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-transparent text-[#E63946] border-2 border-[#E63946] px-6 py-3 rounded-2xl hover:bg-[#E63946] hover:text-white transition-all duration-200 flex items-center space-x-2 focus:outline-none outline-none hover:outline-none"
                >
                  <i className="fa-solid fa-trash"></i>
                  <span>Delete</span>
                </button>
                {displayData.isUserOwner && !editMode && (
                  <button
                    onClick={handleEditToggle}
                    className={`${
                      theme === "dark"
                        ? "bg-[#E63946] text-white"
                        : "bg-white text-[#E63946] border-2 border-[#E63946]"
                    } px-6 py-3 rounded-2xl hover:opacity-80 transition-all duration-200 flex items-center space-x-2 focus:outline-none border-none outline-none hover:border-none hover:outline-none`}
                  >
                    <img
                      src={editIcon}
                      alt="Edit"
                      className="w-5 h-5 mr-2"
                      style={{
                        filter:
                          theme === "dark" ? "brightness(0) invert(1)" : "none",
                      }}
                    />
                    <span>Edit Recipe</span>
                  </button>
                )}
                {displayData.isUserOwner && editMode && (
                  <div className="flex space-x-2 items-center">
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
                      className={`${
                        theme === "dark"
                          ? "bg-[#E63946] text-white hover:bg-red-700"
                          : "bg-[#E63946] text-white hover:bg-red-700"
                      } px-6 py-3 rounded-2xl transition-all duration-200 flex items-center space-x-2 focus:outline-none border-none outline-none hover:border-none hover:outline-none`}
                      onClick={handleSaveChanges}
                    >
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </div>
              {showCopyAlert && (
                <Alert type="success" message="Recipe copied to clipboard!" />
              )}
              {deleteAlert && (
                <Alert
                  type="error"
                  message={deleteAlert}
                  onClose={() => setDeleteAlert(null)}
                />
              )}
              {saveAlert && (
                <Alert
                  type={
                    saveAlert.includes("successfully") ? "success" : "error"
                  }
                  message={saveAlert}
                  onClose={() => setSaveAlert(null)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`rounded-2xl shadow-lg p-8 max-w-sm w-full text-center ${
              theme === "dark"
                ? "bg-[#1a1a1a] text-gray-200"
                : "bg-white text-[#1D1D1D]"
            }`}
          >
            <h2 className="text-xl font-bold mb-4 text-[#E63946]">
              Delete Recipe
            </h2>
            <p className="mb-6">
              Are you sure you want to delete this recipe? This action cannot be
              undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleDelete}
                className="bg-[#E63946] text-white px-6 py-2 rounded-2xl hover:bg-red-700 transition-all duration-200 focus:outline-none border-none"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`bg-transparent border-2 border-gray-600 px-6 py-2 rounded-2xl transition-all duration-200 focus:outline-none ${
                  theme === "dark"
                    ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                } hover:border-gray-600`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default SavedRecipeDetails;
