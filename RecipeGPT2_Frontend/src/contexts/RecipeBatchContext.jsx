import React, { createContext, useContext, useState } from "react";

const RecipeBatchContext = createContext();

export const RecipeBatchProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleRecipeSelection = (index) => {
    setSelectedRecipes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const selectAllRecipes = () => {
    setSelectedRecipes(recipes.map((_, idx) => idx));
  };

  const clearSelection = () => {
    setSelectedRecipes([]);
  };

  const clearRecipes = () => {
    setRecipes([]);
    setSelectedRecipes([]);
  };

  return (
    <RecipeBatchContext.Provider
      value={{
        recipes,
        setRecipes,
        selectedRecipes,
        setSelectedRecipes,
        toggleRecipeSelection,
        selectAllRecipes,
        clearSelection,
        clearRecipes,
        currentPage,
        setCurrentPage,
      }}
    >
      {children}
    </RecipeBatchContext.Provider>
  );
};

export const useRecipeBatch = () => useContext(RecipeBatchContext);
