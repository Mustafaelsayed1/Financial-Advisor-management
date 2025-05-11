import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";

export const useLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthContext();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Example validation
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Send login request to server
      const result = await login({ email, password });

      if (!result.success) {
        throw new Error(result.error || "Login failed");
      }

      setSuccessMessage("Login successful!");
      return true;
    } catch (err) {
      setErrorMessage(err.message || "An error occurred during login");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    errorMessage,
    successMessage,
    isLoading,
    handleLogin,
  };
};
