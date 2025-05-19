import React, { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import RecipeCard from "../components/RecipeCard";
import SavedRecipeCard from "../components/SavedRecipeCard";
import { recipeService } from "../services/api";
import { useTheme } from "../contexts/ThemeContext";
import addIcon from "../assets/logos/add.png";
import searchIcon from "../assets/logos/recipe.png";
import Pagination from "../components/Pagination";
import { getDefaultImage } from "../utils/categoryImageMap";
import { useNavigate } from "react-router-dom";

const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "asian cooking", label: "Asian Cooking" },
  { value: "mediterranean cooking", label: "Mediterranean Cooking" },
  { value: "latin american cooking", label: "Latin American Cooking" },
  {
    value: "middle eastern & north african cooking",
    label: "Middle Eastern & North African Cooking",
  },
  {
    value: "indian & south asian cooking",
    label: "Indian & South Asian Cooking",
  },
  {
    value: "european continental cooking",
    label: "European Continental Cooking",
  },
  { value: "african cooking", label: "African Cooking" },
  { value: "american cooking", label: "American Cooking" },
  { value: "vegetarian & plant-based", label: "Vegetarian & Plant-Based" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten-Free" },
  { value: "low-carb & keto", label: "Low-Carb & Keto" },
  { value: "paleo & whole30", label: "Paleo & Whole30" },
  { value: "seafood & pescatarian", label: "Seafood & Pescatarian" },
  { value: "desserts & baking", label: "Desserts & Baking" },
  { value: "breakfast & brunch", label: "Breakfast & Brunch" },
  { value: "street food & snacks", label: "Street Food & Snacks" },
  { value: "soups & stews", label: "Soups & Stews" },
  { value: "salads & grain bowls", label: "Salads & Grain Bowls" },
  { value: "fusion & modernist", label: "Fusion & Modernist" },
  { value: "halal", label: "Halal" },
  { value: "beverages", label: "Beverages" },
];

const RECIPES_PER_PAGE = 4;

const SavedRecipes = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchRecipes();
    // eslint-disable-next-line
  }, [category, search]);

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recipeService.getSavedRecipes({
        category,
        text: search,
      });
      setRecipes(data);
      setPage(1);
    } catch (err) {
      setError("Failed to load saved recipes");
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(recipes.length / RECIPES_PER_PAGE);
  const paginatedRecipes = recipes.slice(
    (page - 1) * RECIPES_PER_PAGE,
    page * RECIPES_PER_PAGE
  );

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 w-full">
        <div
          className={`max-w-4xl mx-auto mb-8 ${
            theme === "light" ? "bg-white" : "bg-[#222]"
          } rounded-lg shadow-lg p-6`}
        >
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <h2
                className={`text-2xl font-bold ${
                  theme === "light" ? "text-[#1D1D1D]" : "text-white"
                }`}
              >
                Look through your recipe book!
              </h2>
              <button
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium bg-[#E63946] text-white border-none focus:outline-none transition-colors hover:bg-[#cc333f]`}
                onClick={() => navigate("/create")}
              >
                <img
                  src={addIcon}
                  alt="Create"
                  className="w-5 h-5"
                  style={{
                    filter: "brightness(0) invert(1)",
                  }}
                />
                <span>Create Recipe</span>
              </button>
            </div>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search saved recipes..."
                    className={`w-full pl-10 py-3 border ${
                      theme === "light"
                        ? "border-gray-300 bg-white"
                        : "border-gray-600 bg-[#333] text-white"
                    } rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <img
                    src={searchIcon}
                    alt="Search"
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-60 ${
                      theme === "dark" ? "brightness-0 invert" : ""
                    }`}
                    style={{ background: "none" }}
                  />
                </div>
              </div>
              <div className="w-full md:w-64">
                <select
                  className={`w-full px-4 py-3 border ${
                    theme === "light"
                      ? "border-gray-300 bg-white"
                      : "border-gray-600 bg-[#333] text-white"
                  } rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent appearance-none outline-none`}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-12 text-lg text-gray-500">
              Loading...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-lg text-red-500">
              {error}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {paginatedRecipes.length === 0 ? (
                  <div className="col-span-full text-center text-gray-500 py-12">
                    No saved recipes found.
                  </div>
                ) : (
                  paginatedRecipes.map((recipe, idx) => (
                    <SavedRecipeCard key={recipe.id || idx} recipe={recipe} />
                  ))
                )}
              </div>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default SavedRecipes;
