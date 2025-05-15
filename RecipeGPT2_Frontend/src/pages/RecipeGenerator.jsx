import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { recipeService } from "../services/api";

const RecipeGenerator = () => {
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
      const response = await recipeService.generateRecipe(prompt);
      setRecipes(response);
    } catch (err) {
      setError("Failed to generate recipe. Please try again.");
      console.error("Recipe generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-[#FFFDF9] text-[#1D1D1D]"
      }`}
    >
      <NavBar />

      <main className="min-h-[800px] pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto mb-12">
            <div
              className={`${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } rounded-lg shadow-lg p-6`}
            >
              <h1 className="text-2xl font-bold mb-6 text-center">
                What would you like to cook today?
              </h1>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className={`flex-1 px-4 py-3 border ${
                      theme === "dark"
                        ? "border-gray-600 bg-gray-700 text-white"
                        : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none`}
                    placeholder="Enter your recipe request (e.g., 'healthy vegetarian pasta')"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#E63946] text-white px-6 py-3 rounded-lg hover:bg-[#cc333f] transition duration-200 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    <span>{loading ? "Generating..." : "Generate"}</span>
                  </button>
                </div>
              </form>
              {error && (
                <div className="mt-4 text-red-500 text-center">{error}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {recipes.map((recipe, index) => (
              <div
                key={index}
                className={`${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                } rounded-lg shadow-lg overflow-hidden`}
              >
                <div className="relative h-48">
                  <img
                    className="w-full h-full object-cover"
                    src={
                      recipe.imageUrl || "https://via.placeholder.com/400x300"
                    }
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
      </main>

      <Footer />
    </div>
  );
};

export default RecipeGenerator;
