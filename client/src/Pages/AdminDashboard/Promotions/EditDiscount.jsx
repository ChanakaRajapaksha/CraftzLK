import { Navigate, useParams } from "react-router-dom";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function EditDiscount() {
  const { id } = useParams();
  return (
    <Navigate to={`${ADMIN_BASE}/promotions/discounts?edit=${encodeURIComponent(id)}`} replace />
  );
}
