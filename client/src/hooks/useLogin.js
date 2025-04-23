import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthContext();

  const loginUser = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, you would make an API call here
      // For demo purposes, we're simulating a successful login

      // Mock API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Example validation
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Mock successful login - in a real app, this would come from the server
      const userData = {
        id: "123456",
        name: "Demo User",
        email: email,
        role: "user",
      };

      // Use the login function from AuthContext
      const result = await login(userData);

      if (!result.success) {
        throw new Error(result.error || "Login failed");
      }

      return true;
    } catch (err) {
      setError(err.message || "An error occurred during login");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { loginUser, isLoading, error };
};
