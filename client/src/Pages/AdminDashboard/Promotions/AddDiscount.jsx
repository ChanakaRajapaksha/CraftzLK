import { Navigate, useSearchParams } from "react-router-dom";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function AddDiscount() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const query = type ? `?action=add&type=${encodeURIComponent(type)}` : "?action=add";
  return <Navigate to={`${ADMIN_BASE}/promotions/discounts${query}`} replace />;
}
