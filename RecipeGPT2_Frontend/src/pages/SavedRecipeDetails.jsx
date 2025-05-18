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

const SavedRecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [hasChanges, setHasChanges] = useState({
    title: false,
    description: false,
    ingredients: false,
    instructions: false,
  });

  // Get recipe from navigation state if available
  const recipe = location.state?.recipe || null;

  useEffect(() => {
    if (recipe && recipe.id) {
      setFormData({ ...recipe });
      setOriginalData({ ...recipe });
    }
  }, [recipe]);

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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasChanges((prev) => ({
      ...prev,
      [name]: value !== originalData[name],
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
    });
  };
  // TODO: Implement save logic to backend

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
            <div className="relative h-[400px] rounded-3xl overflow-hidden mb-8">
              <img
                className="w-full h-full object-cover"
                src={
                  displayData.image || getDefaultImage(displayData.categories)
                }
                alt={displayData.title}
              />
            </div>

            <div id="recipe-info" className="mb-8">
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
                  displayData.title
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
                  {displayData.isUserOwner &&
                    editMode &&
                    (hasChanges.estimatedPrepTime ||
                      hasChanges.estimatedCookingTime ||
                      hasChanges.servings) && (
                      <button
                        onClick={() => {
                          handleUndo("estimatedPrepTime");
                          handleUndo("estimatedCookingTime");
                          handleUndo("servings");
                        }}
                        className="text-[#E63946] hover:opacity-80 transition-all duration-200 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent"
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
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold mb-2">Categories</h3>
                  {displayData.isUserOwner &&
                    editMode &&
                    hasChanges.categories && (
                      <button
                        onClick={() => handleUndo("categories")}
                        className="text-[#E63946] hover:opacity-80 transition-all duration-200 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent"
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
                {displayData.isUserOwner && editMode ? (
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Breakfast",
                      "Lunch",
                      "Dinner",
                      "Dessert",
                      "Snack",
                      "Vegetarian",
                      "Vegan",
                      "Gluten-Free",
                      "Dairy-Free",
                      "Low-Carb",
                      "High-Protein",
                    ].map((category) => (
                      <label
                        key={category}
                        className={`flex items-center space-x-2 px-3 py-1 rounded-full cursor-pointer ${
                          theme === "light"
                            ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(category)}
                          onChange={(e) => {
                            const newCategories = e.target.checked
                              ? [...formData.categories, category]
                              : formData.categories.filter(
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
                          className="hidden"
                        />
                        <span>{category}</span>
                      </label>
                    ))}
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
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className={`${
                        theme === "dark"
                          ? "text-gray-300 hover:text-white"
                          : "text-gray-600 hover:text-gray-800"
                      } px-6 py-3 rounded-2xl hover:opacity-80 transition-all duration-200 flex items-center space-x-2 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent`}
                    >
                      <span>Cancel</span>
                    </button>
                    <button
                      className={`${
                        theme === "dark"
                          ? "text-[#10b981] hover:text-green-400"
                          : "text-[#10b981] hover:text-green-600"
                      } px-6 py-3 rounded-2xl hover:opacity-80 transition-all duration-200 flex items-center space-x-2 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent`}
                    >
                      <span>Save</span>
                    </button>
                  </div>
                )}
              </div>
              {showCopyAlert && (
                <Alert type="success" message="Recipe copied to clipboard!" />
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SavedRecipeDetails;
