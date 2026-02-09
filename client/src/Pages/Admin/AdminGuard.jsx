import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { MyContext } from "../../App";

/**
 * Protects admin routes: only allows access if user is logged in and role is "admin".
 * Uses role from context (stored in localStorage on login).
 */
export default function AdminGuard({ children }) {
  const context = useContext(MyContext);
  const location = useLocation();

  const user = context?.user;
  let role = user?.role;
  if (role == null) {
    try {
      const u = localStorage.getItem("user");
      role = u ? JSON.parse(u).role : null;
    } catch {
      role = null;
    }
  }

  if (role !== "admin") {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}
