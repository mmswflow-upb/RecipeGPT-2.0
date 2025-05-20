import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { PageLayout } from "../components/PageLayout";
import { DiscoverRecipeCard } from "../components/DiscoverRecipeCard";
import { recipeService } from "../services/recipeService";

const Discover = () => {
  const { theme } = useTheme();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getPublicRecipes({
        category: selectedCategory,
        text: searchQuery,
      });
      setRecipes(data);
    } catch (error) {
      setError("Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [selectedCategory, searchQuery]);

  const handleRecipeSaved = () => {
    // Reload recipes after saving
    fetchRecipes();
  };

  return (
    <PageLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <DiscoverRecipeCard
            key={recipe.id}
            recipe={recipe}
            onRecipeSaved={handleRecipeSaved}
          />
        ))}
      </div>
    </PageLayout>
  );
};

export default Discover;
