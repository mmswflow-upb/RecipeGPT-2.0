import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import Alert from "../components/Alert";
import SuccessAlert from "../components/SuccessAlert";
import PageLayout from "../components/PageLayout";
import magicWandIcon from "../assets/logos/magic-wand.png";
import RecipeCard from "../components/RecipeCard";
import { useRecipeBatch } from "../contexts/RecipeBatchContext";
import recipeIcon from "../assets/logos/recipe.png";
import { generateRecipes } from "../services/api";

const RecipeGenerator = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const { recipes, setRecipes } = useRecipeBatch();
  const [prompt, setPrompt] = useState("");
  const [numRecipes, setNumRecipes] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState([]);
  const [saveMessage, setSaveMessage] = useState("");
  const [inputError, setInputError] = useState("");
  const [numRecipesError, setNumRecipesError] = useState("");
  const [saving, setSaving] = useState(false);

  const validateForm = () => {
    let isValid = true;

    // Validate prompt
    if (!prompt.trim()) {
      setInputError("Please enter a recipe request");
      isValid = false;
    } else {
      setInputError("");
    }

    // Validate number of recipes
    if (numRecipes <= 0) {
      setNumRecipesError("Number of recipes must be greater than 0");
      isValid = false;
    } else {
      setNumRecipesError("");
    }

    return isValid;
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSaveMessage("");
    setSelected([]);
    setRecipes([]);

    try {
      // Use the API service to generate recipes
      const data = await generateRecipes(prompt, numRecipes);
      setRecipes(data.recipes);
      // Select all recipes by default
      setSelected(data.recipes.map((_, idx) => idx));
      setSaveMessage(
        "Recipes generated successfully! Select which ones to keep."
      );
    } catch (err) {
      setError(err.message || "Failed to generate recipes");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (idx) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleSaveSelection = async () => {
    setSaving(true);
    setError(null);

    try {
      // Get the IDs of recipes to delete (unselected ones)
      const recipesToDelete = recipes
        .filter((_, idx) => !selected.includes(idx))
        .map((recipe) => recipe.id)
        .filter((id) => id); // Filter out any null or undefined IDs

      // Only send delete request if there are recipes to delete
      if (recipesToDelete.length > 0) {
        const response = await fetch(
          `${
            import.meta.env.VITE_SERVER_URL || "http://localhost:8080"
          }/api/recipes/bulk-delete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ recipeIds: recipesToDelete }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete recipes");
        }
      }

      // Clear all recipe-related state
      setRecipes([]);
      setSelected([]);
      setPrompt("");
      setNumRecipes(2);
      setSaveMessage("Recipes saved successfully!");
    } catch (err) {
      setError(err.message || "Failed to save recipes");
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div id="prompt-section" className="max-w-3xl mx-auto mb-12">
          <div
            className={`${
              theme === "light" ? "bg-white" : "bg-[#222]"
            } rounded-lg shadow-lg p-6`}
          >
            <h1 className="text-2xl font-bold mb-6 text-center">
              What would you like to cook today?
            </h1>
            <form
              id="recipe-form"
              className="space-y-4"
              onSubmit={handleGenerate}
            >
              <div className="flex flex-col space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      id="recipe-prompt"
                      value={prompt}
                      onChange={(e) => {
                        setPrompt(e.target.value);
                        setInputError("");
                      }}
                      className={`w-full px-4 py-3 border ${
                        theme === "light"
                          ? "border-gray-300 bg-white"
                          : "border-gray-600 bg-[#333]"
                      } ${
                        inputError ? "border-red-500" : ""
                      } rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none`}
                      placeholder="Enter your recipe request (e.g., 'healthy vegetarian pasta')"
                      disabled={loading}
                    />
                    {inputError && (
                      <p className="mt-1 text-sm text-red-500">{inputError}</p>
                    )}
                  </div>
                  <div className="relative flex flex-col">
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={numRecipes}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setNumRecipes(value);
                          if (value <= 0) {
                            setNumRecipesError(
                              "Number of recipes must be greater than 0"
                            );
                          } else {
                            setNumRecipesError("");
                          }
                        }}
                        className={`w-20 pl-10 py-3 border rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none ${
                          theme === "light"
                            ? "border-gray-300 bg-white text-black"
                            : "border-gray-600 bg-[#333] text-white"
                        } ${numRecipesError ? "border-red-500" : ""}`}
                        disabled={loading}
                        placeholder="Count"
                      />
                      <img
                        src={recipeIcon}
                        alt="Recipes"
                        className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-5 h-5 object-contain ${
                          theme === "dark" ? "brightness-0 invert" : ""
                        }`}
                        style={{ pointerEvents: "none" }}
                      />
                    </div>
                    {numRecipesError && (
                      <p className="mt-1 text-sm text-red-500 whitespace-nowrap">
                        {numRecipesError}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#E63946] text-white px-6 py-3 rounded-lg transition duration-200 flex items-center space-x-2 disabled:opacity-50 focus:outline-none border-none hover:bg-[#cc333f]"
                  >
                    <img
                      src={magicWandIcon}
                      alt="Generate"
                      className="w-5 h-5 object-contain brightness-0 invert"
                    />
                    <span>{loading ? "Generating..." : "Generate"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}
        {saveMessage && (
          <SuccessAlert
            message={saveMessage}
            onClose={() => setSaveMessage("")}
          />
        )}

        {recipes.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Select recipes to keep:
            </h2>
            <div
              className={`grid gap-8 ${
                recipes.length === 1
                  ? "grid-cols-1 max-w-2xl mx-auto"
                  : "grid-cols-1 md:grid-cols-2"
              }`}
            >
              {recipes.map((recipe, idx) => (
                <RecipeCard
                  key={idx}
                  recipe={recipe}
                  selected={selected.includes(idx)}
                  onSelect={() => handleSelect(idx)}
                  index={idx}
                />
              ))}
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={handleSaveSelection}
                disabled={saving}
                className={`px-6 py-3 rounded-lg transition duration-200 focus:outline-none border-none ${
                  selected.length === 0
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-[#E63946] text-white hover:bg-[#cc333f]"
                }`}
              >
                {saving
                  ? "Saving..."
                  : selected.length === 0
                  ? "Delete All Recipes"
                  : `Keep Selected Recipe${selected.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default RecipeGenerator;
