import { Navigate, useParams } from "react-router-dom";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function EditCategory() {
  const { id } = useParams();
  return <Navigate to={`${ADMIN_BASE}/category?edit=${encodeURIComponent(id)}`} replace />;
}
