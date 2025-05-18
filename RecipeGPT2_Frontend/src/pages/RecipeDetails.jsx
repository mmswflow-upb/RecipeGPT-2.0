import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import PageLayout from "../components/PageLayout";
import Alert from "../components/Alert";
import { useAuth } from "../contexts/AuthContext";
import { useRecipeBatch } from "../contexts/RecipeBatchContext";
import { getDefaultImage } from "../utils/categoryImageMap";
import clockIcon from "../assets/logos/clock.png";
import cookingIcon from "../assets/logos/cooking.png";
import servingIcon from "../assets/logos/serving.png";
import copyingIcon from "../assets/logos/copying.png";

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { recipes } = useRecipeBatch();
  const [showCopyAlert, setShowCopyAlert] = useState(false);

  // Find the recipe from the context using the id from URL params
  const recipe = recipes.find((r) => r.id === id);

  if (!isAuthenticated) {
    navigate("/login", { replace: true });
    return null;
  }

  if (!recipe) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <Alert type="error" message="Recipe not found" />
        </div>
      </PageLayout>
    );
  }

  const handleCopyRecipe = () => {
    const recipeText = `
Recipe: ${recipe.title}
Prep Time: ${recipe.estimatedPrepTime || "10"} mins
Cook Time: ${recipe.estimatedCookingTime || "20"} mins
Servings: ${recipe.servings || "2"}
${recipe.dietaryInfo ? `Dietary Info: ${recipe.dietaryInfo}` : ""}

Ingredients:
${recipe.ingredients.map((ing) => `- ${ing}`).join("\n")}

Instructions:
${recipe.instructions.map((inst, idx) => `${idx + 1}. ${inst}`).join("\n")}
    `;
    navigator.clipboard.writeText(recipeText);
    setShowCopyAlert(true);
    setTimeout(() => setShowCopyAlert(false), 3000);
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
            <div className="relative h-[400px] rounded-3xl overflow-hidden mb-8">
              <img
                className="w-full h-full object-cover"
                src={recipe.image || getDefaultImage(recipe.categories)}
                alt={recipe.title}
              />
            </div>

            <div id="recipe-info" className="mb-8">
              <h1
                className={`text-3xl font-bold mb-4 ${
                  theme === "dark" ? "text-white" : "text-[#1D1D1D]"
                }`}
              >
                {recipe.title}
              </h1>
              <div
                className={`flex flex-col space-y-4 mb-6 ${
                  theme === "dark" ? "text-gray-300" : "text-[#6C757D]"
                }`}
              >
                <div className="flex items-center space-x-6">
                  {recipe.estimatedPrepTime > 0 && (
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
                      <span>Prep: {recipe.estimatedPrepTime} mins</span>
                    </span>
                  )}
                  {recipe.estimatedCookingTime > 0 && (
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
                      <span>Cook: {recipe.estimatedCookingTime} mins</span>
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
                    <span>{recipe.servings || "2"} servings</span>
                  </span>
                  {recipe.dietaryInfo && (
                    <span className="flex items-center space-x-2">
                      <i className="fa-solid fa-leaf text-lg"></i>
                      <span>{recipe.dietaryInfo}</span>
                    </span>
                  )}
                </div>
                {recipe.categories && recipe.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {recipe.categories.map((category, idx) => (
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
                  </h2>
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li
                        key={index}
                        className={`flex items-center space-x-3 ${
                          theme === "dark" ? "text-gray-300" : "text-[#6C757D]"
                        }`}
                      >
                        <i className="fa-solid fa-circle text-xs"></i>
                        <span>{ingredient}</span>
                      </li>
                    ))}
                  </ul>
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
                  </h2>
                  <ol className="space-y-6">
                    {recipe.instructions.map((instruction, index) => (
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
                </div>
              </div>
            </div>

            <div
              id="recipe-actions"
              className="mt-8 flex flex-col items-center space-y-4"
            >
              <button
                onClick={handleCopyRecipe}
                className="bg-[#4CAF50] text-white px-6 py-3 rounded-2xl hover:opacity-80 transition-all duration-200 flex items-center space-x-2 focus:outline-none border-none outline-none hover:border-none hover:outline-none"
              >
                <img
                  src={copyingIcon}
                  alt="Copy"
                  className="w-5 h-5 object-contain brightness-0 invert"
                />
                <span>Copy Recipe Details</span>
              </button>
              {showCopyAlert && (
                <Alert
                  type="success"
                  message="Recipe details copied to clipboard!"
                  onClose={() => setShowCopyAlert(false)}
                  autoClose={true}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default RecipeDetails;
