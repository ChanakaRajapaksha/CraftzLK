import { Navigate, useSearchParams } from "react-router-dom";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function AddCategory() {
  const [searchParams] = useSearchParams();
  const parent = searchParams.get("parent");
  const target = parent
    ? `${ADMIN_BASE}/category?action=add&parent=${encodeURIComponent(parent)}`
    : `${ADMIN_BASE}/category?action=add`;

  return <Navigate to={target} replace />;
}
