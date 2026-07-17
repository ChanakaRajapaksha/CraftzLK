import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { MyContext } from "../../App";
import { useAppSelector } from "../../store/hooks";

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
  const isAuthInitialized = useAppSelector((state) => state.auth.isAuthInitialized);
  const user = context?.user?.role ? context.user : getStoredUser();
  const role = user?.role;

  if (!isAuthInitialized) {
    return null;
  }

  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
