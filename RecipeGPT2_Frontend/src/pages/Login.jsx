import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ThemedCheckbox from "../components/ThemedCheckbox";
import Alert from "../components/Alert";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      // Extract error message from Axios error response
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to login. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-col min-h-screen ${
        theme === "light"
          ? "bg-[#FFFDF9] text-[#1D1D1D]"
          : "bg-black text-white"
      }`}
    >
      <Navbar />

      <main
        id="login-container"
        className={`flex flex-1 items-center justify-center w-full pt-20 mb-12 ${
          theme === "light" ? "bg-[#FFFDF9]" : "bg-black"
        }`}
      >
        <div
          id="login-card"
          className={`rounded-lg shadow-lg p-8 w-full max-w-md ${
            theme === "light" ? "bg-white" : "bg-[#222]"
          }`}
        >
          <div className="text-center mb-8">
            <i className="fa-solid fa-utensils text-[#E63946] text-4xl mb-4"></i>
            <h1 className="text-2xl font-bold">Welcome Back!</h1>
            <p className="mt-2 text-[#6C757D]">
              Sign in to your RecipeGPT account
            </p>
          </div>

          {error && (
            <Alert type="error" message={error} onClose={() => setError("")} />
          )}

          <form
            id="login-form"
            className="space-y-6"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <div className="space-y-2 text-left">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none placeholder-gray-400 ${
                  theme === "light"
                    ? "bg-white text-black"
                    : "bg-[#333] text-white"
                }`}
                placeholder="Enter your email"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2 text-left">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none placeholder-gray-400 ${
                    theme === "light"
                      ? "bg-white text-black"
                      : "bg-[#333] text-white"
                  }`}
                  placeholder="Enter your password"
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#E63946] text-sm focus:outline-none bg-transparent border-none shadow-none"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <ThemedCheckbox
                id="remember"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-[#6C757D]"
              >
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E63946] text-white py-2 px-4 rounded-lg hover:bg-[#cc333f] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#6C757D]">
              Don't have an account?
              <Link
                to="/register"
                className="text-[#E63946] hover:underline cursor-pointer ml-1"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
