import { Navigate } from "react-router-dom";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function AddCoupon() {
  return <Navigate to={`${ADMIN_BASE}/promotions/coupons?action=add`} replace />;
}
