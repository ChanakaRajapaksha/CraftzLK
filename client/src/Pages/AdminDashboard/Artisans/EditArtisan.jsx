import { Navigate, useParams } from "react-router-dom";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function EditArtisan() {
  const { id } = useParams();
  return (
    <Navigate to={`${ADMIN_BASE}/artisans?edit=${encodeURIComponent(id)}`} replace />
  );
}
