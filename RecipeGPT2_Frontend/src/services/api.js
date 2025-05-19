import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear the token and user data, don't redirect
      localStorage.removeItem("token");
      localStorage.removeItem("user");
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
    const response = await api.get("/auth/validate");
    return response.data;
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
    return response.data;
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
    return response.data;
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
