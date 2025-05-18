import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import ThemedCheckbox from "../components/ThemedCheckbox";
import Alert from "../components/Alert";
import RedirectIfAuthenticated from "../components/RedirectIfAuthenticated";
import PageLayout from "../components/PageLayout";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    isPublisher: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.email,
        formData.password,
        formData.username,
        formData.isPublisher
      );
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage =
        err.response?.data ||
        err.message ||
        "Failed to register. Please try again.";
      setError(
        typeof errorMessage === "string"
          ? errorMessage
          : errorMessage.toString()
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <RedirectIfAuthenticated>
      <PageLayout>
        <div className="flex flex-1 items-center justify-center w-full mb-12">
          <div
            id="register-card"
            className={`rounded-lg shadow-lg p-8 w-full max-w-md ${
              theme === "light" ? "bg-white" : "bg-[#222]"
            }`}
          >
            <div className="text-center mb-8">
              <i className="fa-solid fa-utensils text-[#E63946] text-4xl mb-4"></i>
              <h1 className="text-2xl font-bold">Create Account</h1>
              <p className="mt-2 text-[#6C757D]">
                Join RecipeGPT and start creating amazing recipes
              </p>
            </div>

            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError("")}
              />
            )}

            <form
              id="register-form"
              className="space-y-6"
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              <div className="space-y-2 text-left">
                <label htmlFor="username" className="block text-sm font-medium">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none placeholder-gray-400 ${
                    theme === "light"
                      ? "bg-white text-black"
                      : "bg-[#333] text-white"
                  }`}
                  placeholder="Choose a username"
                  autoComplete="off"
                />
              </div>

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
                    placeholder="Create a password"
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

              <div className="space-y-2 text-left">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none placeholder-gray-400 ${
                      theme === "light"
                        ? "bg-white text-black"
                        : "bg-[#333] text-white"
                    }`}
                    placeholder="Confirm your password"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#E63946] text-sm focus:outline-none bg-transparent border-none shadow-none"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <ThemedCheckbox
                  id="isPublisher"
                  name="isPublisher"
                  checked={formData.isPublisher}
                  onChange={handleChange}
                />
                <label
                  htmlFor="isPublisher"
                  className="ml-2 block text-sm text-[#6C757D]"
                >
                  I want to be a recipe publisher
                </label>
              </div>

              <div className="flex items-center">
                <ThemedCheckbox
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                />
                <label
                  htmlFor="agreeToTerms"
                  className="ml-2 block text-sm text-[#6C757D]"
                >
                  I agree to the{" "}
                  <Link to="/terms" className="text-[#E63946] hover:underline">
                    Terms and Conditions
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E63946] text-white py-2 px-4 rounded-lg hover:bg-[#cc333f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none border-none"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[#6C757D]">
                Already have an account?
                <Link
                  to="/login"
                  className="text-[#E63946] hover:underline cursor-pointer ml-1"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </PageLayout>
    </RedirectIfAuthenticated>
  );
};

export default Register;
