import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { selectIsLoggedIn } from "../store/slices/authSlice";

export default function AuthGuard({ children }) {
  const location = useLocation();
  const isAuthInitialized = useAppSelector((state) => state.auth.isAuthInitialized);
  const isLogin = useAppSelector(selectIsLoggedIn);

  if (!isAuthInitialized) {
    return null;
  }

  if (!isLogin) {
    return <Navigate to="/signIn" state={{ from: location.pathname }} replace />;
  }

  return children;
}
