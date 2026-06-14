import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { MyContext } from "../../App";

function getStoredUser() {
  try {
    const str = localStorage.getItem("user");
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
}

export default function AdminGuard({ children }) {
  const context = useContext(MyContext);
  const user = context?.user?.role ? context.user : getStoredUser();
  const role = user?.role;

  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
