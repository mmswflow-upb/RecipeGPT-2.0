package com.example.recipegpt2_server;

import com.example.recipegpt2_server.model.Recipe;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class RecipeModelTest {
    @Test
    void testToMapAndFromMap() {
        Recipe recipe = new Recipe();
        recipe.setId("r1");
        recipe.setTitle("Pasta");
        recipe.setDescription("Delicious pasta");
        recipe.setCategories(Arrays.asList("Italian", "Dinner"));
        recipe.setIngredients(Arrays.asList("Pasta", "Tomato Sauce"));
        recipe.setInstructions(Arrays.asList("Boil pasta", "Add sauce"));
        recipe.setEstimatedCookingTime(20);
        recipe.setEstimatedPrepTime(10);
        recipe.setServings(2);
        recipe.setUserId("u1");
        recipe.setPublic(true);
        recipe.setImage("img.png");
        recipe.setRating(4.5);

        Map<String, Object> map = recipe.toMap();
        assertEquals("Pasta", map.get("title"));
        assertEquals("Delicious pasta", map.get("description"));
        assertEquals(Arrays.asList("Italian", "Dinner"), map.get("categories"));
        assertEquals(Arrays.asList("Pasta", "Tomato Sauce"), map.get("ingredients"));
        assertEquals(Arrays.asList("Boil pasta", "Add sauce"), map.get("instructions"));
        assertEquals(20, map.get("estimatedCookingTime"));
        assertEquals(10, map.get("estimatedPrepTime"));
        assertEquals(2, map.get("servings"));
        assertEquals("u1", map.get("userId"));
        assertEquals(true, map.get("public"));
        assertEquals("img.png", map.get("image"));
        assertEquals(4.5, map.get("rating"));

        Recipe fromMapRecipe = Recipe.fromMap(map, "r1");
        assertEquals(recipe.getTitle(), fromMapRecipe.getTitle());
        assertEquals(recipe.getDescription(), fromMapRecipe.getDescription());
        assertEquals(recipe.getCategories(), fromMapRecipe.getCategories());
        assertEquals(recipe.getIngredients(), fromMapRecipe.getIngredients());
        assertEquals(recipe.getInstructions(), fromMapRecipe.getInstructions());
        assertEquals(recipe.getEstimatedCookingTime(), fromMapRecipe.getEstimatedCookingTime());
        assertEquals(recipe.getEstimatedPrepTime(), fromMapRecipe.getEstimatedPrepTime());
        assertEquals(recipe.getServings(), fromMapRecipe.getServings());
        assertEquals(recipe.getUserId(), fromMapRecipe.getUserId());
        assertEquals(recipe.isPublic(), fromMapRecipe.isPublic());
        assertEquals(recipe.getImage(), fromMapRecipe.getImage());
        assertEquals(recipe.getRating(), fromMapRecipe.getRating());
    }
}