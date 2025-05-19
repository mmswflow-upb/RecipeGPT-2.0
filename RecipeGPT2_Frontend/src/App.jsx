import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { RecipeBatchProvider } from "./contexts/RecipeBatchContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RecipeGenerator from "./pages/RecipeGenerator";
import RecipeDetails from "./pages/RecipeDetails";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import SavedRecipes from "./pages/SavedRecipes";
import SavedRecipeDetails from "./pages/SavedRecipeDetails";
import DiscoverRecipes from "./pages/DiscoverRecipes";
import "./App.css";

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <RecipeBatchProvider>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/generate"
                element={
                  <ProtectedRoute>
                    <RecipeGenerator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recipe/:id"
                element={
                  <ProtectedRoute>
                    <RecipeDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route path="/saved" element={<SavedRecipes />} />
              <Route
                path="/saved/recipe/:id"
                element={
                  <ProtectedRoute>
                    <SavedRecipeDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/discover"
                element={
                  <ProtectedRoute>
                    <DiscoverRecipes />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </RecipeBatchProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
