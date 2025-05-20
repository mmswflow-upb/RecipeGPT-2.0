import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log the full request URL and payload

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses

    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Try to validate the token
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await api.get("/api/auth/validate-token", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.data.valid) {
            // Token is invalid, log out
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }
        }
      } catch (validationError) {
        // If validation fails, log out
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const response = await api.post("/api/auth/login", { email, password });
    const { idToken, ...userData } = response.data;

    // Store the token and user data
    localStorage.setItem("token", idToken);
    localStorage.setItem("user", JSON.stringify(userData));

    return response.data;
  },

  register: async (email, password, username, publisher) => {
    const response = await api.post("/api/auth/register", {
      email,
      password,
      username,
      publisher,
    });
    // Do not store token or user in localStorage after registration
    return response.data;
  },

  logout: () => {
    // Preserve theme preference if set
    const theme = localStorage.getItem("theme");
    localStorage.clear();
    if (theme) {
      localStorage.setItem("theme", theme);
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  validateToken: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;

      const response = await api.post(
        "/api/auth/validate-token",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.valid;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  },
};

export const userService = {
  getProfile: async () => {
    const response = await api.get("/api/users/profile");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put("/api/users/profile", data);
    return response.data;
  },

  getRecipeById: async (id) => {
    const response = await api.get(`/api/recipes/${id}`);
    return response.data;
  },

  getAIResponse: async (recipeId, message, conversationSummary) => {
    try {
      const response = await api.post("/api/queryRecipe", {
        recipeId,
        userRequest: message,
        conversationSummary,
      });

      if (!response.data.responseToUser || !response.data.summaryOfConvo) {
        throw new Error("Invalid response format from server");
      }

      return {
        message: response.data.responseToUser,
        summary: response.data.summaryOfConvo,
      };
    } catch (error) {
      throw error;
    }
  },

  getPublisherProfile: async (userId) => {
    try {
      const response = await fetch(
        `${API_URL}/fetchPublisherProfile?userId=${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch publisher profile");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching publisher profile:", error);
      throw error;
    }
  },

  saveRecipes: async (recipeIds) => {
    const response = await api.put("/api/users/saved-recipes", {
      recipeIds: recipeIds,
    });
    return response.data;
  },

  deleteSavedRecipes: async (recipeIds) => {
    const response = await api.post("/api/users/delete-saved-recipes", {
      recipeIds: recipeIds,
    });
    return response.data;
  },

  rateRecipe: async (recipeId, rating) => {
    const response = await api.post(
      `/api/rateRecipe?recipeId=${recipeId}&rating=${rating}`
    );
    return response.data;
  },

  deleteRating: async (recipeId) => {
    const response = await api.delete(`/api/deleteRating?recipeId=${recipeId}`);
    return response.data;
  },
};

export const recipeService = {
  getRecipes: async () => {
    const response = await api.get("/recipes");
    return response.data;
  },

  getRecipe: async (id) => {
    const response = await api.get(`/recipes/${id}`);
    return response.data;
  },

  createRecipe: async (data) => {
    const response = await api.post("/recipes", data);
    return response.data;
  },

  updateRecipe: async (id, data) => {
    const response = await api.put(`/recipes/${id}`, data);
    return response.data;
  },

  deleteRecipe: async (id) => {
    const response = await api.delete(`/recipes/${id}`);
    return response.data;
  },

  generateRecipe: async (prompt) => {
    const response = await api.post("/recipes/generate", { prompt });
    return response.data;
  },

  /**
   * Fetch saved recipes for the authenticated user
   * @param {Object} params - Optional query params: { category, text }
   * @returns {Promise<Array>} Array of saved recipes
   */
  getSavedRecipes: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.append("category", params.category);
    if (params.text) query.append("text", params.text);
    const response = await api.get(
      `/api/recipes/saved${query.toString() ? `?${query.toString()}` : ""}`
    );

    // Fetch user data for each recipe
    const recipesWithUserData = await Promise.all(
      response.data.map(async (recipe) => {
        try {
          const userResponse = await api.get(
            `/api/fetchPublisherProfile?userId=${recipe.userId}`
          );
          const userData = userResponse.data;
          return {
            ...recipe,
            publisherId: recipe.userId,
            publisherName: userData.username,
            publisherProfilePic: userData.profile_pic,
            publisherEmail: userData.email,
            publisherBio: userData.bio,
            publisherPreferences: userData.preferences,
          };
        } catch (error) {
          console.error(
            `Error fetching user data for recipe ${recipe.id}:`,
            error
          );
          return {
            ...recipe,
            publisherId: recipe.userId,
            publisherName: "Unknown User",
            publisherProfilePic: null,
            publisherEmail: null,
            publisherBio: null,
            publisherPreferences: [],
          };
        }
      })
    );

    return recipesWithUserData;
  },

  getPublicRecipes: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.append("category", params.category);
    if (params.text) query.append("text", params.text);
    const response = await api.get(
      `/api/recipes/public${query.toString() ? `?${query.toString()}` : ""}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    // Fetch user data for each recipe
    const recipesWithUserData = await Promise.all(
      response.data.map(async (recipe) => {
        try {
          const userResponse = await api.get(
            `/api/fetchPublisherProfile?userId=${recipe.userId}`
          );
          const userData = userResponse.data;
          return {
            ...recipe,
            publisherId: recipe.userId,
            publisherName: userData.username,
            publisherProfilePic: userData.profile_pic,
            publisherEmail: userData.email,
            publisherBio: userData.bio,
            publisherPreferences: userData.preferences,
          };
        } catch (error) {
          console.error(
            `Error fetching user data for recipe ${recipe.id}:`,
            error
          );
          return {
            ...recipe,
            publisherId: recipe.userId,
            publisherName: "Unknown User",
            publisherProfilePic: null,
            publisherEmail: null,
            publisherBio: null,
            publisherPreferences: [],
          };
        }
      })
    );

    return recipesWithUserData;
  },
};

const API_BASE_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8080";

/**
 * Generate recipes based on a query
 * @param {string} query - The recipe query
 * @param {number} count - Number of recipes to generate
 * @returns {Promise<{recipes: Array, batchId: string}>}
 */
export const generateRecipes = async (query, count) => {
  const params = new URLSearchParams({
    recipeQuery: query,
    numberOfRecipes: count,
  });

  const response = await fetch(
    `${API_BASE_URL}/api/getRecipes?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to generate recipes");
  }

  return response.json();
};

export default api;
