import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import PageLayout from "../components/PageLayout";
import Alert from "../components/Alert";
import { useAuth } from "../contexts/AuthContext";
import { getDefaultImage } from "../utils/categoryImageMap";
import clockIcon from "../assets/logos/clock.png";
import cookingIcon from "../assets/logos/cooking.png";
import servingIcon from "../assets/logos/serving.png";
import undoIcon from "../assets/logos/undo.png";
import binIcon from "../assets/logos/bin.png";
import cameraIcon from "../assets/logos/camera.png";
import globalIcon from "../assets/logos/global.png";
import lockIcon from "../assets/logos/lock.png";

const DEFAULT_CATEGORIES = [
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

const CreateRecipe = () => {
  const { theme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categories: [],
    ingredients: [""],
    instructions: [""],
    estimatedPrepTime: 0,
    estimatedCookingTime: 0,
    servings: 1,
    image: "",
    isPublic: false,
  });
  const [hasChanges, setHasChanges] = useState({
    title: false,
    description: false,
    ingredients: false,
    instructions: false,
    isPublic: false,
  });
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [availableCategories] = useState(DEFAULT_CATEGORIES);
  const [saveAlert, setSaveAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    navigate("/login", { replace: true });
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setHasChanges((prev) => ({ ...prev, [name]: true }));
  };
  const handleListChange = (field, idx, value) => {
    setFormData((prev) => {
      const updated = [...prev[field]];
      updated[idx] = value;
      return { ...prev, [field]: updated };
    });
    setHasChanges((prev) => ({ ...prev, [field]: true }));
  };
  const handleAddListItem = (field) => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
    setHasChanges((prev) => ({ ...prev, [field]: true }));
  };
  const handleRemoveListItem = (field, idx) => {
    setFormData((prev) => {
      const updated = prev[field].filter((_, i) => i !== idx);
      return { ...prev, [field]: updated };
    });
    setHasChanges((prev) => ({ ...prev, [field]: true }));
  };
  const handleUndo = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "ingredients" || field === "instructions" ? [""] : "",
    }));
    setHasChanges((prev) => ({ ...prev, [field]: false }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveAlert(null);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_SERVER_URL || "http://localhost:8080"
        }/api/recipes`,
        {
          method: "POST",
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
      if (!response.ok) throw new Error("Failed to create recipe");
      setSaveAlert("Recipe created successfully!");
      setTimeout(() => navigate("/saved"), 1500);
    } catch (err) {
      setSaveAlert("Failed to create recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div
        className={`container mx-auto px-4 py-8 mb-16 min-h-screen ${
          theme === "dark" ? "bg-[#1a1a1a]" : "bg-[#FFFDF9]"
        }`}
      >
        <div id="recipe-details" className="max-w-4xl mx-auto p-6">
          <h1
            className={`text-3xl font-bold mb-4 ${
              theme === "dark" ? "text-white" : "text-[#1D1D1D]"
            }`}
          >
            Create a New Recipe
          </h1>
          <div className="mb-6">
            <h2
              className={`text-lg font-semibold mb-2 ${
                theme === "dark" ? "text-white" : "text-[#1D1D1D]"
              }`}
            >
              Title
            </h2>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border ${
                theme === "dark"
                  ? "border-gray-600 bg-[#333] text-white"
                  : "border-gray-200 bg-white text-[#1D1D1D]"
              } rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none`}
              placeholder="Enter recipe title"
            />
          </div>
          <div className="mb-6">
            <h2
              className={`text-lg font-semibold mb-2 ${
                theme === "dark" ? "text-white" : "text-[#1D1D1D]"
              }`}
            >
              Recipe Image
            </h2>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className={`flex-1 px-4 py-2 border ${
                    theme === "dark"
                      ? "border-gray-600 bg-[#333] text-white"
                      : "border-gray-200 bg-white text-[#1D1D1D]"
                  } rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none`}
                  placeholder="Enter image URL"
                />
                <label
                  className={`px-4 py-2 rounded-lg cursor-pointer ${
                    theme === "dark"
                      ? "bg-[#333] text-white border border-gray-600 hover:bg-[#444]"
                      : "bg-white text-[#1D1D1D] border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData((prev) => ({
                            ...prev,
                            image: reader.result,
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div className="flex items-center space-x-2">
                    <img
                      src={cameraIcon}
                      alt="Upload"
                      className="w-5 h-5 object-contain"
                      style={{
                        filter:
                          theme === "dark" ? "brightness(0) invert(1)" : "none",
                      }}
                    />
                    <span>Upload Image</span>
                  </div>
                </label>
              </div>
              {formData.image && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <img
                    src={formData.image}
                    alt="Recipe"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
          <div
            className={`flex flex-col space-y-4 mb-6 ${
              theme === "dark" ? "text-gray-300" : "text-[#6C757D]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
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
              </div>
              {/* Public/Private Status for publishers */}
              {user?.isPublisher && (
                <div className="flex items-center ml-4">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        isPublic: !prev.isPublic,
                      }))
                    }
                    className={`flex items-center px-4 py-2 rounded-2xl font-semibold transition-all duration-200 focus:outline-none border-2 ${
                      formData.isPublic
                        ? theme === "dark"
                          ? "bg-[#2d070a] text-[#ffb3b3] border-[#E63946] hover:bg-[#a11a24] hover:text-white hover:border-[#E63946]"
                          : "bg-[#ffeaea] text-[#E63946] border-[#E63946] hover:bg-[#c72c3b] hover:text-white hover:border-[#E63946]"
                        : theme === "dark"
                        ? "bg-[#222] text-gray-300 border-gray-600 hover:bg-[#111] hover:text-white hover:border-gray-600"
                        : "bg-white text-gray-600 border-gray-600 hover:bg-gray-300 hover:text-gray-800 hover:border-gray-600"
                    }`}
                  >
                    {formData.isPublic ? (
                      <>
                        <img
                          src={globalIcon}
                          alt="Public"
                          className="w-5 h-5 mr-2 object-contain"
                          style={{
                            filter:
                              theme === "dark"
                                ? "brightness(0) invert(1)"
                                : "none",
                          }}
                        />
                        Public (Click to make Private)
                      </>
                    ) : (
                      <>
                        <img
                          src={lockIcon}
                          alt="Private"
                          className="w-5 h-5 mr-2 object-contain"
                          style={{
                            filter:
                              theme === "dark"
                                ? "brightness(0) invert(1)"
                                : "none",
                          }}
                        />
                        Private (Click to make Public)
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <h3
                className={`text-lg font-semibold mb-2 ${
                  theme === "dark" ? "text-white" : "text-[#1D1D1D]"
                }`}
              >
                Categories
              </h3>
            </div>
            <div className="flex items-center justify-between w-full">
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
                          (category) => !formData.categories.includes(category)
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
              </div>
            </div>
            <div className="mb-4">
              <h2
                className={`text-lg font-semibold mb-2 ${
                  theme === "dark" ? "text-white" : "text-[#1D1D1D]"
                }`}
              >
                Description
              </h2>
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div id="ingredients" className="md:col-span-1">
                <div
                  className={`rounded-3xl shadow-lg p-6 ${
                    theme === "dark"
                      ? "bg-[#222] text-white"
                      : "bg-white text-[#1D1D1D]"
                  }`}
                >
                  <h2
                    className={`text-xl font-bold mb-4 ${
                      theme === "dark" ? "text-white" : "text-[#1D1D1D]"
                    }`}
                  >
                    Ingredients
                    {hasChanges.ingredients && (
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
                        className={`$${
                          theme === "dark"
                            ? "text-green-400 hover:text-green-300"
                            : "text-[#10b981] hover:text-green-600"
                        } px-6 py-3 rounded-2xl hover:opacity-80 transition-all duration-200 flex items-center space-x-2 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent`}
                      >
                        + Add Ingredient
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              <div id="instructions" className="md:col-span-2">
                <div
                  className={`rounded-3xl shadow-lg p-6 ${
                    theme === "dark"
                      ? "bg-[#222] text-white"
                      : "bg-white text-[#1D1D1D]"
                  }`}
                >
                  <h2
                    className={`text-xl font-bold mb-4 ${
                      theme === "dark" ? "text-white" : "text-[#1D1D1D]"
                    }`}
                  >
                    Instructions
                    {hasChanges.instructions && (
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
                        className={`$${
                          theme === "dark"
                            ? "text-green-400 hover:text-green-300"
                            : "text-[#10b981] hover:text-green-600"
                        } px-6 py-3 rounded-2xl hover:opacity-80 transition-all duration-200 flex items-center space-x-2 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent`}
                      >
                        + Add Instruction
                      </button>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleSave}
                disabled={loading}
                className={`px-8 py-3 rounded-2xl font-semibold transition-all duration-200 focus:outline-none border-none bg-[#E63946] text-white hover:bg-[#cc333f] flex items-center space-x-2`}
              >
                {loading ? "Saving..." : "Create Recipe"}
              </button>
            </div>
            {saveAlert && (
              <Alert
                type={saveAlert.includes("successfully") ? "success" : "error"}
                message={saveAlert}
                onClose={() => setSaveAlert(null)}
              />
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreateRecipe;
