import React, { createContext, useContext, useState } from "react";

const RecipeBatchContext = createContext();

export const RecipeBatchProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);

  return (
    <RecipeBatchContext.Provider value={{ recipes, setRecipes }}>
      {children}
    </RecipeBatchContext.Provider>
  );
};

export const useRecipeBatch = () => useContext(RecipeBatchContext);
