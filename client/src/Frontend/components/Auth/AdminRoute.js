import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.user?.role === "admin";

  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/Dashboard" replace />;

  return children;
};

export default AdminRoute;
