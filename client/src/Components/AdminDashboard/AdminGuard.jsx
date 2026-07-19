import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { MyContext } from "../../App";
import { useAppSelector } from "../../store/hooks";
import { selectIsLoggedIn } from "../../store/slices/authSlice";

function getStoredUser() {
  try {
    const str = localStorage.getItem("user");
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
}

export default function AdminGuard({ children }) {
  const location = useLocation();
  const context = useContext(MyContext);
  const isAuthInitialized = useAppSelector((state) => state.auth.isAuthInitialized);
  const isLogin = useAppSelector(selectIsLoggedIn);
  const user = context?.user?.role ? context.user : getStoredUser();
  const role = user?.role;

  if (!isAuthInitialized) {
    return null;
  }

  if (!isLogin) {
    return <Navigate to="/signIn" state={{ from: location.pathname }} replace />;
  }

  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
