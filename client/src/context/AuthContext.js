// import React, {
//   createContext,
//   useReducer,
//   useEffect,
//   useCallback,
//   useContext,
//   useMemo,
// } from "react";
// import axios from "axios";
// import Cookies from "js-cookie";

// const AuthContext = createContext();

// const initialState = {
//   user: null,
//   isAuthenticated: false,
//   loading: true,
// };

// const authReducer = (state, action) => {
//   switch (action.type) {
//     case "LOGIN_SUCCESS":
//     case "USER_LOADED":
//       return {
//         ...state,
//         user: action.payload,
//         isAuthenticated: true,
//         loading: false,
//       };
//     case "LOGOUT_SUCCESS":
//     case "AUTH_ERROR":
//       return { ...state, user: null, isAuthenticated: false, loading: false };
//     default:
//       return state;
//   }
// };

// export const AuthProvider = ({ children }) => {
//   const [state, dispatch] = useReducer(authReducer, initialState);

//   /**
//    * ✅ Fetch Authenticated User
//    * - Reads token from cookies/local storage.
//    * - Sends request to backend to validate session.
//    */
//   const checkAuth = useCallback(async () => {
//     try {
//       let token = Cookies.get("token") || localStorage.getItem("token");

//       if (!token) {
//         console.warn("🚫 No token found. User is not authenticated.");
//         dispatch({ type: "AUTH_ERROR" });
//         return;
//       }

//       axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

//       const response = await axios.get(
//         `${
//           process.env.REACT_APP_API_URL || "http://localhost:4000"
//         }/api/users/checkAuth`,
//         { withCredentials: true }
//       );

//       if (response.data?.user) {
//         dispatch({ type: "USER_LOADED", payload: response.data.user });
//       } else {
//         throw new Error("User data not found.");
//       }
//     } catch (error) {
//       console.error(
//         "❌ Authentication check failed:",
//         error.response?.data?.message || error.message
//       );
//       dispatch({ type: "AUTH_ERROR" });
//       Cookies.remove("token");
//       localStorage.removeItem("token");
//     }
//   }, []);

//   /**
//    * ✅ Ensure User is Persisted on Page Reload
//    * - Loads from local storage first.
//    * - Verifies token with backend.
//    */
//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) {
//       try {
//         const { user, token } = JSON.parse(storedUser);
//         dispatch({ type: "LOGIN_SUCCESS", payload: user });

//         if (token) {
//           axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//         }
//       } catch (error) {
//         console.error("❌ Failed to parse user from localStorage:", error);
//         dispatch({ type: "AUTH_ERROR" });
//       }
//     } else {
//       checkAuth(); // Fetch user session
//     }
//   }, [checkAuth]);



//   /**
//    * ✅ Logout Function
//    * - Clears user session from cookies & local storage.
//    */
//   const logout = () => {
//     Cookies.remove("token");
//     localStorage.removeItem("user");
//     axios.defaults.headers.common["Authorization"] = null;
//     dispatch({ type: "LOGOUT_SUCCESS" });
//   };

//   // ✅ Memoize the context value to prevent unnecessary re-renders
//   const contextValue = useMemo(() => ({ state, dispatch, logout }), [state]);

//   useEffect(() => {
//     console.log("🔍 AuthProvider state updated:", state);
//   }, [state]);

//   return (
//     <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
//   );



// };

// export const useAuthContext = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuthContext must be used within an AuthProvider");
//   }
//   return context;
// };
import React, {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from "react";
import axios from "axios";
import Cookies from "js-cookie";

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
    case "AUTH_ERROR":
      return { ...state, user: null, isAuthenticated: false, loading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * ✅ Fetch Authenticated User from backend
   */
  const checkAuth = useCallback(async () => {
    try {
      let token = Cookies.get("token") || localStorage.getItem("token");

      if (!token) {
        console.warn("🚫 No token found. User is not authenticated.");
        dispatch({ type: "AUTH_ERROR" });
        return;
      }

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:4000"}/api/users/checkAuth`,
        { withCredentials: true }
      );

      if (response.data?.user && response.data.user._id) {
        console.log("✅ User loaded from API:", response.data.user);

        dispatch({ type: "USER_LOADED", payload: response.data.user });

        // Save user and token correctly
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("token", token);
      } else {
        throw new Error("User data not found.");
      }
    } catch (error) {
      console.error(
        "❌ Authentication check failed:",
        error.response?.data?.message || error.message
      );
      dispatch({ type: "AUTH_ERROR" });
      Cookies.remove("token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, []);

  /**
   * ✅ Ensure user is loaded from localStorage (if valid)
   */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);

        if (user && user._id) {
          console.log("✅ User loaded from localStorage:", user);

          dispatch({ type: "LOGIN_SUCCESS", payload: user });

          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
          console.warn("⚠️ Stored user invalid, re-checking auth...");
          checkAuth(); // Fallback to recheck
        }
      } catch (error) {
        console.error("❌ Failed to parse user from localStorage:", error);
        dispatch({ type: "AUTH_ERROR" });
        checkAuth(); // Fallback to recheck
      }
    } else {
      checkAuth();
    }
  }, [checkAuth]);

  /**
   * ✅ Logout function
   */
  const logout = () => {
    Cookies.remove("token");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    dispatch({ type: "LOGOUT_SUCCESS" });
  };

  const contextValue = useMemo(() => ({ state, dispatch, logout }), [state]);

  useEffect(() => {
    console.log("🔍 AuthProvider state updated:", state);
  }, [state]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
