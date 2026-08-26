import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { MyContext } from "../../App";
import { useAppSelector } from "../../store/hooks";
import { selectIsLoggedIn } from "../../store/slices/authSlice";
import AdminBootLoader from "./AdminBootLoader";

const BOOT_MIN_MS = 520;

function getStoredUser() {
  try {
    const str = localStorage.getItem("user");
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function AdminGuard({ children }) {
  const location = useLocation();
  const context = useContext(MyContext);
  const isAuthInitialized = useAppSelector((state) => state.auth.isAuthInitialized);
  const isLogin = useAppSelector(selectIsLoggedIn);
  const user = context?.user?.role ? context.user : getStoredUser();
  const role = user?.role;
  const [minHoldDone, setMinHoldDone] = useState(false);

  useEffect(() => {
    const delay = prefersReducedMotion() ? 80 : BOOT_MIN_MS;
    const timer = window.setTimeout(() => setMinHoldDone(true), delay);
    return () => window.clearTimeout(timer);
  }, []);

  if (!isAuthInitialized || !minHoldDone) {
    return <AdminBootLoader />;
  }

  if (!isLogin) {
    return <Navigate to="/signIn" state={{ from: location.pathname }} replace />;
  }

  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
