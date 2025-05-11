import React, {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from "react";
import axios from "axios";

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
    case "USER_LOADED":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case "LOGOUT_SUCCESS":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    case "AUTH_ERROR":
      return { ...state, user: null, isAuthenticated: false, loading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (userData) => {
    try {
      const response = await axios.post(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:4000"
        }/api/users/login`,
        userData,
        { withCredentials: true }
      );

      const { token, user } = response.data;

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify({ token, user }));
      localStorage.setItem("token", token);

      // Set authorization header for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Update context state
      dispatch({ type: "LOGIN_SUCCESS", payload: user });

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (token && !state.isAuthenticated) {
        // Set authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const response = await axios.get(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:4000"
          }/api/users/checkAuth`,
          { withCredentials: true }
        );
        const { user } = response.data;
        if (user) {
          dispatch({ type: "USER_LOADED", payload: user });
        } else {
          dispatch({ type: "AUTH_ERROR" });
        }
      } else if (!token) {
        dispatch({ type: "AUTH_ERROR" });
      }
    } catch (error) {
      console.error("Auth check failed", error);
      dispatch({ type: "AUTH_ERROR" });
    }
  }, [state.isAuthenticated]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const { token, user } = JSON.parse(storedUser);
        dispatch({ type: "LOGIN_SUCCESS", payload: user });

        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        dispatch({ type: "AUTH_ERROR" });
      }
    } else {
      checkAuth();
    }
  }, [checkAuth]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ state, dispatch, login }), [state]);

  useEffect(() => {
    console.log("AuthProvider state:", state);
  }, [state]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  console.log("AuthContext:", context);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
