import { useAuthContext } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      // Call the logout endpoint
      await axios.post(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:4000"
        }/api/users/logout`,
        {},
        {
          withCredentials: true,
        }
      );

      // Remove user from local storage
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // Clear axios default headers
      delete axios.defaults.headers.common["Authorization"];

      // Update auth context
      dispatch({ type: "LOGOUT_SUCCESS" });

      // Navigate to home page
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if the server request fails, we should still clear local data
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      dispatch({ type: "LOGOUT_SUCCESS" });
      navigate("/");
    }
  };

  return { logout };
};
