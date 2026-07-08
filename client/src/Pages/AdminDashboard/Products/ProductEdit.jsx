import { Navigate, useParams } from "react-router-dom";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function ProductEdit() {
  const { id } = useParams();
  return (
    <Navigate to={`${ADMIN_BASE}/products?edit=${encodeURIComponent(id)}`} replace />
  );
}
