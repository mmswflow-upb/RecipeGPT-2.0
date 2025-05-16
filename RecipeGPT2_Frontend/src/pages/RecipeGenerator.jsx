import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import Alert from "../components/Alert";
import PageLayout from "../components/PageLayout";
import magicWandIcon from "../assets/magic-wand.png";

const RecipeGenerator = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [prompt, setPrompt] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/recipes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ query: prompt.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate recipe");
      }

      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      console.error("Recipe generation error:", err);
      setError("Failed to generate recipe. Please try again.");
    } finally {
      setLoading(false);
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
              onSubmit={handleSubmit}
            >
              <div className="flex space-x-4">
                <input
                  type="text"
                  id="recipe-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className={`flex-1 px-4 py-3 border ${
                    theme === "light"
                      ? "border-gray-300 bg-white"
                      : "border-gray-600 bg-[#333]"
                  } rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none`}
                  placeholder="Enter your recipe request (e.g., 'healthy vegetarian pasta')"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#E63946] text-white px-6 py-3 rounded-lg hover:bg-[#cc333f] transition duration-200 flex items-center space-x-2 disabled:opacity-50 no-focus-ring"
                  style={{
                    outline: "none",
                    border: "none",
                    boxShadow: "none",
                  }}
                >
                  <img
                    src={magicWandIcon}
                    alt="Generate"
                    className="w-5 h-5 object-contain brightness-0 invert"
                  />
                  <span>{loading ? "Generating..." : "Generate"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}

        <div
          id="recipes-grid"
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {recipes.map((recipe, index) => (
            <div
              key={index}
              className={`${
                theme === "light" ? "bg-white" : "bg-[#222]"
              } rounded-lg shadow-lg overflow-hidden`}
            >
              <div className="relative h-48">
                <img
                  className="w-full h-full object-cover"
                  src={recipe.imageUrl || "https://via.placeholder.com/400x300"}
                  alt={recipe.title}
                />
                <button className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:text-[#E63946]">
                  <i className="fa-regular fa-bookmark text-xl"></i>
                </button>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">{recipe.title}</h2>
                <div className="flex items-center space-x-4 text-[#6C757D] mb-4">
                  <span className="flex items-center space-x-1">
                    <i className="fa-regular fa-clock"></i>
                    <span>{recipe.cookingTime}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <i className="fa-solid fa-utensils"></i>
                    <span>{recipe.servings} servings</span>
                  </span>
                </div>
                <p className="text-[#6C757D] mb-4">{recipe.description}</p>
                <button className="text-[#E63946] hover:underline flex items-center space-x-2">
                  <span>View Recipe</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default RecipeGenerator;
