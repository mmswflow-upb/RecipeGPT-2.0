import React from "react";

const RecipeCard = ({ recipe, selected, onSelect, index }) => {
  return (
    <div
      className={`rounded-lg shadow-lg p-4 border-2 transition-colors duration-150 ${
        selected ? "border-[#E63946] bg-red-50" : "border-transparent bg-white"
      }`}
      onClick={() => onSelect(index)}
      style={{ cursor: "pointer" }}
    >
      <h2 className="text-xl font-bold mb-2">{recipe.title}</h2>
      <img
        src={recipe.image || "https://via.placeholder.com/400x300"}
        alt={recipe.title}
        className="w-full h-40 object-cover rounded mb-2"
      />
      <div className="mb-2 text-sm text-gray-600">
        Servings: {recipe.servings}
      </div>
      <div className="mb-2 text-sm text-gray-600">
        Time: {recipe.estimatedCookingTime} min
      </div>
      <div className="mb-2 text-sm text-gray-600">
        Categories: {recipe.categories?.join(", ")}
      </div>
      <div className="mb-2 text-sm text-gray-600">
        Ingredients: {recipe.ingredients?.join(", ")}
      </div>
      <ol className="list-decimal ml-5 text-sm text-gray-700 mb-2">
        {recipe.instructions?.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
      <div
        className={`mt-2 font-semibold ${
          selected ? "text-[#E63946]" : "text-gray-400"
        }`}
      >
        {selected ? "Selected" : "Click to select"}
      </div>
    </div>
  );
};

export default RecipeCard;
