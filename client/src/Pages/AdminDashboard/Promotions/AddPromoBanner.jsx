import { Navigate } from "react-router-dom";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function AddPromoBanner() {
  return <Navigate to={`${ADMIN_BASE}/promotions/banners?action=add`} replace />;
}
