export const getDefaultImage = (categories) => {
  if (!categories || categories.length === 0)
    return "https://via.placeholder.com/400x300";
  const category = categories[0].toLowerCase();
  switch (category) {
    case "asian cooking":
      return "/assets/default-recipes-images/asian.png";
    case "mediterranean cooking":
      return "/assets/default-recipes-images/mediterranean.png";
    case "latin american cooking":
      return "/assets/default-recipes-images/latin-american.png";
    case "middle eastern & north african cooking":
      return "/assets/default-recipes-images/middle-eastern-north-african.png";
    case "indian & south asian cooking":
      return "/assets/default-recipes-images/indian-south-asian.png";
    case "european continental cooking":
      return "/assets/default-recipes-images/european.png";
    case "african cooking":
      return "/assets/default-recipes-images/african.png";
    case "american cooking":
      return "/assets/default-recipes-images/american.png";
    case "vegetarian & plant-based":
      return "/assets/default-recipes-images/vegeterian-plant-based.png";
    case "vegan":
      return "/assets/default-recipes-images/vegan.png";
    case "gluten-free":
      return "/assets/default-recipes-images/gluten-free.png";
    case "low-carb & keto":
      return "/assets/default-recipes-images/low-carb-keto.png";
    case "paleo & whole30":
      return "/assets/default-recipes-images/paleo-whole30.png";
    case "seafood & pescatarian":
      return "/assets/default-recipes-images/seafood-pescatarian.png";
    case "desserts & baking":
      return "/assets/default-recipes-images/deserts-baking.png";
    case "breakfast & brunch":
      return "/assets/default-recipes-images/breakfast-brunch.png";
    case "street food & snacks":
      return "/assets/default-recipes-images/streetfood-snacks.png";
    case "soups & stews":
      return "/assets/default-recipes-images/soups-stews.png";
    case "salads & grain bowls":
      return "/assets/default-recipes-images/salads-grain-bowls.png";
    case "fusion & modernist":
      return "/assets/default-recipes-images/fusion-modernist.png";
    case "halal":
      return "/assets/default-recipes-images/halal.png";
    case "beverages":
      return "/assets/default-recipes-images/beverages.png";
    default:
      return "https://via.placeholder.com/400x300";
  }
};
