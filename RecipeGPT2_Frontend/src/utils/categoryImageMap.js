const BASE_PATH = "/public/assets/default-recipes-images";

export const getDefaultImage = (categories) => {
  if (!categories || categories.length === 0)
    return "https://via.placeholder.com/400x300";
  const category = categories[0].toLowerCase();
  switch (category) {
    case "asian cooking":
      return `${BASE_PATH}/asian.png`;
    case "mediterranean cooking":
      return `${BASE_PATH}/mediterranean.png`;
    case "latin american cooking":
      return `${BASE_PATH}/latin-american.png`;
    case "middle eastern & north african cooking":
      return `${BASE_PATH}/middle-eastern-north-african.png`;
    case "indian & south asian cooking":
      return `${BASE_PATH}/indian-south-asian.png`;
    case "european continental cooking":
      return `${BASE_PATH}/european.png`;
    case "african cooking":
      return `${BASE_PATH}/african.png`;
    case "american cooking":
      return `${BASE_PATH}/american.png`;
    case "vegetarian & plant-based":
      return `${BASE_PATH}/vegeterian-plant-based.png`;
    case "vegan":
      return `${BASE_PATH}/vegan.png`;
    case "gluten-free":
      return `${BASE_PATH}/gluten-free.png`;
    case "low-carb & keto":
      return `${BASE_PATH}/low-carb-keto.png`;
    case "paleo & whole30":
      return `${BASE_PATH}/paleo-whole30.png`;
    case "seafood & pescatarian":
      return `${BASE_PATH}/seafood-pescatarian.png`;
    case "desserts & baking":
      return `${BASE_PATH}/deserts-baking.png`;
    case "breakfast & brunch":
      return `${BASE_PATH}/breakfast-brunch.png`;
    case "street food & snacks":
      return `${BASE_PATH}/streetfood-snacks.png`;
    case "soups & stews":
      return `${BASE_PATH}/soups-stews.png`;
    case "salads & grain bowls":
      return `${BASE_PATH}/salads-grain-bowls.png`;
    case "fusion & modernist":
      return `${BASE_PATH}/fusion-modernist.png`;
    case "halal":
      return `${BASE_PATH}/halal.png`;
    case "beverages":
      return `${BASE_PATH}/beverages.png`;
    default:
      return "https://via.placeholder.com/400x300";
  }
};
