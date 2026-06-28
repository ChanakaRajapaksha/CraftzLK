import { Navigate } from "react-router-dom";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function AddArtisan() {
  return <Navigate to={`${ADMIN_BASE}/artisans?action=add`} replace />;
}
