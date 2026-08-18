import { Navigate, useParams } from "react-router-dom";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function EditShippingMethod() {
  const { id } = useParams();
  return <Navigate to={`${ADMIN_BASE}/shipping/methods?edit=${encodeURIComponent(id)}`} replace />;
}
