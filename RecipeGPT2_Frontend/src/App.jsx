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
import ProtectedRoute from "./components/ProtectedRoute";
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </RecipeBatchProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
