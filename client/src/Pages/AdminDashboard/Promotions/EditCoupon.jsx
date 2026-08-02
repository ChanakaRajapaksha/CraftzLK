import { Navigate, useParams } from "react-router-dom";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function EditCoupon() {
  const { id } = useParams();
  return (
    <Navigate to={`${ADMIN_BASE}/promotions/coupons?edit=${encodeURIComponent(id)}`} replace />
  );
}
