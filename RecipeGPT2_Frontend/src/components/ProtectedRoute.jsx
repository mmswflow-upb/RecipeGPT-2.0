import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "../services/api";

const ProtectedRoute = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const validateToken = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsValid(false);
          setIsValidating(false);
          return;
        }

        const isValid = await authService.validateToken();
        setIsValid(isValid);
      } catch (error) {
        console.error("Token validation error:", error);
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [location.pathname]);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E63946]"></div>
      </div>
    );
  }

  if (!isValid) {
    // Clear any invalid tokens
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
