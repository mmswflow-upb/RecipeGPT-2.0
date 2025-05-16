import React, { createContext, useContext, useState } from "react";

const RecipeBatchContext = createContext();

export const RecipeBatchProvider = ({ children }) => {
  const [batchId, setBatchId] = useState(null);
  const [recipes, setRecipes] = useState([]);

  return (
    <RecipeBatchContext.Provider
      value={{ batchId, setBatchId, recipes, setRecipes }}
    >
      {children}
    </RecipeBatchContext.Provider>
  );
};

export const useRecipeBatch = () => useContext(RecipeBatchContext);
