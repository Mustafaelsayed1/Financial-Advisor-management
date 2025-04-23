import { useAuthContext } from "../context/AuthContext";

export const useLogout = () => {
  const { dispatch } = useAuthContext();

  const logout = () => {
    // Remove user from local storage
    localStorage.removeItem("user");

    // Update auth context
    dispatch({ type: "LOGOUT" });
  };

  return { logout };
};
