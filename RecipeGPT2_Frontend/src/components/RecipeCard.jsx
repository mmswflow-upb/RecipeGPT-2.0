import React from "react";
import { getDefaultImage } from "../utils/categoryImageMap";

const RecipeCard = ({ recipe, selected, onSelect, index }) => {
  return (
    <div
      className={`rounded-lg shadow-lg p-4 border-2 transition-colors duration-150 ${
        selected
          ? "border-[#E63946] bg-red-50 dark:bg-red-900"
          : "border-transparent bg-white dark:bg-gray-800"
      }`}
      onClick={() => onSelect(index)}
      style={{ cursor: "pointer" }}
    >
      <h2 className="text-xl font-bold mb-2 dark:text-white">{recipe.title}</h2>
      <img
        src={recipe.image || getDefaultImage(recipe.categories)}
        alt={recipe.title}
        className="w-full h-40 object-cover rounded mb-2"
      />
      <div
        className={`mt-2 font-semibold ${
          selected ? "text-[#E63946]" : "text-gray-400 dark:text-gray-300"
        }`}
      >
        {selected ? "Selected" : "Click to select"}
      </div>
    </div>
  );
};

export default RecipeCard;
