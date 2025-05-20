import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { getDefaultImage } from "../utils/categoryImageMap";
import servingIcon from "../assets/logos/serving.png";
import clockIcon from "../assets/logos/clock.png";
import cookingIcon from "../assets/logos/cooking.png";
import starIcon from "../assets/logos/star.png";

const DiscoverRecipeCard = ({ recipe }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleViewDetails = (e) => {
    e.stopPropagation();
    navigate(`/recipe/${recipe.id}`, { state: { recipe } });
  };

  return (
    <div
      className={`rounded-lg shadow-lg border-transparent ${
        theme === "light" ? "bg-white" : "bg-[#222]"
      }`}
      style={{ cursor: "pointer" }}
    >
      <div className="relative">
        <img
          src={recipe.image || getDefaultImage(recipe.categories)}
          alt={recipe.title}
          className="w-full h-40 object-cover rounded-t-lg"
        />
      </div>

      <div className="p-4">
        <h2
          className={`text-xl font-bold mb-4 ${
            theme === "light" ? "text-black" : "text-white"
          }`}
        >
          {recipe.title}
        </h2>

        {/* Recipe Details */}
        <div className="space-y-6 mb-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              {recipe.estimatedPrepTime > 0 && (
                <div className="flex items-center space-x-2">
                  <img
                    src={clockIcon}
                    alt="Prep Time"
                    className="w-4 h-4 object-contain"
                    style={{
                      filter:
                        theme === "light"
                          ? "brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(90%)"
                          : "brightness(0) invert(1)",
                    }}
                  />
                  <span
                    className={
                      theme === "light" ? "text-gray-600" : "text-gray-300"
                    }
                  >
                    Prep: {recipe.estimatedPrepTime} mins
                  </span>
                </div>
              )}
              {recipe.estimatedCookingTime > 0 && (
                <div className="flex items-center space-x-2">
                  <img
                    src={cookingIcon}
                    alt="Cook Time"
                    className="w-4 h-4 object-contain"
                    style={{
                      filter:
                        theme === "light"
                          ? "brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(90%)"
                          : "brightness(0) invert(1)",
                    }}
                  />
                  <span
                    className={
                      theme === "light" ? "text-gray-600" : "text-gray-300"
                    }
                  >
                    Cook: {recipe.estimatedCookingTime} mins
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <img
                  src={servingIcon}
                  alt="Servings"
                  className="w-4 h-4 object-contain"
                  style={{
                    filter:
                      theme === "light"
                        ? "brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(90%)"
                        : "brightness(0) invert(1)",
                  }}
                />
                <span
                  className={
                    theme === "light" ? "text-gray-600" : "text-gray-300"
                  }
                >
                  {recipe.servings || "2"} servings
                </span>
              </div>
            </div>
            {recipe.categories && recipe.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recipe.categories.map((category, idx) => (
                  <span
                    key={idx}
                    className={`text-xs px-2 py-1 rounded-full ${
                      theme === "light"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Recipe Description */}
          <div className="pt-4">
            <p
              className={`text-sm line-clamp-2 ${
                theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
            >
              {recipe.description || "No description available."}
            </p>
          </div>

          {/* Rating and View Details Row */}
          <div className="pt-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <img
                src={starIcon}
                alt="Rating"
                className="w-5 h-5 object-contain"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(76%) sepia(61%) saturate(1012%) hue-rotate(358deg) brightness(103%) contrast(107%)",
                }}
              />
              <span className="text-lg font-medium text-[#FFB800]">
                {recipe.rating ? recipe.rating.toFixed(1) : "N/A"}
              </span>
            </div>
            <button
              onClick={handleViewDetails}
              className="px-3 py-1 rounded-md text-sm font-medium bg-[#E63946] text-white focus:outline-none border-none hover:bg-[#cc333f] transition-colors flex-shrink-0"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverRecipeCard;
