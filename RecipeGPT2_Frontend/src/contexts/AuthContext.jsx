import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there's a token and validate it
    if (token) {
      validateToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      // TODO: Implement token validation with your backend
      // const response = await apiService.validateToken(token);
      // if (response.valid) {
      //   setUser(response.user);
      // } else {
      //   logout();
      // }
      setLoading(false);
    } catch (error) {
      console.error("Token validation failed:", error);
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      // TODO: Implement login with your backend
      // const response = await apiService.login(email, password);
      // const { token, user } = response;
      // localStorage.setItem('token', token);
      // setToken(token);
      // setUser(user);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (email, password) => {
    try {
      // TODO: Implement registration with your backend
      // const response = await apiService.register(email, password);
      // const { token, user } = response;
      // localStorage.setItem('token', token);
      // setToken(token);
      // setUser(user);
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
